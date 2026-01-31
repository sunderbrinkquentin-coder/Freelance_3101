/*
  # Add file_url column and create stored_cvs table

  ## Changes
  
  1. cv_uploads table
    - Add `file_url` column (text) to store the public URL for Make.com
  
  2. stored_cvs table (new)
    - Mirror structure of cvs table for CV creation process
    - All columns identical to cvs for Make.com compatibility
  
  ## Notes
  - file_url stores the complete public URL needed by Make.com
  - stored_cvs is the table Make.com uses for CV optimization
*/

-- Add file_url to cv_uploads
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_uploads' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE cv_uploads ADD COLUMN file_url text;
  END IF;
END $$;

-- Create stored_cvs table (for CV creation/optimization)
CREATE TABLE IF NOT EXISTS stored_cvs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  cv_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  job_data jsonb DEFAULT '{}'::jsonb,
  editor_data jsonb DEFAULT '{}'::jsonb,
  insights jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft',
  is_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stored_cvs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stored_cvs
CREATE POLICY "Users can view own CVs"
  ON stored_cvs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CVs"
  ON stored_cvs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CVs"
  ON stored_cvs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous can view by session"
  ON stored_cvs FOR SELECT
  TO anon
  USING (session_id IS NOT NULL);

CREATE POLICY "Anonymous can insert with session"
  ON stored_cvs FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Anonymous can update by session"
  ON stored_cvs FOR UPDATE
  TO anon
  USING (session_id IS NOT NULL)
  WITH CHECK (session_id IS NOT NULL);

-- Create index for session lookups
CREATE INDEX IF NOT EXISTS idx_stored_cvs_session_id ON stored_cvs(session_id);
CREATE INDEX IF NOT EXISTS idx_stored_cvs_user_id ON stored_cvs(user_id);