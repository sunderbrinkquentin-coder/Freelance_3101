/*
  # Add Download Tracking to stored_cvs

  1. Changes
    - Add download_count column to track number of downloads
    - Add last_downloaded_at column to track last download time

  2. Security
    - Both fields are tracked automatically on download
*/

-- Add download_count column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stored_cvs' AND column_name = 'download_count'
  ) THEN
    ALTER TABLE stored_cvs ADD COLUMN download_count integer DEFAULT 0;
  END IF;
END $$;

-- Add last_downloaded_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stored_cvs' AND column_name = 'last_downloaded_at'
  ) THEN
    ALTER TABLE stored_cvs ADD COLUMN last_downloaded_at timestamptz;
  END IF;
END $$;

-- Create index on last_downloaded_at for faster queries
CREATE INDEX IF NOT EXISTS idx_stored_cvs_last_downloaded ON stored_cvs(last_downloaded_at);
