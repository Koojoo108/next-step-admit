
-- Site settings table (single-row config)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name text NOT NULL DEFAULT 'DUAPA ACADEMY',
  logo_url text,
  favicon_url text,
  admission_start date,
  admission_end date,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT TO public USING (true);

-- Only admins can update
CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert
CREATE POLICY "Admins can insert site settings" ON public.site_settings
  FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed with default row
INSERT INTO public.site_settings (school_name, logo_url, favicon_url)
VALUES ('DUAPA ACADEMY', null, null);
