import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, FileText, Clock, CheckCircle, XCircle, TrendingUp, Bell, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, students: 0, recent: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('id, full_name, status, first_choice, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const apps = data || [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      setStats({
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending' || a.status === 'submitted').length,
        approved: apps.filter(a => a.status === 'admitted').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
        students: apps.filter(a => a.status === 'admitted').length,
        recent: apps.filter(a => new Date(a.created_at) >= sevenDaysAgo).length,
      });
      setRecentApps(apps.slice(0, 5));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      submitted: 'bg-info/10 text-info border-info/20',
      admitted: 'bg-success/10 text-success border-success/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
      draft: 'bg-muted text-muted-foreground border-border',
    };
    return map[status] || map.draft;
  };

  const cards = [
    { label: 'Total Applications', value: stats.total, icon: FileText, color: 'text-primary' },
    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-warning' },
    { label: 'Admitted', value: stats.approved, icon: CheckCircle, color: 'text-success' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-destructive' },
    { label: 'Total Students', value: stats.students, icon: Users, color: 'text-primary' },
    { label: 'Last 7 Days', value: stats.recent, icon: TrendingUp, color: 'text-accent-foreground' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard Analytics</h1>
          <p className="text-sm text-muted-foreground">Real-time overview of the admission system</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(c => (
          <Card key={c.label} className="border-border bg-card shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <c.icon className={`h-6 w-6 ${c.color}`} />
              </div>
              <p className="text-3xl font-bold text-foreground">{loading ? '—' : c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentApps.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No applications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.map(app => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="font-medium text-foreground">{app.full_name || 'Unnamed'}</p>
                    <p className="text-xs text-muted-foreground">
                      {app.first_choice || 'No programme'} · {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusBadge(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
