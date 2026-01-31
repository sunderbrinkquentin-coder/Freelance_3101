/*
  # Extend cv_uploads for Make CV-Check Contract

  1. Changes
    - Rename analysis_status to status (primary field for Make)
    - Add all required fields for Make CV-Check scenario
    - Add error_message, ats_json, vision_text, summary_json, original_file_url, processed_at
  
  2. Security
    - Keep existing RLS policies
    - Allow Make to upsert via service role key
  
  3. Status Values
    - pending: Initial upload, waiting for processing
    - processing: Make scenario is running
    - completed: Analysis finished successfully
    - failed: Error occurred during processing
*/

-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add status column (renamed from analysis_status)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_uploads' AND column_name = 'status'
  ) THEN
    ALTER TABLE cv_uploads ADD COLUMN status text DEFAULT 'pending';
  END IF;

  -- Add error_message column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_uploads' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE cv_uploads ADD COLUMN error_message text;
  END IF;

  -- Add ats_json column (stores OpenAI response)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_uploads' AND column_name = 'ats_json'
  ) THEN
    ALTER TABLE cv_uploads ADD COLUMN ats_json jsonb;
  END IF;

  -- Add vision_text column (stores OCR text from Google Vision)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_uploads' AND column_name = 'vision_text'
  ) THEN
    ALTER TABLE cv_uploads ADD COLUMN vision_text text;
  END IF;

  -- Add summary_json column (optional summary data)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_uploads' AND column_name = 'summary_json'
  ) THEN
    ALTER TABLE cv_uploads ADD COLUMN summary_json jsonb;
  END IF;

  -- Add original_file_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_uploads' AND column_name = 'original_file_url'
  ) THEN
    ALTER TABLE cv_uploads ADD COLUMN original_file_url text;
  END IF;

  -- Add processed_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_uploads' AND column_name = 'processed_at'
  ) THEN
    ALTER TABLE cv_uploads ADD COLUMN processed_at timestamptz;
  END IF;

  -- Add temp_id column for Make scenario compatibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_uploads' AND column_name = 'temp_id'
  ) THEN
    ALTER TABLE cv_uploads ADD COLUMN temp_id uuid;
  END IF;
END $$;

-- Migrate existing data from analysis_status to status if status is null
UPDATE cv_uploads 
SET status = COALESCE(analysis_status, 'pending')
WHERE status IS NULL;

-- Make status NOT NULL with default
ALTER TABLE cv_uploads ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE cv_uploads ALTER COLUMN status SET NOT NULL;

-- Add check constraint for status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cv_uploads_status_check'
  ) THEN
    ALTER TABLE cv_uploads 
    ADD CONSTRAINT cv_uploads_status_check 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'));
  END IF;
END $$;

-- Create policy for Make to update records (via service role)
DROP POLICY IF EXISTS "Service role can update cv_uploads" ON cv_uploads;
CREATE POLICY "Service role can update cv_uploads"
  ON cv_uploads FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_cv_uploads_status ON cv_uploads(status);
