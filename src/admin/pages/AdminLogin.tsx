import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import schoolCrest from '@/assets/school-crest.png';
import { useAdminAuth } from '../hooks/useAdminAuth';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;

    console.log('[AdminLogin] Form submitted');
    console.log('[AdminLogin] Email input:', email);
    console.log('[AdminLogin] Password input:', password);
    console.log('[AdminLogin] Email length:', email.length);
    console.log('[AdminLogin] Password length:', password.length);

    setError('');
    setIsSigningIn(true);

    const result = await login(email, password);

    if (result.success) {
      console.log('[AdminLogin] Login success, navigating...');
      navigate('/admin');
    } else {
      console.log('[AdminLogin] Login failed:', result.error);
      setError(result.error || 'Login failed');
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Admin Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 p-12 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <img src={schoolCrest} alt="Crest" className="h-10 w-10 brightness-0 invert" />
          <div>
            <h1 className="text-white text-2xl font-bold">Prestige SHS</h1>
            <p className="text-blue-200 text-sm">Admin Management Portal</p>
          </div>
        </div>
        
        <div className="text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome Admin</h2>
          <p className="text-blue-100 mb-8">
            Secure access to manage student applications, admissions, and records.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-300" />
              <span className="text-sm">Secure Authentication</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-300" />
              <span className="text-sm">Role-Based Access</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-300" />
              <span className="text-sm">Complete Management System</span>
            </div>
          </div>
        </div>
        
        <div className="text-blue-200 text-sm">
          © {new Date().getFullYear()} Prestige Senior High School. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@prestige.edu.gh"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isSigningIn}
              >
                {isSigningIn ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Development credentials display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs space-y-2">
                <p className="font-semibold text-blue-800 mb-1">Official Admin Login:</p>
                <div className="space-y-1">
                  <p className="text-blue-700">Email: admin@prestige.edu.gh</p>
                  <p className="text-blue-700">Password: admin123</p>
                </div>
              </div>

              {/* Quick test button */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs">
                <p className="font-semibold text-green-800 mb-2">Quick Test:</p>
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={() => {
                      console.log('[AdminLogin] Quick test button clicked');
                      setEmail('admin@prestige.edu.gh');
                      setPassword('admin123');
                      setTimeout(() => {
                        const form = document.querySelector('form') as HTMLFormElement;
                        if (form) {
                          form.dispatchEvent(new Event('submit', { cancelable: true }));
                        }
                      }, 100);
                    }}
                    className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Test Admin Account
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-sm"
                >
                  ← Back to Main Website
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;

