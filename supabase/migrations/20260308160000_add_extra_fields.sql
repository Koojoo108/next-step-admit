-- Add more fields to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS place_of_birth TEXT,
ADD COLUMN IF NOT EXISTS religion TEXT,
ADD COLUMN IF NOT EXISTS jhs_start_year TEXT,
ADD COLUMN IF NOT EXISTS jhs_end_year TEXT,
ADD COLUMN IF NOT EXISTS extracurriculars TEXT;
