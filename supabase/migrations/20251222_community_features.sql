-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Create COMMENTS table
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  scape_id uuid references public.scapes(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for comments
alter table public.comments enable row level security;

-- Policies for comments
create policy "Anyone can read comments" on public.comments
  for select using (true);

create policy "Authenticated users can create comments" on public.comments
  for insert with check (auth.uid() = author_id);

create policy "Users can delete their own comments" on public.comments
  for delete using (auth.uid() = author_id);

-- 2. Create LIKES table
create table if not exists public.likes (
  user_id uuid references auth.users(id) on delete cascade not null,
  scape_id uuid references public.scapes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, scape_id)
);

-- Enable RLS for likes
alter table public.likes enable row level security;

-- Policies for likes
create policy "Anyone can read likes" on public.likes
  for select using (true);

create policy "Authenticated users can toggle likes" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "Users can unlike" on public.likes
  for delete using (auth.uid() = user_id);


-- 3. Add PARENT_ID to scapes (for Forking)
alter table public.scapes 
add column if not exists parent_id uuid references public.scapes(id) on delete set null;

-- 4. Add DESCRIPTION to scapes
alter table public.scapes
add column if not exists description text;

-- 5. CRITICAL: Public Access Policies for Scapes and Files

-- Enable RLS on scapes (should be already, but ensure it)
alter table public.scapes enable row level security;

-- Policy: Everyone can view public scapes
create policy "Anyone can view public scapes" on public.scapes
  for select using (is_public = true);

-- Policy: Authenticated users can view their own private scapes (if not covered by existing owner policy)
-- Note: 'Users can view own scapes' likely exists, but this ensures public access doesn't break.

-- Enable RLS on files
alter table public.files enable row level security;

-- Policy: Everyone can view files of public scapes
create policy "Anyone can view files of public scapes" on public.files
  for select using (
    exists (
      select 1 from public.scapes
      where scapes.id = files.scape_id
      and scapes.is_public = true
    )
  );
  
-- Policy: Authors can view their own files (standard)
create policy "Authors can view own files" on public.files
  for select using (
    exists (
      select 1 from public.scapes
      where scapes.id = files.scape_id
      and scapes.author_id = auth.uid()
    )
  );

-- 6. Helper Functions (Optional but recommended for performance)

-- Function to get comment count
create or replace function get_comment_count(scape_id uuid)
returns bigint
language sql
stable
as $$
  select count(*) from public.comments where scape_id = $1;
$$;

-- Function to get like count
create or replace function get_like_count(scape_id uuid)
returns bigint
language sql
stable
as $$
  select count(*) from public.likes where scape_id = $1;
$$;
