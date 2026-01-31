/*
  # Update Storage Policies for Correct Bucket Name

  1. Changes
    - Drop old policies for 'cv-uploads' (with hyphen)
    - Create new policies for 'cv_uploads' (with underscore)
    - This aligns with the actual bucket name in the database
  
  2. Security
    - Public can upload files (for anonymous CV checks)
    - Public can read files (for Make.com and Google Vision)
    - RLS policies on cv_uploads table control data access
*/

-- Drop old policies with wrong bucket name
DROP POLICY IF EXISTS "Allow public uploads to cv-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads from cv-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to cv-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from cv-uploads" ON storage.objects;

-- Create policies for correct bucket name: cv_uploads
CREATE POLICY "Allow public uploads to cv_uploads"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'cv_uploads');

CREATE POLICY "Allow public downloads from cv_uploads"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'cv_uploads');

CREATE POLICY "Allow public updates to cv_uploads"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'cv_uploads')
  WITH CHECK (bucket_id = 'cv_uploads');

CREATE POLICY "Allow public deletes from cv_uploads"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'cv_uploads');
