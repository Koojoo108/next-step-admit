import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    const fullName = `${a.first_name || ''} ${a.middle_name || ''} ${a.last_name || ''}`.trim().toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || a.bece_index?.includes(search);
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
                  <td className="px-4 py-3 text-foreground font-medium">
                    {app.first_name} {app.last_name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{app.bece_index || 'N/A'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{app.first_choice || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      app.status === 'approved' ? 'bg-success/10 text-success border border-success/20' :
                      app.status === 'rejected' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                      app.status === 'pending' ? 'bg-warning/10 text-warning border border-warning/20' :
                      'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(app)} className="h-8 w-8 p-0 rounded-full hover:bg-muted">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground italic">No applications found matching your criteria</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl">
          {selected && (
            <div className="flex flex-col">
              <div className="h-2 bg-gradient-to-r from-primary to-accent" />
              <div className="p-8 md:p-12 space-y-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight italic text-primary">
                      {selected.first_name} <span className="text-foreground">{selected.last_name}</span>
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm mt-1">Application ID: <span className="text-foreground font-bold">{selected.application_id_display || 'PENDING'}</span></p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] ${
                    selected.status === 'approved' ? 'bg-success/10 text-success border-success/20' :
                    selected.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    {selected.status}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b pb-2">Personal & Contact</h3>
                      <div className="space-y-2">
                        <DetailRow label="Gender" value={selected.gender} />
                        <DetailRow label="DOB" value={selected.date_of_birth} />
                        <DetailRow label="Nationality" value={selected.nationality} />
                        <DetailRow label="Email" value={selected.email_address} />
                        <DetailRow label="Phone" value={selected.phone_number} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b pb-2">Programme Selection</h3>
                      <div className="space-y-2">
                        <DetailRow label="1st Choice" value={selected.first_choice} />
                        <DetailRow label="2nd Choice" value={selected.second_choice} />
                        <DetailRow label="Mode" value={selected.mode_of_study} />
                        <DetailRow label="Campus" value={selected.preferred_campus} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b pb-2">Academic Record</h3>
                      <div className="space-y-2">
                        <DetailRow label="JHS Name" value={selected.jhs_name} />
                        <DetailRow label="Index No" value={selected.bece_index} />
                        <DetailRow label="Exam Year" value={selected.bece_year} />
                        <DetailRow label="Exam Body" value={selected.exam_body} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b pb-2">Guardian Info</h3>
                      <div className="space-y-2">
                        <DetailRow label="Name" value={selected.guardian_name} />
                        <DetailRow label="Relation" value={selected.parent_relationship} />
                        <DetailRow label="Contact" value={selected.guardian_phone} />
                      </div>
                    </div>
                  </div>
                </div>

                {selected.personal_statement && (
                  <div className="bg-muted/30 p-8 rounded-3xl space-y-3 border border-border/50">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Personal Statement</h3>
                    <p className="text-sm leading-relaxed text-foreground/80 italic">"{selected.personal_statement}"</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                  <Button onClick={() => updateStatus(selected.id, 'approved')} className="bg-success hover:bg-success/90 text-white rounded-xl h-11 px-6 font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-success/10">
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve Application
                  </Button>
                  <Button variant="destructive" onClick={() => updateStatus(selected.id, 'rejected')} className="rounded-xl h-11 px-6 font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-destructive/10">
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                  <Button variant="outline" onClick={() => updateStatus(selected.id, 'waitlisted')} className="rounded-xl h-11 px-6 font-bold text-xs uppercase tracking-widest transition-all border-2">
                    <Clock className="h-4 w-4 mr-2" /> Waitlist
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex justify-between text-xs py-1 border-b border-border/30 last:border-0">
    <span className="text-muted-foreground font-bold uppercase tracking-tighter">{label}:</span>
    <span className="text-foreground font-black text-right">{value || 'N/A'}</span>
  </div>
);

export default ApplicantsPage;
