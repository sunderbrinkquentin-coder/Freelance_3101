/*
  # Create cvs storage bucket with public access policies

  1. Storage Bucket
    - Create "cvs" bucket for generated PDF files
    - Allow public read access for downloaded CVs
    - Allow service role write access for PDF generation

  2. Policies
    - Anonymous/Authenticated: READ public PDFs via direct URL
    - Service role: Full access for PDF generation/upload

  3. Path Structure
    - PDFs stored as: {user_id}/{cvId}.pdf
    - Public URL: /storage/v1/object/public/cvs/{user_id}/{cvId}.pdf
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access to PDFs"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'cvs');

CREATE POLICY "Allow authenticated users read access to PDFs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'cvs');

CREATE POLICY "Allow service role full access"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'cvs')
  WITH CHECK (bucket_id = 'cvs');