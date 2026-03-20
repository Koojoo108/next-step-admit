-- Add national_id_url to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS national_id_url TEXT;
