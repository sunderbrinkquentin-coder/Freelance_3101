/*
  # Optimize RLS Policies - Replace auth.<function>() with (SELECT auth.<function>())

  1. Performance Optimization
    - Replace direct auth function calls with SELECT subqueries
    - Prevents re-evaluation for each row, improving query performance at scale

  2. Tables Affected
    - user_profiles
    - cv_documents
    - applications
    - cv_education
    - cv_experience
    - cv_hard_skills
    - cv_personal_data
    - cv_projects
    - cv_soft_skills
    - job_targets
    - cv_records
    - ats_analyses
    - user_tokens

  3. Security
    - All existing RLS policies are recreated with optimized auth checks
    - No changes to authorization logic, only performance improvements
*/

-- ============================================================================
-- user_profiles
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Insert" ON public.user_profiles;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Insert"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- cv_documents
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own CVs" ON public.cv_documents;
DROP POLICY IF EXISTS "Users can edit their own CVs" ON public.cv_documents;
DROP POLICY IF EXISTS "Users can insert their own CVs" ON public.cv_documents;

CREATE POLICY "Users can view their own CVs"
  ON public.cv_documents
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can edit their own CVs"
  ON public.cv_documents
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own CVs"
  ON public.cv_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- applications
-- ============================================================================
DROP POLICY IF EXISTS "Users can read their own rows" ON public.applications;
DROP POLICY IF EXISTS "Update" ON public.applications;
DROP POLICY IF EXISTS "Erstellen" ON public.applications;

CREATE POLICY "Users can read their own rows"
  ON public.applications
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Update"
  ON public.applications
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Erstellen"
  ON public.applications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- cv_education
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own rows" ON public.cv_education;
DROP POLICY IF EXISTS "Users can insert their own rows" ON public.cv_education;
DROP POLICY IF EXISTS "Update" ON public.cv_education;

CREATE POLICY "Users can view their own rows"
  ON public.cv_education
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own rows"
  ON public.cv_education
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Update"
  ON public.cv_education
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- cv_experience
-- ============================================================================
DROP POLICY IF EXISTS "Select" ON public.cv_experience;
DROP POLICY IF EXISTS "Insert" ON public.cv_experience;
DROP POLICY IF EXISTS "Update" ON public.cv_experience;

CREATE POLICY "Select"
  ON public.cv_experience
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Insert"
  ON public.cv_experience
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Update"
  ON public.cv_experience
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- cv_hard_skills
-- ============================================================================
DROP POLICY IF EXISTS "Select" ON public.cv_hard_skills;
DROP POLICY IF EXISTS "Insert" ON public.cv_hard_skills;
DROP POLICY IF EXISTS "Update" ON public.cv_hard_skills;

CREATE POLICY "Select"
  ON public.cv_hard_skills
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Insert"
  ON public.cv_hard_skills
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Update"
  ON public.cv_hard_skills
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- cv_personal_data
-- ============================================================================
DROP POLICY IF EXISTS "Select" ON public.cv_personal_data;
DROP POLICY IF EXISTS "Insert" ON public.cv_personal_data;
DROP POLICY IF EXISTS "Update" ON public.cv_personal_data;

CREATE POLICY "Select"
  ON public.cv_personal_data
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Insert"
  ON public.cv_personal_data
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Update"
  ON public.cv_personal_data
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- cv_projects
-- ============================================================================
DROP POLICY IF EXISTS "Select" ON public.cv_projects;
DROP POLICY IF EXISTS "Insert" ON public.cv_projects;
DROP POLICY IF EXISTS "Update" ON public.cv_projects;

CREATE POLICY "Select"
  ON public.cv_projects
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Insert"
  ON public.cv_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Update"
  ON public.cv_projects
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- cv_soft_skills
-- ============================================================================
DROP POLICY IF EXISTS "Select" ON public.cv_soft_skills;
DROP POLICY IF EXISTS "Insert" ON public.cv_soft_skills;
DROP POLICY IF EXISTS "Update" ON public.cv_soft_skills;

CREATE POLICY "Select"
  ON public.cv_soft_skills
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Insert"
  ON public.cv_soft_skills
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Update"
  ON public.cv_soft_skills
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- job_targets
-- ============================================================================
DROP POLICY IF EXISTS "Select" ON public.job_targets;
DROP POLICY IF EXISTS "Insert" ON public.job_targets;
DROP POLICY IF EXISTS "Update" ON public.job_targets;

CREATE POLICY "Select"
  ON public.job_targets
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Insert"
  ON public.job_targets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Update"
  ON public.job_targets
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- cv_records
-- ============================================================================
DROP POLICY IF EXISTS "Users can select own cv_records" ON public.cv_records;
DROP POLICY IF EXISTS "Users can update own cv_records" ON public.cv_records;
DROP POLICY IF EXISTS "Users can delete own cv_records" ON public.cv_records;

CREATE POLICY "Users can select own cv_records"
  ON public.cv_records
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own cv_records"
  ON public.cv_records
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own cv_records"
  ON public.cv_records
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- ats_analyses
-- ============================================================================
DROP POLICY IF EXISTS "Allow user to read own ATS analyses" ON public.ats_analyses;
DROP POLICY IF EXISTS "Allow user to insert own ATS analyses" ON public.ats_analyses;

CREATE POLICY "Allow user to read own ATS analyses"
  ON public.ats_analyses
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Allow user to insert own ATS analyses"
  ON public.ats_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- user_tokens
-- ============================================================================
DROP POLICY IF EXISTS "Users read own tokens" ON public.user_tokens;
DROP POLICY IF EXISTS "Users update own tokens" ON public.user_tokens;
DROP POLICY IF EXISTS "Users insert own tokens" ON public.user_tokens;

CREATE POLICY "Users read own tokens"
  ON public.user_tokens
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users update own tokens"
  ON public.user_tokens
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users insert own tokens"
  ON public.user_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
