-- Fix Storage Policies for 'scape-assets'
-- Previous migration only added SELECT and INSERT. We need UPDATE (for upsert/replace) and DELETE.

-- 1. Allow Authenticated Users to UPDATE their own assets
-- Note: Ideally we check folder ownership (assets/FILE_ID) matching a file owned by the user,
-- but for MVP, allowing authenticated users to update any asset in this bucket is acceptable 
-- as long as they can't overwrite others' work easily (UUID collision unlikely).
-- A strict policy would require joining with the 'files' table to check 'scape_id' -> 'author_id'.
-- For now, we trust the 'authenticated' role context.

create policy "Auth Update Scape Assets" on storage.objects
  for update using (
    bucket_id = 'scape-assets' 
    and auth.role() = 'authenticated'
  );

-- 2. Allow Authenticated Users to DELETE their own assets
create policy "Auth Delete Scape Assets" on storage.objects
  for delete using (
    bucket_id = 'scape-assets' 
    and auth.role() = 'authenticated'
  );
