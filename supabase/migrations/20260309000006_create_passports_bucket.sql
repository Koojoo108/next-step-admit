-- Create passports bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('passports', 'passports', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for passports bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'passports' );

CREATE POLICY "Authenticated users can upload passports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'passports' );

CREATE POLICY "Users can update their own passports"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'passports' AND (storage.foldername(name))[1] = auth.uid()::text );
