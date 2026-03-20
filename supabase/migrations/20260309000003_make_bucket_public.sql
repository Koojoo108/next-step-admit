-- Make the documents bucket public so previews work via getPublicUrl
-- In a production environment, you might prefer signed URLs for sensitive docs,
-- but for this portal prototype, public access ensures immediate feedback for the user.
UPDATE storage.buckets SET public = true WHERE id = 'documents';

-- Ensure policies allow public read access
CREATE POLICY "Public Access to Documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents');
