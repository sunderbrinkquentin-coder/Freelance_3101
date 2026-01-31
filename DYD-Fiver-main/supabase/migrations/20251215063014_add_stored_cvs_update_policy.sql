/*
  # Add UPDATE RLS Policy to stored_cvs Table

  ## Purpose
  Allow authenticated users to update their own CV records with restrictions to specific fields:
  - is_paid
  - unlocked_via_token
  - pdf_url
  - download_count

  ## Changes
  - CREATE policy "Users can update own CVs" (UPDATE)

  ## Security
  - Authenticated users can only UPDATE their own CVs (user_id = auth.uid())
  - user_id cannot be changed (WITH CHECK ensures ownership remains)
  - Application layer enforces field-level restrictions to: is_paid, unlocked_via_token, pdf_url, download_count
  - RLS ensures row ownership cannot be changed during update
*/

DO $$
BEGIN
  -- Drop existing policy if it exists to avoid duplicates
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'stored_cvs'
    AND policyname = 'Users can update own CVs'
  ) THEN
    DROP POLICY "Users can update own CVs" ON stored_cvs;
  END IF;
END $$;

CREATE POLICY "Users can update own CVs"
  ON stored_cvs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);