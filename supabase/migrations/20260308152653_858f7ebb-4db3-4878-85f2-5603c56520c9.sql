-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- User roles table (separate from profiles per security best practices)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'student',
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Auto-assign student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Applications table
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    full_name TEXT,
    date_of_birth DATE,
    gender TEXT,
    nationality TEXT,
    address TEXT,
    guardian_name TEXT,
    guardian_phone TEXT,
    jhs_name TEXT,
    jhs_location TEXT,
    bece_index TEXT,
    bece_year TEXT,
    english_grade TEXT,
    math_grade TEXT,
    science_grade TEXT,
    social_grade TEXT,
    first_choice TEXT,
    second_choice TEXT,
    third_choice TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all applications" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all applications" ON public.applications FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Documents table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all documents" ON public.documents FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Programmes table
CREATE TABLE public.programmes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view programmes" ON public.programmes FOR SELECT USING (true);
CREATE POLICY "Admins can manage programmes" ON public.programmes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Seed default programmes
INSERT INTO public.programmes (name, description) VALUES
  ('General Science', 'Physics, Chemistry, Biology, Elective Maths'),
  ('General Arts', 'Literature, Government, History, Economics'),
  ('Business', 'Accounting, Business Management, Economics'),
  ('Home Economics', 'Food & Nutrition, Textiles, Management in Living'),
  ('Visual Arts', 'Graphic Design, Sculpture, Ceramics, Painting'),
  ('Agricultural Science', 'Crop Science, Animal Husbandry, General Agriculture');

-- Announcements table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies
CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents storage" ON storage.objects FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all documents storage" ON storage.objects FOR SELECT 
USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();