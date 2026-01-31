/*
  # Create increment_download_count RPC function

  1. New Functions
    - `increment_download_count(cv_id uuid)` - Atomic function to increment download_count and update last_downloaded_at
    
  2. Purpose
    - Replaces the read-then-write pattern with an atomic database operation
    - Ensures no race conditions when multiple downloads happen simultaneously
    - Sets download_count = download_count + 1 and updates last_downloaded_at in one operation
*/

CREATE OR REPLACE FUNCTION increment_download_count(cv_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE stored_cvs
  SET
    download_count = download_count + 1,
    last_downloaded_at = now()
  WHERE id = cv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_download_count(uuid) TO authenticated;
