-- =============================================
-- NOTIFICATION SYSTEM DATABASE SETUP
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create the notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'fork', 'follow', 'system')),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  scape_id UUID REFERENCES scapes(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(user_id, created_at DESC);

-- 3. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can only read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications (via triggers)
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- 5. Trigger function for LIKES
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if liker is not the scape owner
  INSERT INTO notifications (user_id, type, actor_id, scape_id)
  SELECT s.author_id, 'like', NEW.user_id, NEW.scape_id
  FROM scapes s
  WHERE s.id = NEW.scape_id AND s.author_id != NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger function for COMMENTS
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify scape owner (if commenter is not the owner)
  INSERT INTO notifications (user_id, type, actor_id, scape_id, comment_id)
  SELECT s.author_id, 'comment', NEW.author_id, NEW.scape_id, NEW.id
  FROM scapes s
  WHERE s.id = NEW.scape_id AND s.author_id != NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger function for FORKS
CREATE OR REPLACE FUNCTION notify_on_fork()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if there's a parent_id (indicating a fork)
  IF NEW.parent_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, actor_id, scape_id)
    SELECT s.author_id, 'fork', NEW.author_id, NEW.parent_id
    FROM scapes s
    WHERE s.id = NEW.parent_id AND s.author_id != NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create the triggers
DROP TRIGGER IF EXISTS on_like_insert ON likes;
CREATE TRIGGER on_like_insert
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION notify_on_like();

DROP TRIGGER IF EXISTS on_comment_insert ON comments;
CREATE TRIGGER on_comment_insert
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

DROP TRIGGER IF EXISTS on_fork_insert ON scapes;
CREATE TRIGGER on_fork_insert
  AFTER INSERT ON scapes
  FOR EACH ROW EXECUTE FUNCTION notify_on_fork();

-- 9. Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
