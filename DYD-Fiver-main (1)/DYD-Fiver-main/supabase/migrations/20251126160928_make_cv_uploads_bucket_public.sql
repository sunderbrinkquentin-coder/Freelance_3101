/*
  # Make cv_uploads Bucket Public

  1. Changes
    - Update cv_uploads bucket to be public
    - This enables direct public URL access for Make.com and Google Vision API
  
  2. Security
    - Bucket is already protected by RLS policies
    - Public access only allows reading files
    - Upload/delete policies control write access
*/

-- Make the cv_uploads bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'cv_uploads';
