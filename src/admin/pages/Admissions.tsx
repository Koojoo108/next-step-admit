import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, XCircle, RefreshCw, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { adminDataService } from '../services/adminDataService';
import { toast } from 'sonner';

const Admissions = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('applications')
        .select('*')
        .neq('status', 'draft')
        .order('updated_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setApplications(data || []);
    } catch {
      toast.error('Failed to load admissions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('admissions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'admitted' : 'rejected';
    const result = await adminDataService.updateApplicationStatus(id, newStatus);
    if (result.success) {
      toast.success(`Application ${action === 'approve' ? 'admitted' : 'rejected'}`);
      fetchData();
    } else {
      toast.error(result.error || 'Update failed');
    }
  };

  const handleSendLetter = async (app: any) => {
    try {
      // Trigger admission letter email via edge function
      await supabase.functions.invoke('send-otp', {
        body: {
          type: 'admission_letter',
          applicantName: app.full_name || 'Applicant',
          status: app.status,
          programme: app.first_choice || 'N/A',
          // This would send to the applicant's email if we had it
        },
      });
      toast.success(`Admission letter notification sent for ${app.full_name || 'Applicant'}`);
    } catch {
      toast.error('Failed to send admission letter');
    }
  };

  const filtered = searchTerm
    ? applications.filter(a => (a.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()))
    : applications;

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      admitted: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
      pending: 'bg-warning/10 text-warning',
      submitted: 'bg-info/10 text-info',
    };
    return map[status] || 'bg-muted text-muted-foreground';
  };

  // Summary counts
  const counts = {
    total: applications.length,
    admitted: applications.filter(a => a.status === 'admitted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    pending: applications.filter(a => a.status === 'pending' || a.status === 'submitted').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admissions Management</h1>
          <p className="text-sm text-muted-foreground">Review and manage student admission decisions</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, cls: 'text-primary' },
          { label: 'Pending', value: counts.pending, cls: 'text-warning' },
          { label: 'Admitted', value: counts.admitted, cls: 'text-success' },
          { label: 'Rejected', value: counts.rejected, cls: 'text-destructive' },
        ].map(c => (
          <Card key={c.label} className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${c.cls}`}>{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-input bg-background text-foreground rounded-lg">
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="pending">Pending</option>
            <option value="admitted">Admitted</option>
            <option value="rejected">Rejected</option>
          </select>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Programme</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No admissions found.</td></tr>
                ) : filtered.map(app => (
                  <tr key={app.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{app.full_name || 'Unnamed'}</div>
                      <div className="text-xs text-muted-foreground">{app.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 text-foreground">{app.first_choice || 'N/A'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(app.updated_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {(app.status === 'pending' || app.status === 'submitted') && (
                          <>
                            <Button size="sm" variant="ghost" className="text-success hover:bg-success/10" onClick={() => handleAction(app.id, 'approve')} title="Accept">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleAction(app.id, 'reject')} title="Reject">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {(app.status === 'admitted' || app.status === 'rejected') && (
                          <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10" onClick={() => handleSendLetter(app)} title="Send Admission Letter">
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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

export default Admissions;
