-- Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policy: Anyone can view profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

-- Policy: Users can insert their own profile
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'user_name' -- Some providers use user_name
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
-- Drop if exists first to avoid duplication/errors on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users (SAFE TO RUN)
-- This inserts profiles for users who exist in auth.users but not in public.profiles
insert into public.profiles (id, full_name, avatar_url)
select 
  id, 
  raw_user_meta_data->>'full_name', 
  raw_user_meta_data->>'avatar_url'
from auth.users
where id not in (select id from public.profiles);
