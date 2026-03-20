import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone }
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">My Profile</h1>
      
      <div className="grid gap-6">
        <div className="bg-card rounded-lg p-6 border border-border shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-4">Account Information</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user?.email} disabled className="bg-muted" />
              <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-2">Account Metadata</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between border-b border-border py-2">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-[10px]">{user?.id}</span>
            </div>
            <div className="flex justify-between border-b border-border py-2">
              <span className="text-muted-foreground">Created:</span>
              <span>{user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Last Sign In:</span>
              <span>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
