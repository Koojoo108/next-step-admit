import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

const Reports = () => {
  const [statusData, setStatusData] = useState<any[]>([]);
  const [programmeData, setProgrammeData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('applications').select('status, first_choice, gender');
      if (error) throw error;
      const apps = data || [];

      // Status breakdown
      const statusMap: Record<string, number> = {};
      apps.forEach(a => { statusMap[a.status] = (statusMap[a.status] || 0) + 1; });
      setStatusData(Object.entries(statusMap).map(([name, value]) => ({ name, value })));

      // Programme breakdown
      const progMap: Record<string, number> = {};
      apps.forEach(a => { const p = a.first_choice || 'Unspecified'; progMap[p] = (progMap[p] || 0) + 1; });
      setProgrammeData(Object.entries(progMap).map(([name, applications]) => ({ name, applications })));

      // Gender breakdown
      const genderMap: Record<string, number> = {};
      apps.forEach(a => { const g = a.gender || 'Unspecified'; genderMap[g] = (genderMap[g] || 0) + 1; });
      setGenderData(Object.entries(genderMap).map(([name, value]) => ({ name, value })));
    } catch (err) {
      console.error('Report fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Pie Chart */}
          <Card className="border-border bg-card">
            <CardHeader><CardTitle className="text-foreground">Application Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Programme Bar Chart */}
          <Card className="border-border bg-card">
            <CardHeader><CardTitle className="text-foreground">Applications by Programme</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={programmeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applications" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gender Pie Chart */}
          <Card className="border-border bg-card">
            <CardHeader><CardTitle className="text-foreground">Gender Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genderData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label>
                      {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card className="border-border bg-card">
            <CardHeader><CardTitle className="text-foreground">Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusData.map(s => (
                  <div key={s.name} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border">
                    <span className="capitalize font-medium text-foreground">{s.name}</span>
                    <span className="text-xl font-bold text-primary">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;
