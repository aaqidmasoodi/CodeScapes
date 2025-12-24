-- 1. Add Admin Role to Profiles
alter table public.profiles 
add column if not exists is_admin boolean default false;

-- 2. Create Docs Nodes Table (Recursive)
create table if not exists public.docs_nodes (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references public.docs_nodes(id) on delete set null,
  type text not null check (type in ('category', 'page')),
  title text not null,
  slug text not null unique,
  content text, -- Only for pages
  excerpt text, -- For SEO/Search
  sort_order integer default 0,
  is_hidden boolean default false,
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Indexes
create index if not exists docs_nodes_parent_id_idx on public.docs_nodes(parent_id);
create index if not exists docs_nodes_slug_idx on public.docs_nodes(slug);
create index if not exists docs_nodes_sort_order_idx on public.docs_nodes(sort_order);

-- 4. Enable RLS
alter table public.docs_nodes enable row level security;

-- 5. Policies

-- Public: Can view published nodes
create policy "Public can view published docs" on public.docs_nodes
  for select
  using (is_published = true);

-- Admin: Full Access
-- Note: Requires the user's profile to have is_admin = true
create policy "Admins have full access to docs" on public.docs_nodes
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- 6. Updated At Trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_docs_nodes_updated
  before update on public.docs_nodes
  for each row execute procedure public.handle_updated_at();
