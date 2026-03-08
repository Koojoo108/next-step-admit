import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import schoolCrest from '@/assets/school-crest.png';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, phone);
    setLoading(false);
    if (error) {
      toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Account created! Please check your email to verify.' });
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={schoolCrest} alt="School Crest" className="h-20 w-20 mx-auto mb-4" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2">Register to start your application</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg p-8 shadow-card border border-border space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="John Doe" />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+233 XX XXX XXXX" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary hover:underline font-medium">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
