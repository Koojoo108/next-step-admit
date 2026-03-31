import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminUsers = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('role');
      if (error) throw error;
      setRoles(data || []);
    } catch (err) {
      toast.error('Failed to load user roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">User Roles</h1>
        <Button variant="outline" size="sm" onClick={fetchRoles} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
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
    </div>
  );
};

export default AdminUsers;
