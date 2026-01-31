/*
  # Create cv-pdfs bucket (private with signed URLs)

  ## Changes
  
  1. Create storage bucket `cv-pdfs` for storing generated PDFs
  
  ## Security
  - Bucket is PRIVATE
  - Only authenticated users can upload their own CVs
  - Downloads only via signed URLs (7-day expiry)
  - Anonymous users cannot access this bucket
  
  ## Notes
  - Signed URLs are generated server-side when PDF is created
  - Prevents unauthorized access to PDFs
  - URLs expire after 7 days
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-pdfs', 'cv-pdfs', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own PDFs" ON storage.objects;

CREATE POLICY "Users can upload own PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cv-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own PDFs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cv-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);