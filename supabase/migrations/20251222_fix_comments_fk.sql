-- Drop the old Foreign Key referencing auth.users
-- Note: The specific constraint name might vary if it was auto-generated, but 'comments_author_id_fkey' is standard. 
-- If this fails on constraint name, we might need to be more generic or recreate column, but usually this is determinisitc.
alter table public.comments
drop constraint if exists comments_author_id_fkey;

-- Add new Foreign Key referencing public.profiles
-- This enables PostgREST to perform the join: comments(*, author:profiles(*))
alter table public.comments
add constraint comments_author_id_fkey
foreign key (author_id)
references public.profiles(id)
on delete cascade;
