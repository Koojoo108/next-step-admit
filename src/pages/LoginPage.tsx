import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import schoolCrest from '@/assets/school-crest.png';
import { GraduationCap, ArrowRight, ShieldCheck, AlertCircle, Mail, Home } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { signIn, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginLoading) return;

    setLoginLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        setErrorMsg(error.message);
        toast({ title: 'Login Error', description: error.message, variant: 'destructive' });
        setLoginLoading(false);
        return;
      }

      if (data?.user) {
        toast({ title: 'Welcome back!', description: 'Redirecting to your application portal...' });
        setTimeout(() => {
          setLoginLoading(false);
          navigate('/dashboard', { replace: true });
        }, 500);
      } else {
        setLoginLoading(false);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected system error occurred. Please try again.");
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Brand Side */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-950 p-12 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <img src={schoolCrest} alt="Crest" className="h-10 w-10 brightness-0 invert" />
          <span className="font-display font-bold text-white text-xl tracking-tight">Duapa Academy</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
            Academic excellence starts here.
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Login to complete your application, upload required documents, and track your admission status.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex-1">
              <GraduationCap className="text-accent mb-2" size={24} />
              <div className="text-white font-bold text-xl uppercase">2026/27</div>
              <div className="text-primary-foreground/60 text-xs uppercase tracking-wider">Admission Year</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex-1">
              <ShieldCheck className="text-accent mb-2" size={24} />
              <div className="text-white font-bold text-xl uppercase">Secure</div>
              <div className="text-primary-foreground/60 text-xs uppercase tracking-wider">Authentication</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-primary-foreground/50 text-sm">© 2026 Duapa Academy.</div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 relative">
        <div className="absolute top-8 right-8"><ModeToggle /></div>

        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <img src={schoolCrest} alt="Crest" className="h-8 w-8" />
          <span className="font-display font-bold text-foreground text-sm tracking-tight">Duapa Academy</span>
        </div>

        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2 text-left">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your admission portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-xl flex items-start gap-3 text-sm bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <p className="font-medium">{errorMsg}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="h-12 rounded-xl border-border focus-visible:ring-secondary/20"
                />
              </div>
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="•••••••"
                  className="h-12 rounded-xl border-border focus-visible:ring-secondary/20"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg transition-all active:scale-95" disabled={loginLoading}>
              {loginLoading ? 'Logging in...' : 'Sign In'}
              {!loginLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-secondary hover:underline font-bold">Sign up now</Link>
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

export default LoginPage;
