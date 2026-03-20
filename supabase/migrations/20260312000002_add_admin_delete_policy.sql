-- Add DELETE policy for admins on applications table
CREATE POLICY "Admins can delete applications" ON public.applications 
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Ensure admins can delete documents as well
CREATE POLICY "Admins can delete documents" ON public.documents 
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- If you have a specific policy for storage, ensure admins can delete there too
CREATE POLICY "Admins can delete any document from storage" ON storage.objects 
FOR DELETE USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));
