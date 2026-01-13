-- Migration: Collections V2 (Robustness Improvements)
-- 2026-01-13

-- 1. Add updated_at to collection_topics
alter table collection_topics
add column if not exists updated_at timestamptz default now();

-- 2. Add trigger to auto-update updated_at for collection_topics
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists update_collection_topics_updated_at on collection_topics;

create trigger update_collection_topics_updated_at
before update on collection_topics
for each row
execute function update_updated_at_column();


-- 3. Optimize RLS Policies for Collections
-- Combine "Users can view own private collections" and "Everyone can view public collections"
-- into a single policy for better performance and clarity.

drop policy if exists "Users can view own private collections" on collections;
drop policy if exists "Everyone can view public collections" on collections;

create policy "View collections"
  on collections for select
  using (is_public = true or auth.uid() = user_id);
