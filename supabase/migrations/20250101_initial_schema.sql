-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Scapes Table
create table scapes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  environment text not null,
  template text not null,
  source text not null check (source in ('cloud')), -- Only cloud scapes live here
  author_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  thumbnail text, -- Base64 data URL (for now)
  dependencies text[] default '{}'::text[]
);

-- Files Table
create table files (
  id uuid primary key default uuid_generate_v4(),
  scape_id uuid references scapes(id) on delete cascade not null,
  name text not null,
  language text not null,
  content text default '', -- Text content. Binary content should use Storage.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(scape_id, name)
);

-- RLS Policies
alter table scapes enable row level security;
alter table files enable row level security;

-- Scapes: Users can view/edit their own scapes
create policy "Users can view own scapes" on scapes
  for select using (auth.uid() = author_id);

create policy "Users can insert own scapes" on scapes
  for insert with check (auth.uid() = author_id);

create policy "Users can update own scapes" on scapes
  for update using (auth.uid() = author_id);

create policy "Users can delete own scapes" on scapes
  for delete using (auth.uid() = author_id);

-- Files: Users can view/edit files of scapes they own
-- Performance optimization: We use a join or exact check.
-- For simple MVP, we trust the `scape_id` check if we cascade correctly, 
-- but RLS needs to check the parent scape's author.

create policy "Users can view files of own scapes" on files
  for select using (
    exists ( select 1 from scapes where id = files.scape_id and author_id = auth.uid() )
  );

create policy "Users can insert files to own scapes" on files
  for insert with check (
    exists ( select 1 from scapes where id = files.scape_id and author_id = auth.uid() )
  );

create policy "Users can update files of own scapes" on files
  for update using (
    exists ( select 1 from scapes where id = files.scape_id and author_id = auth.uid() )
  );

create policy "Users can delete files of own scapes" on files
  for delete using (
    exists ( select 1 from scapes where id = files.scape_id and author_id = auth.uid() )
  );

-- Storage Bucket (Optional for now, but good to have)
insert into storage.buckets (id, name, public) 
values ('scape-assets', 'scape-assets', true)
on conflict (id) do nothing;

create policy "Public Access to Scape Assets" on storage.objects
  for select using ( bucket_id = 'scape-assets' );

create policy "Auth Upload to Scape Assets" on storage.objects
  for insert with check ( bucket_id = 'scape-assets' and auth.role() = 'authenticated' );

-- Enable Realtime
alter publication supabase_realtime add table files;
alter publication supabase_realtime add table scapes;
-- Necessary for DELETE events and full UPDATE payloads
alter table files replica identity full;
alter table scapes replica identity full;