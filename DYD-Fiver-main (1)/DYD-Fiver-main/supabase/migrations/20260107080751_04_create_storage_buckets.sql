/*
  # Create Storage Buckets for CV Files
  
  1. Buckets
    - cv_uploads - Public bucket for uploaded CV files (for analysis)
    - cv-pdfs - Private bucket for generated PDFs (signed URLs)
    - cvs - Public bucket for final generated CV PDFs (after payment)
  
  2. Security
    - cv_uploads: Public read, controlled write via RLS
    - cv-pdfs: Private, signed URLs only
    - cvs: Public read for downloaded PDFs
*/

-- Create cv_uploads bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv_uploads', 'cv_uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create cv-pdfs bucket (private, signed URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-pdfs', 'cv-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Create cvs bucket (public for downloaded CVs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for cv_uploads bucket
DROP POLICY IF EXISTS "Users can upload to cv_uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to cv_uploads" ON storage.objects;

CREATE POLICY "Users can upload to cv_uploads"
  ON storage.objects FOR INSERT
  TO authenticated, anon
  WITH CHECK (bucket_id = 'cv_uploads');

CREATE POLICY "Public read access to cv_uploads"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'cv_uploads');

-- Policies for cv-pdfs bucket (private)
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

-- Policies for cvs bucket (public)
DROP POLICY IF EXISTS "Allow public read access to PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users read access to PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access" ON storage.objects;

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