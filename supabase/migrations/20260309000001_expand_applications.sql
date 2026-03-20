-- Update applications table with all professional fields
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS place_of_birth TEXT,
ADD COLUMN IF NOT EXISTS religion TEXT,
ADD COLUMN IF NOT EXISTS alt_phone TEXT,
ADD COLUMN IF NOT EXISTS city_town TEXT,
ADD COLUMN IF NOT EXISTS region_state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS digital_address TEXT,
ADD COLUMN IF NOT EXISTS academic_year TEXT,
ADD COLUMN IF NOT EXISTS level_of_study TEXT,
ADD COLUMN IF NOT EXISTS faculty_school TEXT,
ADD COLUMN IF NOT EXISTS mode_of_study TEXT,
ADD COLUMN IF NOT EXISTS preferred_campus TEXT,
ADD COLUMN IF NOT EXISTS exam_body TEXT,
ADD COLUMN IF NOT EXISTS year_of_completion TEXT,
ADD COLUMN IF NOT EXISTS subjects_grades JSONB, -- Store subjects and grades as JSON
ADD COLUMN IF NOT EXISTS parent_relationship TEXT,
ADD COLUMN IF NOT EXISTS parent_email TEXT,
ADD COLUMN IF NOT EXISTS parent_occupation TEXT,
ADD COLUMN IF NOT EXISTS parent_address TEXT,
ADD COLUMN IF NOT EXISTS id_type TEXT,
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS disability_status TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
ADD COLUMN IF NOT EXISTS extracurriculars TEXT,
ADD COLUMN IF NOT EXISTS personal_statement TEXT,
ADD COLUMN IF NOT EXISTS declaration_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS digital_signature TEXT,
ADD COLUMN IF NOT EXISTS application_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS application_id_display TEXT UNIQUE;

-- Function to generate a unique human-readable Application ID (e.g., ADM-2026-XXXX)
CREATE OR REPLACE FUNCTION generate_application_id() 
RETURNS TRIGGER AS $$
DECLARE
    new_id TEXT;
    year_prefix TEXT;
BEGIN
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
    LOOP
        -- Generate a random 4-digit number
        new_id := 'ADM-' || year_prefix || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        -- Check if it already exists
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.applications WHERE application_id_display = new_id);
    END LOOP;
    NEW.application_id_display := new_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to assign application_id_display on insert
DROP TRIGGER IF EXISTS tr_generate_application_id ON public.applications;
CREATE TRIGGER tr_generate_application_id
    BEFORE INSERT ON public.applications
    FOR EACH ROW
    WHEN (NEW.application_id_display IS NULL)
    EXECUTE FUNCTION generate_application_id();
