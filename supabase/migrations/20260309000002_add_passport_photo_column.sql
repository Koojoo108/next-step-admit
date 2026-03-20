-- Add passport_photo_url to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS passport_photo_url TEXT;

-- Ensure the documents bucket exists and is public for avatars if desired, 
-- but here we keep it private per previous setup and use signed URLs or public if preferred.
-- For simplicity in previewing, we can make a specific folder public or the whole bucket.
-- Let's stick to the current bucket and ensure policies allow the upload.

CREATE POLICY "Users can update their own application photo" 
ON public.applications FOR UPDATE 
USING (auth.uid() = user_id);
