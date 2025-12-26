-- Security Fixes: Set explicit search_path for functions
-- This prevents malicious code execution via search_path manipulation

ALTER FUNCTION public.get_user_id_by_email(text) SET search_path = public;
ALTER FUNCTION public.increment_view_count(uuid) SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.get_comment_count(uuid) SET search_path = public;
ALTER FUNCTION public.get_like_count(uuid) SET search_path = public;
ALTER FUNCTION public.handle_feedback_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Performance Fixes: Optimize RLS policies
-- Wrapping auth.uid() in (select auth.uid()) prevents re-evaluation for every row

-- 1. SCAPES
DROP POLICY IF EXISTS "Users can view own scapes" ON public.scapes;
CREATE POLICY "Users can view own scapes" ON public.scapes
  FOR SELECT USING (author_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own scapes" ON public.scapes;
CREATE POLICY "Users can insert own scapes" ON public.scapes
  FOR INSERT WITH CHECK (author_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own scapes" ON public.scapes;
CREATE POLICY "Users can update own scapes" ON public.scapes
  FOR UPDATE USING (author_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own scapes" ON public.scapes;
CREATE POLICY "Users can delete own scapes" ON public.scapes
  FOR DELETE USING (author_id = (SELECT auth.uid()));

-- 2. FILES
DROP POLICY IF EXISTS "Users can view files of own scapes" ON public.files;
CREATE POLICY "Users can view files of own scapes" ON public.files
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.scapes 
    WHERE scapes.id = files.scape_id 
    AND scapes.author_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Users can insert files to own scapes" ON public.files;
CREATE POLICY "Users can insert files to own scapes" ON public.files
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.scapes 
    WHERE scapes.id = files.scape_id 
    AND scapes.author_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Users can update files of own scapes" ON public.files;
CREATE POLICY "Users can update files of own scapes" ON public.files
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.scapes 
    WHERE scapes.id = files.scape_id 
    AND scapes.author_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Users can delete files of own scapes" ON public.files;
CREATE POLICY "Users can delete files of own scapes" ON public.files
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.scapes 
    WHERE scapes.id = files.scape_id 
    AND scapes.author_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Authors can view own files" ON public.files;
CREATE POLICY "Authors can view own files" ON public.files
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.scapes
    WHERE scapes.id = files.scape_id
    AND scapes.author_id = (SELECT auth.uid())
  ));

-- 3. SECRETS
DROP POLICY IF EXISTS "Users can view secrets of own scapes" ON public.secrets;
CREATE POLICY "Users can view secrets of own scapes" ON public.secrets
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.scapes 
    WHERE scapes.id = secrets.scape_id 
    AND scapes.author_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Users can insert secrets to own scapes" ON public.secrets;
CREATE POLICY "Users can insert secrets to own scapes" ON public.secrets
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.scapes 
    WHERE scapes.id = secrets.scape_id 
    AND scapes.author_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Users can update secrets of own scapes" ON public.secrets;
CREATE POLICY "Users can update secrets of own scapes" ON public.secrets
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.scapes 
    WHERE scapes.id = secrets.scape_id 
    AND scapes.author_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Users can delete secrets of own scapes" ON public.secrets;
CREATE POLICY "Users can delete secrets of own scapes" ON public.secrets
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.scapes 
    WHERE scapes.id = secrets.scape_id 
    AND scapes.author_id = (SELECT auth.uid())
  ));

-- 4. COMMENTS
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = author_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING ((SELECT auth.uid()) = author_id);

-- 5. LIKES
DROP POLICY IF EXISTS "Authenticated users can toggle likes" ON public.likes;
CREATE POLICY "Authenticated users can toggle likes" ON public.likes
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can unlike" ON public.likes;
CREATE POLICY "Users can unlike" ON public.likes
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- 6. PROFILES
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

-- 7. FEEDBACK
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.feedback;
CREATE POLICY "Users can insert their own feedback" ON public.feedback
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
CREATE POLICY "Users can view their own feedback" ON public.feedback
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own feedback" ON public.feedback;
CREATE POLICY "Users can update their own feedback" ON public.feedback
  FOR UPDATE USING ((SELECT auth.uid()) = user_id AND status = 'new');

-- 8. DEPLOYMENTS (Assuming author_id matches scapes logic)
DROP POLICY IF EXISTS "Authors can create deployments" ON public.deployments;
CREATE POLICY "Authors can create deployments" ON public.deployments
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.scapes
    WHERE scapes.id = deployments.scape_id
    AND scapes.author_id = (SELECT auth.uid())
  ));

-- 9. SCAPE COLLABORATORS
DROP POLICY IF EXISTS "Users can see their collaborations" ON public.scape_collaborators;
CREATE POLICY "Users can see their collaborations" ON public.scape_collaborators
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- Note: "Owners can manage collaborators" requires careful logic check on the 'using' clause
-- usually: scapes.author_id = auth.uid()
DROP POLICY IF EXISTS "Owners can manage collaborators" ON public.scape_collaborators;
CREATE POLICY "Owners can manage collaborators" ON public.scape_collaborators
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.scapes
    WHERE scapes.id = scape_collaborators.scape_id
    AND scapes.author_id = (SELECT auth.uid())
  ));
