-- Feedback system for bug reports, feature requests, and suggestions
-- Only authenticated users can submit feedback

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Feedback type
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'idea', 'question', 'other')),
  
  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Priority (mainly for bugs)
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  
  -- Optional system info (browser, theme, etc.)
  system_info JSONB,
  
  -- Status tracking (for admin)
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'wont_fix')),
  
  -- Context (where was the user when submitting)
  context JSONB, -- { page: '/dashboard', scape_id: '...' }
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_type_idx ON public.feedback(type);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON public.feedback(status);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON public.feedback(created_at DESC);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can update their own feedback (e.g., edit before admin reviews)
CREATE POLICY "Users can update their own feedback"
  ON public.feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'new')
  WITH CHECK (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.handle_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_feedback_updated_at();
