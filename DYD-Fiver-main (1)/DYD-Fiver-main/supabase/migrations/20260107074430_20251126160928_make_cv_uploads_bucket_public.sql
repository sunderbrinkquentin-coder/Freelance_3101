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

-- First create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv_uploads', 'cv_uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;