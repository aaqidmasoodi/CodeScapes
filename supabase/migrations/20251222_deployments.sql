-- 1. Create DEPLOYMENTS table
create table if not exists public.deployments (
  id uuid default uuid_generate_v4() primary key,
  scape_id uuid references public.scapes(id) on delete cascade not null,
  version integer not null,
  url text not null, -- URL to the JSON snapshot in Storage
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.deployments enable row level security;

-- Policy: Everyone can view deployments (they are public snapshots)
create policy "Anyone can view deployments" on public.deployments
  for select using (true);
  
-- Policy: Only author can create deployment
-- We check scape ownership
create policy "Authors can create deployments" on public.deployments
  for insert with check (
    exists (
      select 1 from public.scapes
      where scapes.id = deployments.scape_id
      and scapes.author_id = auth.uid()
    )
  );

-- 2. Add PUBLISHED_VERSION link to Scapes
alter table public.scapes 
add column if not exists published_version_id uuid references public.deployments(id) on delete set null;

-- 3. Storage Bucket for Deployments
insert into storage.buckets (id, name, public) 
values ('scape-deployments', 'scape-deployments', true)
on conflict (id) do nothing;

-- Storage Policy: Public Read
create policy "Public Access to Deployments" on storage.objects
  for select using ( bucket_id = 'scape-deployments' );

-- Storage Policy: Authenticated Upload
create policy "Auth Upload to Deployments" on storage.objects
  for insert with check ( bucket_id = 'scape-deployments' and auth.role() = 'authenticated' );
