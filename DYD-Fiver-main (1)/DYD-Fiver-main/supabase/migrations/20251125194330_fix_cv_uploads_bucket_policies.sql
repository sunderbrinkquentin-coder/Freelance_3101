/*
  # Fix CV-Uploads Storage Bucket Policies
  
  1. Security
    - Enable public access for uploads
    - Enable public access for downloads
    - Allow anyone to upload CV files
    - Allow anyone to read CV files
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public uploads to cv-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads from cv-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to cv-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from cv-uploads" ON storage.objects;

-- Create policies for cv-uploads bucket
CREATE POLICY "Allow public uploads to cv-uploads"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'cv-uploads');

CREATE POLICY "Allow public downloads from cv-uploads"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'cv-uploads');

CREATE POLICY "Allow public updates to cv-uploads"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'cv-uploads')
  WITH CHECK (bucket_id = 'cv-uploads');

CREATE POLICY "Allow public deletes from cv-uploads"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'cv-uploads');
