-- Add parent_id to comments for threading
alter table public.comments
add column if not exists parent_id uuid references public.comments(id) on delete cascade;

-- Index for performance
create index if not exists idx_comments_parent_id on public.comments(parent_id);
create index if not exists idx_comments_scape_id on public.comments(scape_id);
