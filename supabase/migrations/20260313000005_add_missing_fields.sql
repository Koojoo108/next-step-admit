-- Add missing fields for application form
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS guardian_name TEXT,
ADD COLUMN IF NOT EXISTS guardian_phone TEXT,
ADD COLUMN IF NOT EXISTS second_choice_programme TEXT,
ADD COLUMN IF NOT EXISTS previous_school_name TEXT,
ADD COLUMN IF NOT EXISTS documents_url TEXT,
ADD COLUMN IF NOT EXISTS supporting_documents_url TEXT,
ADD COLUMN IF NOT EXISTS programme_studied TEXT,
ADD COLUMN IF NOT EXISTS last_step_completed INTEGER DEFAULT 0;
