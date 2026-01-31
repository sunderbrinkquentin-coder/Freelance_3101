/*
  # Add PDF generation fields to stored_cvs

  1. New Columns
    - `pdf_url` (text) - Public URL of generated PDF after payment
    - `error_message` (text) - Error message if PDF generation fails

  2. Purpose
    - pdf_url: Stores the generated PDF URL after Stripe payment
    - error_message: Logs any PDF generation failures for debugging
    - Enables post-payment PDF generation workflow

  3. Workflow
    - After checkout.session.completed, generate-cv-pdf edge function creates PDF
    - PDF uploaded to storage "cvs" bucket: {user_id}/{cvId}.pdf
    - Public URL stored in pdf_url column
    - If generation fails, error logged in error_message, is_paid stays true
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stored_cvs' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE stored_cvs ADD COLUMN pdf_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stored_cvs' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE stored_cvs ADD COLUMN error_message text;
  END IF;
END $$;
