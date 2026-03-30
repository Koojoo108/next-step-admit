import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import schoolCrest from '@/assets/school-crest.png';
import { ArrowRight, CheckCircle2, Home, Phone, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';

type Step = 'form' | 'otp' | 'email-sent';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast({ title: 'Error', description: 'Please enter a valid phone number with country code (e.g., +233...)', variant: 'destructive' });
      return;
    }

    setOtpSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone, action: 'send' },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Code Sent!', description: `A 6-digit code has been sent to ${phone}` });
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      toast({ title: 'SMS Failed', description: err.message || 'Could not send verification code', variant: 'destructive' });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast({ title: 'Error', description: 'Please enter the full 6-digit code', variant: 'destructive' });
      return;
    }

    setOtpVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone, action: 'verify', code: otpCode },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.verified) {
        setPhoneVerified(true);
        toast({ title: 'Phone Verified!', description: 'Your phone number has been verified successfully.' });
        setStep('form');
      }
    } catch (err: any) {
      toast({ title: 'Verification Failed', description: err.message || 'Invalid code', variant: 'destructive' });
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    if (!phoneVerified) {
      toast({ title: 'Phone Not Verified', description: 'Please verify your phone number before creating an account.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUp(email, password, fullName, phone);

      if (error) {
        toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Email confirmation is required — user must check their inbox
      if (data.user && !data.session) {
        setStep('email-sent');
        return;
      }

      toast({ title: 'Welcome!', description: 'Account created successfully.' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderBrandSide = () => (
    <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-950 p-12 relative overflow-hidden">
      <div className="relative z-10 flex items-center gap-3">
        <img src={schoolCrest} alt="Crest" className="h-10 w-10 brightness-0 invert" />
        <span className="font-display font-bold text-white text-xl tracking-tight">Duapa Academy</span>
      </div>

      <div className="relative z-10 max-w-lg space-y-6">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
          Join our community of scholars.
        </h2>
        <p className="text-primary-foreground/70 text-lg">
          Create an account to begin your journey towards academic excellence at Duapa Academy.
        </p>
        <div className="space-y-4 pt-4">
          {['Email Verification', 'SMS OTP Authentication', 'Secure Portal Access'].map((label) => (
            <div key={label} className="flex items-center gap-3 text-white">
              <div className="bg-accent/20 p-1 rounded-full"><CheckCircle2 className="text-accent" size={18} /></div>
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-primary-foreground/50 text-sm">© 2026 Prestige Senior High School.</div>
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px]" />
    </div>
  );

  // Email confirmation sent screen
  if (step === 'email-sent') {
    return (
      <div className="min-h-screen flex bg-background">
        {renderBrandSide()}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
          <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Mail className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Check Your Email</h1>
              <p className="text-muted-foreground">
                We've sent a confirmation link to <strong className="text-foreground">{email}</strong>
              </p>
            </div>
            <div className="bg-muted rounded-xl p-6 space-y-3 text-left">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">Click the link in the email to verify your account and activate your admission portal access.</p>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">Your phone number <strong>{phone}</strong> has been verified via SMS ✓</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Didn't receive the email? Check your spam folder or wait a few minutes.</p>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // OTP verification screen
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex bg-background">
        {renderBrandSide()}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 relative">
          <div className="absolute top-8 right-8"><ModeToggle /></div>
          <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Phone className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Verify Your Phone</h1>
              <p className="text-muted-foreground text-sm">
                Enter the 6-digit code sent to <strong className="text-foreground">{phone}</strong>
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold"
              onClick={handleVerifyOTP}
              disabled={otpVerifying || otpCode.length !== 6}
            >
              {otpVerifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 'Verify Code'}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Button variant="ghost" size="sm" onClick={() => { setStep('form'); setOtpCode(''); }}>
                ← Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={resendTimer > 0}
                onClick={handleSendOTP}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main registration form
  return (
    <div className="min-h-screen flex bg-background">
      {renderBrandSide()}

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 relative overflow-y-auto">
        <div className="absolute top-8 right-8"><ModeToggle /></div>

        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <img src={schoolCrest} alt="Crest" className="h-8 w-8" />
          <span className="font-display font-bold text-foreground text-sm tracking-tight">Prestige SHS</span>
        </div>

        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-12 lg:py-0">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Create Account</h1>
            <p className="text-muted-foreground text-sm">Start your application today.</p>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Secure Signup:</strong> Phone verification via SMS and email confirmation are required.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="John Doe" className="h-11 rounded-xl border-border" />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@example.com" className="h-11 rounded-xl border-border" />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="+233 XX XXX XXXX"
                    className="h-11 rounded-xl border-border flex-1"
                    disabled={phoneVerified}
                  />
                  {phoneVerified ? (
                    <div className="h-11 px-4 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center gap-1 text-xs font-bold whitespace-nowrap">
                      <CheckCircle2 size={14} /> Verified
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-xl whitespace-nowrap"
                      onClick={handleSendOTP}
                      disabled={otpSending || !phone}
                    >
                      {otpSending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="h-11 rounded-xl border-border" />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" className="h-11 rounded-xl border-border" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg transition-all active:scale-95 mt-2"
              disabled={loading || !phoneVerified}
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            {!phoneVerified && (
              <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                ⚠ You must verify your phone number before creating your account.
              </p>
            )}

            <div className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-secondary hover:underline font-bold">Sign in</Link>
            </div>

            <div className="pt-2">
              <Button variant="ghost" className="w-full h-10 rounded-lg text-muted-foreground hover:text-foreground" onClick={() => navigate('/')}>
                <Home className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
