-- Add email_address column to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS email_address TEXT;
