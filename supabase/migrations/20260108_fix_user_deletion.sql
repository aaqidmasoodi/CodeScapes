-- Fix user deletion: Add ON DELETE CASCADE to scapes.author_id
-- This allows deleting users without FK errors.
-- All user's scapes (and their child records) will be deleted when the user is removed.

-- 1. Drop the existing constraint
ALTER TABLE public.scapes 
DROP CONSTRAINT IF EXISTS scapes_author_id_fkey;

-- 2. Re-add with CASCADE
ALTER TABLE public.scapes
ADD CONSTRAINT scapes_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;
