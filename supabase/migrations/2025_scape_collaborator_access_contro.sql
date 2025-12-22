-- Collaborators Table
CREATE TABLE scape_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scape_id UUID NOT NULL REFERENCES scapes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(scape_id, user_id)
);

-- Enable RLS
ALTER TABLE scape_collaborators ENABLE ROW LEVEL SECURITY;

-- Owners can manage collaborators
CREATE POLICY "Owners can manage collaborators" ON scape_collaborators
  FOR ALL USING (
    auth.uid() = (SELECT author_id FROM scapes WHERE id = scape_id)
  );

-- Users can see collaborations they're part of
CREATE POLICY "Users can see their collaborations" ON scape_collaborators
  FOR SELECT USING (auth.uid() = user_id);

-- Update secrets policy to include collaborators
DROP POLICY IF EXISTS "Users can read their own secrets" ON secrets;

CREATE POLICY "Owners and collaborators can read secrets" ON secrets
  FOR SELECT USING (
    auth.uid() = (SELECT author_id FROM scapes WHERE id = scape_id)
    OR
    auth.uid() IN (SELECT user_id FROM scape_collaborators WHERE scape_collaborators.scape_id = secrets.scape_id)
  );

-- Index for performance
CREATE INDEX idx_collaborators_scape ON scape_collaborators(scape_id);
CREATE INDEX idx_collaborators_user ON scape_collaborators(user_id);