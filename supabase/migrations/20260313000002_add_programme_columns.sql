-- Add programme selection columns to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS programme_name TEXT,
ADD COLUMN IF NOT EXISTS elective_combination TEXT;
