import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Mail, Phone, MapPin, FileText, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Applicants = () => {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setApplicants(data || []);
    } catch (err) {
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplicants(); }, []);

  const filtered = searchTerm
    ? applicants.filter(a =>
        (a.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.id || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : applicants;

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      admitted: 'bg-success/10 text-success border-success/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
      submitted: 'bg-info/10 text-info border-info/20',
    };
    return map[status] || 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Applicants Directory</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search applicants..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(app => (
          <Card key={app.id} className="hover:shadow-lg transition-all border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border border-primary/20">
                  {(app.full_name || 'A').charAt(0)}
                </div>
                <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-lg text-foreground">{app.full_name || 'Unnamed'}</h3>
                <p className="text-xs text-muted-foreground">{app.id.slice(0, 8)}...</p>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{app.address || 'No address'}</div>
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />{app.first_choice || 'No programme'}</div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</span>
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => { setSelectedApp(app); setProfileOpen(true); }}>View Profile</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center py-20 bg-card rounded-lg border border-dashed border-border">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No applicants found.</p>
          </div>
        )}
      </div>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 border-border bg-card">
          <DialogHeader className="p-6 pb-3 bg-primary/5 border-b border-border">
            <DialogTitle className="text-xl font-bold text-foreground">{selectedApp?.full_name || 'Applicant'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6">
            {selectedApp && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <h4 className="font-bold text-primary border-b border-border pb-1">Personal</h4>
                  <p><span className="text-muted-foreground">Gender:</span> <span className="font-medium text-foreground">{selectedApp.gender || 'N/A'}</span></p>
                  <p><span className="text-muted-foreground">DOB:</span> <span className="font-medium text-foreground">{selectedApp.date_of_birth || 'N/A'}</span></p>
                  <p><span className="text-muted-foreground">Nationality:</span> <span className="font-medium text-foreground">{selectedApp.nationality || 'N/A'}</span></p>
                  <p><span className="text-muted-foreground">Address:</span> <span className="font-medium text-foreground">{selectedApp.address || 'N/A'}</span></p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-primary border-b border-border pb-1">Guardian</h4>
                  <p><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{selectedApp.guardian_name || 'N/A'}</span></p>
                  <p><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground">{selectedApp.guardian_phone || 'N/A'}</span></p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-primary border-b border-border pb-1">Academic</h4>
                  <p><span className="text-muted-foreground">JHS:</span> <span className="font-medium text-foreground">{selectedApp.jhs_name || 'N/A'}</span></p>
                  <p><span className="text-muted-foreground">BECE Index:</span> <span className="font-medium text-foreground">{selectedApp.bece_index || 'N/A'}</span></p>
                  <p><span className="text-muted-foreground">BECE Year:</span> <span className="font-medium text-foreground">{selectedApp.bece_year || 'N/A'}</span></p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-primary border-b border-border pb-1">Programme Choices</h4>
                  <p><span className="text-muted-foreground">1st:</span> <span className="font-bold text-primary">{selectedApp.first_choice || 'N/A'}</span></p>
                  <p><span className="text-muted-foreground">2nd:</span> <span className="font-medium text-foreground">{selectedApp.second_choice || 'N/A'}</span></p>
                  <p><span className="text-muted-foreground">3rd:</span> <span className="font-medium text-foreground">{selectedApp.third_choice || 'N/A'}</span></p>
                </div>
                <div className="space-y-3 col-span-full">
                  <h4 className="font-bold text-primary border-b border-border pb-1">BECE Grades</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border text-center">
                      <span className="text-xs text-muted-foreground block">English</span>
                      <span className="font-bold text-foreground">{selectedApp.english_grade || '—'}</span>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border text-center">
                      <span className="text-xs text-muted-foreground block">Maths</span>
                      <span className="font-bold text-foreground">{selectedApp.math_grade || '—'}</span>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border text-center">
                      <span className="text-xs text-muted-foreground block">Science</span>
                      <span className="font-bold text-foreground">{selectedApp.science_grade || '—'}</span>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border text-center">
                      <span className="text-xs text-muted-foreground block">Social</span>
                      <span className="font-bold text-foreground">{selectedApp.social_grade || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="p-4 border-t border-border">
            <Button variant="outline" onClick={() => setProfileOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applicants;
