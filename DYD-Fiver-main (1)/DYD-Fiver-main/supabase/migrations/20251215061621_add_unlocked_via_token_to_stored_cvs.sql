/*
  # Add unlocked_via_token field to stored_cvs

  ## Changes
  
  1. stored_cvs table
    - Add `unlocked_via_token` column (boolean) to track if CV was unlocked via token
  
  ## Purpose
  - Separate token-based unlocks from Stripe payments
  - `is_paid` = true: only via Stripe payment
  - `unlocked_via_token` = true: unlocked via token consumption
  - `download_unlocked` = true: can be set by either payment method
  
  ## Notes
  - Token-based unlocks will set `unlocked_via_token = true` and `download_unlocked = true`
  - Stripe payments will set `is_paid = true` and `download_unlocked = true`
  - `unlocked_via_token` and `is_paid` are mutually exclusive
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stored_cvs' AND column_name = 'unlocked_via_token'
  ) THEN
    ALTER TABLE stored_cvs ADD COLUMN unlocked_via_token boolean DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stored_cvs_unlocked_via_token ON stored_cvs(unlocked_via_token);