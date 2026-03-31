import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye, User, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Students = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('status', 'admitted')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const filtered = searchTerm
    ? students.filter(s => (s.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()))
    : students;

  const exportCSV = () => {
    if (filtered.length === 0) return toast.info('No data to export');
    const headers = ['Name', 'Programme', 'Admission Date', 'Gender', 'BECE Index'];
    const rows = filtered.map(s => [s.full_name, s.first_choice, s.updated_at, s.gender, s.bece_index]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'students.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admitted Students</h1>
          <p className="text-sm text-muted-foreground">Students who have been admitted to Duapa Academy</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
          <Button variant="outline" size="sm" onClick={fetchStudents} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading students...</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Programme</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Admitted On</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Gender</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground">
                        <User className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No admitted students found.</p>
                      </td>
                    </tr>
                  ) : filtered.map(s => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                            {(s.full_name || 'S').charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{s.full_name || 'Unnamed'}</div>
                            <div className="text-xs text-muted-foreground">{s.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">{s.first_choice || 'N/A'}</td>
                      <td className="px-6 py-4 text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(s.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-foreground">{s.gender || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;
