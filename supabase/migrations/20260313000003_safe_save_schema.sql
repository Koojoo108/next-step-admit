-- Ensure requested columns exist in applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS programme TEXT,
ADD COLUMN IF NOT EXISTS personal_info JSONB;

-- Fix RLS Policies to prevent timeouts/blocks
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Drop existing to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own application" ON public.applications;
DROP POLICY IF EXISTS "Users can update their own application" ON public.applications;
DROP POLICY IF EXISTS "Users can view their own application" ON public.applications;

-- Create robust policies
CREATE POLICY "Users can insert their own application" 
ON public.applications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own application" 
ON public.applications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own application" 
ON public.applications FOR SELECT 
USING (auth.uid() = user_id);
