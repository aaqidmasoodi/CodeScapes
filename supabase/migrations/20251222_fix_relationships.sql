-- CRITICAL FIX: To allow joining Scapes with Profiles in the API
-- We must explicitly link scapes.author_id to public.profiles.id
-- Currently it links to auth.users, which is not exposed to the API.

DO $$ 
BEGIN
  -- 1. Try to drop the old constraint if we can guess the name or if it interferes
  -- We'll just ADD the new one. PostgreSQL allows multiple FKs on a column.
  -- PostgREST will detect the relationship to 'profiles'.

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scapes_author_id_profiles_fkey'
  ) THEN
      ALTER TABLE public.scapes
      ADD CONSTRAINT scapes_author_id_profiles_fkey
      FOREIGN KEY (author_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;

END $$;

-- 2. Ensure likes table also references profiles instead of auth.users if needed
-- (The likes table references auth.users currently. If we want to join likes -> profiles, we need this too)
-- But primarily the error was about 'scapes' -> 'profiles'.

-- 3. Commenting/Hinting (Optional but good for documentation)
COMMENT ON CONSTRAINT scapes_author_id_profiles_fkey ON public.scapes IS 'Links scape author to public profile for API joins';
