-- Add views column to lives table tracking
alter table public.scapes
add column if not exists views bigint default 0;

-- Function to increment view count safely
create or replace function increment_view_count(scape_id uuid)
returns void
language sql
security definer
as $$
  update public.scapes
  set views = coalesce(views, 0) + 1
  where id = scape_id;
$$;
