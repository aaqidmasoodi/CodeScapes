-- Site Settings Table
-- Stores key-value pairs for site-wide configuration

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.site_settings enable row level security;

-- Policy: Anyone can read settings
create policy "Public can read site settings" on public.site_settings
  for select using (true);

-- Policy: Only admins can modify settings
create policy "Admins can modify site settings" on public.site_settings
  for all using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and is_admin = true
    )
  );

-- Insert default featured scape (can be updated via admin)
insert into public.site_settings (key, value)
values ('featured_scape_id', '"9478cf68-d30a-4fa9-bc68-bbd715a829f4"'::jsonb)
on conflict (key) do nothing;
