/*
  # Extend stored_cvs for Make CV-Generator Contract

  1. Changes
    - Add source column if missing (wizard, upload, etc.)
    - Add check constraint for status values
    - Add error_message column for failed scenarios
    - Ensure all fields match Make contract
  
  2. Status Values
    - draft: Initial state (before Make processing)
    - processing: Make scenario is running
    - completed: CV generation finished successfully
    - failed: Error occurred during processing
  
  3. Make Contract
    - Make creates initial row with status='processing'
    - Make updates with status='completed' and fills editor_data + insights
    - Frontend polls until status='completed' or 'failed'
*/

-- Add source column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stored_cvs' AND column_name = 'source'
  ) THEN
    ALTER TABLE stored_cvs ADD COLUMN source text DEFAULT 'wizard';
  END IF;
END $$;

-- Add error_message column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stored_cvs' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE stored_cvs ADD COLUMN error_message text;
  END IF;
END $$;

-- Make sure status has default
ALTER TABLE stored_cvs ALTER COLUMN status SET DEFAULT 'draft';

-- Add check constraint for status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'stored_cvs_status_check'
  ) THEN
    ALTER TABLE stored_cvs 
    ADD CONSTRAINT stored_cvs_status_check 
    CHECK (status IN ('draft', 'processing', 'completed', 'failed'));
  END IF;
END $$;

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_stored_cvs_status ON stored_cvs(status);

-- Create index on session_id for anonymous access
CREATE INDEX IF NOT EXISTS idx_stored_cvs_session_id ON stored_cvs(session_id);
