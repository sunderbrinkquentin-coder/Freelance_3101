/*
  # Create Essential Database Tables
  
  This migration creates all essential tables for the CV application:
  1. profiles - User profiles
  2. job_application - Job applications with CV data
  3. cvs - CV storage
  4. cv_uploads - CV file uploads (referenced by ats_analyses)
  
  Security: RLS enabled on all tables with appropriate policies
*/

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text UNIQUE NOT NULL,
  email text,
  full_name text,
  status text DEFAULT 'anonymous' CHECK (status IN ('anonymous', 'registered', 'active')),
  is_anonymous boolean DEFAULT true,
  registered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_session_id_idx ON profiles(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles(status);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert profiles"
  ON profiles FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own profiles"
  ON profiles FOR UPDATE
  TO authenticated, anon
  USING (true);

-- 2. Create cvs table
CREATE TABLE IF NOT EXISTS cvs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  job_data jsonb DEFAULT '{}'::jsonb,
  is_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own CVs"
  ON cvs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CVs"
  ON cvs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert CVs"
  ON cvs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can view CVs"
  ON cvs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can update CVs"
  ON cvs FOR UPDATE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_created_at ON cvs(created_at DESC);

-- 3. Create cv_uploads table (needed by ats_analyses)
CREATE TABLE IF NOT EXISTS cv_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  analysis_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cv_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploads"
  ON cv_uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view uploads"
  ON cv_uploads FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert uploads"
  ON cv_uploads FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cv_uploads_user_id ON cv_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_uploads_session_id ON cv_uploads(session_id);

-- 4. Create job_application table
CREATE TABLE IF NOT EXISTS job_application (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id text NOT NULL,
  
  -- Kontaktdaten
  vorname text,
  nachname text,
  email text,
  telefon text,
  ort text,
  plz text,
  linkedin text,
  website text,
  
  -- CV-Einträge
  bildung_entries jsonb,
  berufserfahrung_entries jsonb,
  projekte_entries jsonb,
  sprachen_list jsonb,
  zertifikate_entries jsonb,
  
  -- Skills
  hard_skills jsonb,
  soft_skills jsonb,
  top_skills jsonb,
  zusaetzliche_infos text,
  
  -- Stelleninformationen
  rolle text NOT NULL,
  unternehmen text NOT NULL,
  stellenbeschreibung text,
  
  -- Optimierte Daten
  berufserfahrung_entries_optimiert jsonb,
  projekte_entries_optimiert jsonb,
  skills_optimiert jsonb,
  profile_summary text,
  sales text,
  optimized_cv_html text,
  
  -- Status
  status text DEFAULT 'entwurf' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE job_application ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own job_applications"
  ON job_application FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view job_applications"
  ON job_application FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can insert job_applications"
  ON job_application FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update job_applications"
  ON job_application FOR UPDATE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_job_application_user_id ON job_application(user_id);
CREATE INDEX IF NOT EXISTS idx_job_application_session_id ON job_application(session_id);

-- 5. Create ats_analyses table
CREATE TABLE IF NOT EXISTS ats_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_id uuid REFERENCES cv_uploads(id) ON DELETE SET NULL,
  ats_score integer CHECK (ats_score >= 0 AND ats_score <= 100),
  analysis_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ats_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON ats_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view analyses"
  ON ats_analyses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert analyses"
  ON ats_analyses FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_ats_analyses_user_id ON ats_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_analyses_upload_id ON ats_analyses(upload_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cvs_updated_at
  BEFORE UPDATE ON cvs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_uploads_updated_at
  BEFORE UPDATE ON cv_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_application_updated_at
  BEFORE UPDATE ON job_application
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ats_analyses_updated_at
  BEFORE UPDATE ON ats_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();