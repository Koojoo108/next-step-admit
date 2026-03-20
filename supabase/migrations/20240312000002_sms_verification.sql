-- Create SMS verification codes table
CREATE TABLE IF NOT EXISTS public.sms_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user phone verification status table
CREATE TABLE IF NOT EXISTS public.user_phone_verification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sms_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_phone_verification ENABLE ROW LEVEL SECURITY;

-- Create policies for SMS verification codes
CREATE POLICY "Users can view own SMS codes" ON public.sms_verification_codes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own SMS codes" ON public.sms_verification_codes
  FOR INSERT WITH CHECK (true);

-- Create policies for user phone verification
CREATE POLICY "Users can view own phone verification" ON public.user_phone_verification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own phone verification" ON public.user_phone_verification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_verification_codes_phone ON public.sms_verification_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_verification_codes_expires ON public.sms_verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_phone_verification_user ON public.user_phone_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_phone_verification_phone ON public.user_phone_verification(phone_number);
