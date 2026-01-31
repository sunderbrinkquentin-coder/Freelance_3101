/*
  # Add Payment and PDF Fields to stored_cvs
  
  1. New Columns
    - payment_date (timestamptz) - When payment was made
    - download_unlocked (boolean) - Controls download access
    - pdf_url (text) - Public URL of generated PDF
    - error_message (text) - PDF generation error messages
  
  2. Purpose
    - Support Stripe payment workflow
    - Enable post-payment PDF generation
    - Track download permissions
  
  3. Indexes
    - Add index for payment lookups
*/

-- Add payment and PDF fields to stored_cvs
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

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stored_cvs' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE stored_cvs ADD COLUMN pdf_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stored_cvs' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE stored_cvs ADD COLUMN error_message text;
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

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_stored_cvs_is_paid ON stored_cvs(is_paid);
CREATE INDEX IF NOT EXISTS idx_stored_cvs_payment_date ON stored_cvs(payment_date);