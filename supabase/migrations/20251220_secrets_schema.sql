-- Create Secrets Table
create table public.secrets (
  id uuid primary key default gen_random_uuid(),
  scape_id uuid references public.scapes(id) on delete cascade not null,
  key text not null,
  value text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Prevent duplicate keys in same scape
  constraint secrets_scape_id_key_key unique (scape_id, key),
  
  -- Keys should be valid env var names (A-Z, 0-9, _)
  constraint secrets_key_check check (key ~ '^[A-Z_][A-Z0-9_]*$')
);

-- Enable RLS
alter table public.secrets enable row level security;

-- Policies (Assuming scapes table has user_id)

-- 1. View Secrets: Only owner of the Scape
create policy "Users can view secrets of own scapes"
  on public.secrets for select
  using (
    exists (
      select 1 from public.scapes
      where id = secrets.scape_id
      and author_id = auth.uid()
    )
  );

-- 2. Insert Secrets: Only owner of the Scape
create policy "Users can insert secrets to own scapes"
  on public.secrets for insert
  with check (
    exists (
      select 1 from public.scapes
      where id = scape_id
      and author_id = auth.uid()
    )
  );

-- 3. Update Secrets: Only owner of the Scape
create policy "Users can update secrets of own scapes"
  on public.secrets for update
  using (
    exists (
      select 1 from public.scapes
      where id = secrets.scape_id
      and author_id = auth.uid()
    )
  );

-- 4. Delete Secrets: Only owner of the Scape
create policy "Users can delete secrets of own scapes"
  on public.secrets for delete
  using (
    exists (
      select 1 from public.scapes
      where id = secrets.scape_id
      and author_id = auth.uid()
    )
  );
