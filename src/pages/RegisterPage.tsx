import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import schoolCrest from '@/assets/school-crest.png';
import { GraduationCap, ArrowRight, CheckCircle2, Home } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      console.log("[Register] Attempting signup for:", email);
      const { data, error } = await signUp(email, password, fullName, phone);
      
      if (error) {
        console.error("[Register] Signup error:", error.message);
        toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Check if user was created but session not returned (email confirmation needed)
      if (data.user && !data.session) {
        toast({ 
          title: 'Account Created!', 
          description: 'Your account has been created successfully. You can now log in with your credentials.' 
        });
        navigate('/login');
        return;
      }

      // User was created and logged in successfully
      console.log("[Register] Signup and login successful, redirecting to dashboard");
      toast({ title: 'Welcome!', description: 'Account created successfully.' });
      navigate('/dashboard');
    } catch (err: any) {
      console.error("[Register] Unexpected error:", err);
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Brand Side */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-950 p-12 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <img src={schoolCrest} alt="Crest" className="h-10 w-10 brightness-0 invert" />
          <span className="font-display font-bold text-white text-xl tracking-tight">Prestige Portal</span>
        </div>
        
        <div className="relative z-10 max-w-lg space-y-6">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
            Join our community of scholars.
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Create an account to begin your journey towards academic excellence at Prestige Senior High School.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-accent/20 p-1 rounded-full"><CheckCircle2 className="text-accent" size={18} /></div>
              <span className="text-sm font-medium">Quick Application Process</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="bg-accent/20 p-1 rounded-full"><CheckCircle2 className="text-accent" size={18} /></div>
              <span className="text-sm font-medium">Secure Portal Access</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="bg-accent/20 p-1 rounded-full"><CheckCircle2 className="text-accent" size={18} /></div>
              <span className="text-sm font-medium">Instant Notifications</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-primary-foreground/50 text-sm">
          © 2026 Prestige Senior High School.
        </div>

        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 relative overflow-y-auto">
        <div className="absolute top-8 right-8">
          <ModeToggle />
        </div>
        
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <img src={schoolCrest} alt="Crest" className="h-8 w-8" />
          <span className="font-display font-bold text-foreground text-sm tracking-tight">Prestige SHS</span>
        </div>

        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-12 lg:py-0">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Create Account</h1>
            <p className="text-muted-foreground text-sm">Start your application today.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> After registration, you can log in using either your email address or phone number.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  required 
                  placeholder="John Doe" 
                  className="h-11 rounded-xl border-border focus-visible:ring-secondary/20"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  placeholder="name@example.com" 
                  className="h-11 rounded-xl border-border focus-visible:ring-secondary/20"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  required 
                  placeholder="+233 XX XXX XXXX" 
                  className="h-11 rounded-xl border-border focus-visible:ring-secondary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••" 
                    className="h-11 rounded-xl border-border focus-visible:ring-secondary/20"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required 
                    placeholder="••••••••" 
                    className="h-11 rounded-xl border-border focus-visible:ring-secondary/20"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg transition-all active:scale-95 mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-secondary hover:underline font-bold">Sign in</Link>
            </div>

            <div className="pt-2">
              <Button 
                variant="ghost" 
                className="w-full h-10 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => navigate('/')}
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
