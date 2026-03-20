-- Add remaining missing fields for application form compatibility
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS place_of_birth TEXT,
ADD COLUMN IF NOT EXISTS parent_relationship TEXT,
ADD COLUMN IF NOT EXISTS parent_occupation TEXT,
ADD COLUMN IF NOT EXISTS parent_address TEXT,
ADD COLUMN IF NOT EXISTS exam_body TEXT DEFAULT 'BECE',
ADD COLUMN IF NOT EXISTS year_of_completion TEXT,
ADD COLUMN IF NOT EXISTS application_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS declaration_accepted BOOLEAN DEFAULT FALSE;

-- Update existing records to have proper defaults
UPDATE public.applications 
SET 
    place_of_birth = COALESCE(place_of_birth, ''),
    parent_relationship = COALESCE(parent_relationship, ''),
    parent_occupation = COALESCE(parent_occupation, ''),
    parent_address = COALESCE(parent_address, ''),
    exam_body = COALESCE(exam_body, 'BECE'),
    year_of_completion = COALESCE(year_of_completion, ''),
    declaration_accepted = COALESCE(declaration_accepted, FALSE)
WHERE place_of_birth IS NULL 
   OR parent_relationship IS NULL 
   OR parent_occupation IS NULL 
   OR parent_address IS NULL 
   OR exam_body IS NULL 
   OR year_of_completion IS NULL 
   OR declaration_accepted IS NULL;
