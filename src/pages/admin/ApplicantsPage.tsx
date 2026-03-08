import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ApplicantsPage = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    setApplications(data || []);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('applications').update({ status }).eq('id', id);
    toast({ title: `Application ${status}` });
    setSelected(null);
    load();
  };

  const filtered = applications.filter(a => {
    const matchesSearch = a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.bece_index?.includes(search);
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Applicant Management</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or BECE index..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">BECE Index</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">1st Choice</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">{app.full_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{app.bece_index || 'N/A'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{app.first_choice || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      app.status === 'approved' ? 'bg-success/10 text-success' :
                      app.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                      app.status === 'pending' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(app)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No applications found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Applicant Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selected.full_name}</span></div>
                <div><span className="text-muted-foreground">Gender:</span> <span className="font-medium">{selected.gender}</span></div>
                <div><span className="text-muted-foreground">DOB:</span> <span className="font-medium">{selected.date_of_birth}</span></div>
                <div><span className="text-muted-foreground">Nationality:</span> <span className="font-medium">{selected.nationality}</span></div>
                <div><span className="text-muted-foreground">Address:</span> <span className="font-medium">{selected.address}</span></div>
                <div><span className="text-muted-foreground">Guardian:</span> <span className="font-medium">{selected.guardian_name}</span></div>
                <div><span className="text-muted-foreground">JHS:</span> <span className="font-medium">{selected.jhs_name}</span></div>
                <div><span className="text-muted-foreground">BECE:</span> <span className="font-medium">{selected.bece_index} ({selected.bece_year})</span></div>
                <div><span className="text-muted-foreground">1st Choice:</span> <span className="font-medium">{selected.first_choice}</span></div>
                <div><span className="text-muted-foreground">2nd Choice:</span> <span className="font-medium">{selected.second_choice}</span></div>
                <div><span className="text-muted-foreground">3rd Choice:</span> <span className="font-medium">{selected.third_choice}</span></div>
                <div><span className="text-muted-foreground">Grades:</span> <span className="font-medium">E:{selected.english_grade} M:{selected.math_grade} S:{selected.science_grade} SS:{selected.social_grade}</span></div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button onClick={() => updateStatus(selected.id, 'approved')} className="bg-success text-success-foreground hover:bg-success/90">
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button variant="destructive" onClick={() => updateStatus(selected.id, 'rejected')}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button variant="outline" onClick={() => updateStatus(selected.id, 'waitlisted')}>
                  <Clock className="h-4 w-4 mr-1" /> Waitlist
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicantsPage;
