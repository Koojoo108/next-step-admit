-- MINIMAL: Force insert with only essential columns
INSERT INTO public.applications (
  user_id,
  full_name,
  email,
  phone,
  status,
  application_date,
  application_id_display,
  created_at,
  updated_at
) VALUES (
  '0f6a5384-912d-4158-b3d0-26d058aa9251',
  'JOSEPH NYARKO',
  'nyarkojosephnsonamoah018@gmail.com',
  '+233501234567',
  'pending',
  '2026-03-16T23:00:00Z',
  '5d171767-fbf0-4ded-81a6-90d7219e5d92',
  now(),
  now()
);

-- Verify insertion
SELECT * FROM public.applications WHERE application_id_display = '5d171767-fbf0-4ded-81a6-90d7219e5d92';
