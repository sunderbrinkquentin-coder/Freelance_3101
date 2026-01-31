/*
  # Add editor_data and insights to cvs table

  1. Changes
    - Add `editor_data` column to store optimized CV data from Make.com
    - Add `insights` column to store AI insights array
    - Add `status` column to track CV processing status

  2. Security
    - Maintains existing RLS policies
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cvs' AND column_name = 'editor_data'
  ) THEN
    ALTER TABLE cvs ADD COLUMN editor_data jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cvs' AND column_name = 'insights'
  ) THEN
    ALTER TABLE cvs ADD COLUMN insights jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cvs' AND column_name = 'status'
  ) THEN
    ALTER TABLE cvs ADD COLUMN status text DEFAULT 'draft';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cvs' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE cvs ADD COLUMN session_id text;
  END IF;
END $$;