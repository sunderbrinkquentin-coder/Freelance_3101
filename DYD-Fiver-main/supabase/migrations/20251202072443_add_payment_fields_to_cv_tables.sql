/*
  # Add Payment Fields to CV Tables

  ## Changes

  1. stored_cvs table
    - Add `payment_date` column (timestamptz) to track when payment was made
    - Add `download_unlocked` column (boolean) to control download access

  2. cv_records table (if exists)
    - Add `is_paid` column (boolean) to track payment status
    - Add `payment_date` column (timestamptz) to track when payment was made

  ## Notes
  - These fields are used by the Stripe webhook to mark CVs as paid
  - download_unlocked enables PDF/DOCX downloads after payment
*/

-- Add payment fields to stored_cvs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stored_cvs' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE stored_cvs ADD COLUMN payment_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stored_cvs' AND column_name = 'download_unlocked'
  ) THEN
    ALTER TABLE stored_cvs ADD COLUMN download_unlocked boolean DEFAULT false;
  END IF;
END $$;

-- Add payment fields to cv_records if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'cv_records'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'cv_records' AND column_name = 'is_paid'
    ) THEN
      ALTER TABLE cv_records ADD COLUMN is_paid boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'cv_records' AND column_name = 'payment_date'
    ) THEN
      ALTER TABLE cv_records ADD COLUMN payment_date timestamptz;
    END IF;
  END IF;
END $$;

-- Create index for efficient payment lookups
CREATE INDEX IF NOT EXISTS idx_stored_cvs_is_paid ON stored_cvs(is_paid);