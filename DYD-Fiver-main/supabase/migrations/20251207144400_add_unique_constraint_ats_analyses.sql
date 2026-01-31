/*
  # Add unique constraint to prevent duplicate CV-Check saves

  1. Changes
    - Add unique constraint on (user_id, upload_id) combination to ats_analyses table
    - This ensures each user can only have one saved analysis per CV upload
    - Remove any existing duplicates before adding the constraint
  
  2. Security
    - No changes to RLS policies needed
    - Maintains existing data integrity
*/

-- First, remove duplicates by keeping only the most recent analysis for each user_id + upload_id combination
DO $$
BEGIN
  -- Delete duplicate entries, keeping only the most recent one per user_id + upload_id
  DELETE FROM ats_analyses a
  USING ats_analyses b
  WHERE a.user_id = b.user_id 
    AND a.upload_id = b.upload_id
    AND a.upload_id IS NOT NULL
    AND a.created_at < b.created_at;
END $$;

-- Add unique constraint to prevent future duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ats_analyses_user_upload_unique'
  ) THEN
    ALTER TABLE ats_analyses 
    ADD CONSTRAINT ats_analyses_user_upload_unique 
    UNIQUE (user_id, upload_id);
  END IF;
END $$;
