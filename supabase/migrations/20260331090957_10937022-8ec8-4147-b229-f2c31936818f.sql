
-- 1. Fix user_roles privilege escalation: Replace ALL policy with separate policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can select roles" ON public.user_roles
  FOR SELECT TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix application status self-write: Add WITH CHECK to restrict student-writable statuses
DROP POLICY IF EXISTS "Users can update own applications" ON public.applications;

CREATE POLICY "Users can update own applications" ON public.applications
  FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status IN ('draft', 'submitted'));

-- 3. Fix has_role function: Add RETURNS NULL ON NULL INPUT and revoke direct RPC access
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  RETURNS NULL ON NULL INPUT
  SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;

-- 4. Fix storage policies: Add UPDATE and DELETE policies for documents bucket
CREATE POLICY "Users can update own documents storage"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own documents storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
