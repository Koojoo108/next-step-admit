
-- Create payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'GHS',
  reference text,
  payment_method text,
  status text NOT NULL DEFAULT 'pending',
  payment_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view own payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT TO public USING (auth.uid() = user_id);

-- Users can insert own payments
CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

-- Admins can manage all payments
CREATE POLICY "Admins can update payments" ON public.payments
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for applications
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
