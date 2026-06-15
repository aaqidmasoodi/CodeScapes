-- =============================================================================
-- Encrypt secret values at rest (P0 security fix 3.5) -- via Supabase Vault
-- =============================================================================
-- Previously public.secrets.value stored API keys / tokens in PLAINTEXT, with
-- confidentiality resting entirely on RLS.
--
-- pgsodium's low-level crypto_aead_* functions are NOT executable by the
-- migration/postgres role on Supabase (owned by supabase_admin; TCE deprecated),
-- so we use Supabase Vault instead. Vault stores ciphertext in vault.secrets and
-- exposes plaintext only through the vault.decrypted_secrets view; the encryption
-- key is managed by the platform, never in our tables.
--
-- Each public.secrets row references its Vault entry via secret_id. Plaintext is
-- produced only inside SECURITY DEFINER RPCs that re-check scape ownership.
-- =============================================================================

-- Clean up any partial artifacts from the earlier pgsodium attempt.
alter table public.secrets drop column if exists value_encrypted;

-- Reference from a secret row to its Vault entry.
alter table public.secrets add column if not exists secret_id uuid;

-- ---------------------------------------------------------------------------
-- 1. Backfill: move existing plaintext values into Vault.
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
  v_secret_id uuid;
begin
  for r in
    select id, value from public.secrets where secret_id is null and value is not null
  loop
    v_secret_id := vault.create_secret(
      r.value,
      'scape_secret_' || r.id::text,
      'CodeScapes scape secret'
    );
    update public.secrets set secret_id = v_secret_id where id = r.id;
  end loop;
end
$$;

-- Drop the plaintext column now that values live in Vault.
alter table public.secrets drop column if exists value;

-- ---------------------------------------------------------------------------
-- 2. SECURITY DEFINER accessors (ownership-checked).
-- ---------------------------------------------------------------------------

-- Read + decrypt all secrets for a scape the caller owns.
create or replace function public.get_secrets(p_scape_id uuid)
returns table (
  id uuid,
  scape_id uuid,
  key text,
  value text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  if not exists (
    select 1 from public.scapes
    where scapes.id = p_scape_id and scapes.author_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  return query
  select
    s.id,
    s.scape_id,
    s.key,
    ds.decrypted_secret as value,
    s.created_at
  from public.secrets s
  join vault.decrypted_secrets ds on ds.id = s.secret_id
  where s.scape_id = p_scape_id
  order by s.key;
end;
$$;

-- Insert/update an encrypted secret for a scape the caller owns.
create or replace function public.set_secret(p_scape_id uuid, p_key text, p_value text)
returns table (
  id uuid,
  scape_id uuid,
  key text,
  value text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret_id uuid;
  v_id uuid;
  v_created_at timestamptz;
begin
  if not exists (
    select 1 from public.scapes
    where scapes.id = p_scape_id and scapes.author_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  select s.secret_id into v_secret_id
  from public.secrets s
  where s.scape_id = p_scape_id and s.key = p_key;

  if v_secret_id is null then
    -- New (scape, key): create a Vault entry, then the row.
    v_secret_id := vault.create_secret(
      p_value,
      'scape_secret_' || p_scape_id::text || '_' || p_key,
      'CodeScapes scape secret'
    );

    insert into public.secrets (scape_id, key, secret_id)
    values (p_scape_id, p_key, v_secret_id)
    returning secrets.id, secrets.created_at into v_id, v_created_at;
  else
    -- Existing (scape, key): rotate the Vault value in place.
    perform vault.update_secret(v_secret_id, p_value);

    update public.secrets
    set updated_at = now()
    where scape_id = p_scape_id and key = p_key
    returning secrets.id, secrets.created_at into v_id, v_created_at;
  end if;

  return query select v_id, p_scape_id, p_key, p_value, v_created_at;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Keep Vault in sync when a secret row is deleted (the existing client
--    deletes directly from public.secrets under RLS).
-- ---------------------------------------------------------------------------
create or replace function public.cleanup_vault_secret()
returns trigger
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  if old.secret_id is not null then
    delete from vault.secrets where id = old.secret_id;
  end if;
  return old;
end;
$$;

drop trigger if exists trg_secrets_cleanup on public.secrets;
create trigger trg_secrets_cleanup
  before delete on public.secrets
  for each row execute function public.cleanup_vault_secret();

-- ---------------------------------------------------------------------------
-- 4. Permissions: only authenticated users may call the accessors.
-- ---------------------------------------------------------------------------
revoke all on function public.get_secrets(uuid) from public, anon;
revoke all on function public.set_secret(uuid, text, text) from public, anon;
grant execute on function public.get_secrets(uuid) to authenticated;
grant execute on function public.set_secret(uuid, text, text) to authenticated;
