-- Add preferences JSONB column to profiles table for storing user preferences
-- including tour completion status

-- Add the preferences column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add a comment explaining the column structure
COMMENT ON COLUMN public.profiles.preferences IS 
'User preferences stored as JSONB. Structure: { "completed_tours": ["tour-id-1", "tour-id-2"] }';

-- Create an index on the completed_tours array for efficient lookups (optional but helpful)
CREATE INDEX IF NOT EXISTS idx_profiles_completed_tours 
ON public.profiles USING GIN ((preferences -> 'completed_tours'));
