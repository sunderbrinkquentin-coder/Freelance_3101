/*
  # Make cv-uploads Bucket Public (CORRECT BUCKET)

  1. Changes
    - Update cv-uploads bucket to be public
    - This enables direct public URL access for Make.com and Google Vision API
  
  2. Security
    - Bucket is already protected by RLS policies
    - Public access only allows reading files
    - Upload/delete policies control write access
  
  3. Note
    - The correct bucket name is 'cv-uploads' (with hyphen), not 'cv_uploads'
*/

-- Make the correct bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'cv-uploads';
