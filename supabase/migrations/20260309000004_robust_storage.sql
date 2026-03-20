-- Ensure storage bucket exists and is public
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('documents', 'documents', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

-- Policies for the 'documents' bucket
-- 1. Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 2. Allow authenticated users to update their own documents
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
CREATE POLICY "Users can update own documents" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Allow public to read documents (since it's a public bucket)
DROP POLICY IF EXISTS "Public Access to Documents" ON storage.objects;
CREATE POLICY "Public Access to Documents" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'documents');
