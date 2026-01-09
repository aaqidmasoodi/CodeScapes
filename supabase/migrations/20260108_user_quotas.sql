-- =============================================================================
-- Migration: User Quotas for Scapper AI
-- Description: Per-user usage tracking with tiered limits for Scapper prompts
-- =============================================================================

-- Create user_quotas table
create table if not exists public.user_quotas (
  user_id uuid references auth.users(id) on delete cascade primary key,
  tier text default 'free' check (tier in ('free', 'pro')),
  prompts_used integer default 0,
  prompts_limit integer default 3,  -- Free tier: 3 prompts/day
  last_reset_at timestamp with time zone default now(),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.user_quotas enable row level security;

-- Policy: Users can only READ their own quota (never write directly)
create policy "Users can view own quota" on public.user_quotas
  for select using (auth.uid() = user_id);

-- NO insert/update/delete policies for users - all writes go through RPC functions

-- =============================================================================
-- RPC Function: Check and Increment Quota
-- Called when user sends a NEW prompt (not follow-ups)
-- Returns: { allowed: boolean, prompts_used: number, prompts_limit: number, tier: string }
-- =============================================================================

create or replace function check_and_increment_quota()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quota record;
  v_now timestamp with time zone := now();
  v_today date := current_date;
  v_last_reset date;
begin
  -- Get or create quota record for current user
  select * into v_quota from user_quotas where user_id = auth.uid();
  
  if not found then
    -- Create quota record for new user
    insert into user_quotas (user_id, tier, prompts_used, prompts_limit, last_reset_at)
    values (auth.uid(), 'free', 0, 3, v_now)
    returning * into v_quota;
  end if;
  
  -- Check for daily reset (free tier resets daily)
  v_last_reset := v_quota.last_reset_at::date;
  
  if v_quota.tier = 'free' and v_today > v_last_reset then
    -- Reset counter for new day
    update user_quotas
    set prompts_used = 0, last_reset_at = v_now, updated_at = v_now
    where user_id = auth.uid()
    returning * into v_quota;
  end if;
  
  -- Pro tier: unlimited (always allowed)
  if v_quota.tier = 'pro' then
    -- Still increment for tracking, but always allow
    update user_quotas
    set prompts_used = prompts_used + 1, updated_at = v_now
    where user_id = auth.uid();
    
    return jsonb_build_object(
      'allowed', true,
      'prompts_used', v_quota.prompts_used + 1,
      'prompts_limit', -1,  -- -1 indicates unlimited
      'tier', 'pro'
    );
  end if;
  
  -- Free tier: check limit
  if v_quota.prompts_used >= v_quota.prompts_limit then
    return jsonb_build_object(
      'allowed', false,
      'prompts_used', v_quota.prompts_used,
      'prompts_limit', v_quota.prompts_limit,
      'tier', 'free',
      'message', 'Daily prompt limit reached. Upgrade to Pro for unlimited prompts.'
    );
  end if;
  
  -- Increment and allow
  update user_quotas
  set prompts_used = prompts_used + 1, updated_at = v_now
  where user_id = auth.uid()
  returning * into v_quota;
  
  return jsonb_build_object(
    'allowed', true,
    'prompts_used', v_quota.prompts_used,
    'prompts_limit', v_quota.prompts_limit,
    'tier', 'free'
  );
end;
$$;

-- =============================================================================
-- RPC Function: Get Quota Status (read-only)
-- For displaying quota info in UI
-- =============================================================================

create or replace function get_quota_status()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quota record;
  v_now timestamp with time zone := now();
  v_today date := current_date;
  v_last_reset date;
begin
  select * into v_quota from user_quotas where user_id = auth.uid();
  
  if not found then
    -- Return default free tier status
    return jsonb_build_object(
      'prompts_used', 0,
      'prompts_limit', 3,
      'tier', 'free',
      'resets_at', (v_today + interval '1 day')::text
    );
  end if;
  
  -- Check for daily reset (return fresh count if new day)
  v_last_reset := v_quota.last_reset_at::date;
  
  if v_quota.tier = 'free' and v_today > v_last_reset then
    return jsonb_build_object(
      'prompts_used', 0,
      'prompts_limit', v_quota.prompts_limit,
      'tier', 'free',
      'resets_at', (v_today + interval '1 day')::text
    );
  end if;
  
  return jsonb_build_object(
    'prompts_used', v_quota.prompts_used,
    'prompts_limit', case when v_quota.tier = 'pro' then -1 else v_quota.prompts_limit end,
    'tier', v_quota.tier,
    'resets_at', case when v_quota.tier = 'free' then (v_today + interval '1 day')::text else null end
  );
end;
$$;

-- =============================================================================
-- RPC Function: Upgrade User to Pro (called by Stripe webhook)
-- =============================================================================

create or replace function upgrade_to_pro(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into user_quotas (user_id, tier, prompts_limit, stripe_customer_id, stripe_subscription_id)
  values (p_user_id, 'pro', -1, p_stripe_customer_id, p_stripe_subscription_id)
  on conflict (user_id) do update
  set 
    tier = 'pro',
    prompts_limit = -1,
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    updated_at = now();
end;
$$;

-- =============================================================================
-- RPC Function: Downgrade User to Free (called by Stripe webhook on cancel)
-- =============================================================================

create or replace function downgrade_to_free(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update user_quotas
  set 
    tier = 'free',
    prompts_limit = 3,
    prompts_used = 0,
    last_reset_at = now(),
    stripe_subscription_id = null,
    updated_at = now()
  where user_id = p_user_id;
end;
$$;

-- =============================================================================
-- Trigger: Initialize quota for new users
-- =============================================================================

create or replace function handle_new_user_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_quotas (user_id, tier, prompts_used, prompts_limit)
  values (new.id, 'free', 0, 3)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Attach trigger to auth.users
drop trigger if exists on_auth_user_created_quota on auth.users;
create trigger on_auth_user_created_quota
  after insert on auth.users
  for each row execute procedure handle_new_user_quota();

-- =============================================================================
-- Backfill: Create quota records for existing users
-- =============================================================================

insert into public.user_quotas (user_id, tier, prompts_used, prompts_limit)
select id, 'free', 0, 3
from auth.users
where id not in (select user_id from public.user_quotas)
on conflict (user_id) do nothing;

-- =============================================================================
-- Grant execute permissions on RPC functions
-- =============================================================================

grant execute on function check_and_increment_quota() to authenticated;
grant execute on function get_quota_status() to authenticated;
-- upgrade/downgrade functions are only called by service role (webhooks)

