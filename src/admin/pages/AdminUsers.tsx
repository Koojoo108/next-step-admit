import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminUsers = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('role');
      if (error) throw error;
      setRoles(data || []);
    } catch {
      toast.error('Failed to load user roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleAddAdmin = async () => {
    if (!newEmail || !newPassword) {
      toast.error('Email and password are required');
      return;
    }
    setAdding(true);
    try {
      // Sign up the new admin user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
      });
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('User creation failed');

      // The trigger auto-creates a 'student' role. Update it to 'admin'.
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' } as any)
        .eq('user_id', signUpData.user.id);
      if (updateError) throw updateError;

      toast.success(`Admin ${newEmail} created successfully`);
      setDialogOpen(false);
      setNewEmail('');
      setNewPassword('');
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create admin');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">User Roles</h1>
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Admin
          </Button>
          <Button variant="outline" size="sm" onClick={fetchRoles} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={2} className="px-6 py-12 text-center"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-muted-foreground">
                      <Shield className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>No user roles found.</p>
                    </td>
                  </tr>
                ) : roles.map(r => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-mono text-xs text-foreground">{r.user_id.slice(0, 12)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={r.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}>
                        {r.role}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Admin</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="admin@duapa.edu.gh" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Strong password" />
            </div>
            <Button onClick={handleAddAdmin} disabled={adding} className="w-full">
              {adding ? 'Creating...' : 'Create Admin'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
