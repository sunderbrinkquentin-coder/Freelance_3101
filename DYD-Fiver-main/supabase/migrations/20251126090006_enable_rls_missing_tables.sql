/*
  # Enable RLS on Missing Tables

  1. Security Enhancement
    - Enable Row Level Security on public tables that are currently unprotected
    - Add appropriate policies for authenticated users

  2. Tables Affected
    - cv_drafts
    - cvs
    - cv_versions

  3. Policies
    - Users can only access their own data
    - All operations require authentication
*/

-- ============================================================================
-- cv_drafts
-- ============================================================================
ALTER TABLE public.cv_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cv_drafts"
  ON public.cv_drafts
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own cv_drafts"
  ON public.cv_drafts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own cv_drafts"
  ON public.cv_drafts
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own cv_drafts"
  ON public.cv_drafts
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- cvs
-- ============================================================================
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cvs"
  ON public.cvs
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own cvs"
  ON public.cvs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own cvs"
  ON public.cvs
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own cvs"
  ON public.cvs
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- cv_versions
-- ============================================================================
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cv_versions"
  ON public.cv_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cvs
      WHERE cvs.id = cv_versions.cv_id
      AND cvs.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert own cv_versions"
  ON public.cv_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cvs
      WHERE cvs.id = cv_versions.cv_id
      AND cvs.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own cv_versions"
  ON public.cv_versions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cvs
      WHERE cvs.id = cv_versions.cv_id
      AND cvs.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cvs
      WHERE cvs.id = cv_versions.cv_id
      AND cvs.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete own cv_versions"
  ON public.cv_versions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cvs
      WHERE cvs.id = cv_versions.cv_id
      AND cvs.user_id = (SELECT auth.uid())
    )
  );
