-- Consolidated schema for applications to ensure all fields used in code exist in DB
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS alt_phone TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS religion TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city_town TEXT,
ADD COLUMN IF NOT EXISTS region_state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Ghana',
ADD COLUMN IF NOT EXISTS level_of_study TEXT DEFAULT 'shs',
ADD COLUMN IF NOT EXISTS programme_name TEXT,
ADD COLUMN IF NOT EXISTS elective_combination TEXT,
ADD COLUMN IF NOT EXISTS mode_of_study TEXT,
ADD COLUMN IF NOT EXISTS preferred_campus TEXT DEFAULT 'main',
ADD COLUMN IF NOT EXISTS jhs_name TEXT,
ADD COLUMN IF NOT EXISTS jhs_location TEXT,
ADD COLUMN IF NOT EXISTS bece_index TEXT,
ADD COLUMN IF NOT EXISTS bece_year TEXT,
ADD COLUMN IF NOT EXISTS id_type TEXT,
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS passport_photo_url TEXT,
ADD COLUMN IF NOT EXISTS national_id_url TEXT,
ADD COLUMN IF NOT EXISTS declaration_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS digital_signature TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Ensure unique constraint on user_id for upsert logic
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'applications_user_id_key'
    ) THEN
        ALTER TABLE public.applications ADD CONSTRAINT applications_user_id_key UNIQUE (user_id);
    END IF;
END $$;
