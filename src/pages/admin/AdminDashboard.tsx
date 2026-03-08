import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('applications').select('status');
      if (data) {
        setStats({
          total: data.length,
          pending: data.filter(a => a.status === 'pending').length,
          approved: data.filter(a => a.status === 'approved').length,
          rejected: data.filter(a => a.status === 'rejected').length,
        });
      }
    };
    load();
  }, []);

  const cards = [
    { label: 'Total Applications', value: stats.total, icon: Users, color: 'text-info' },
    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-warning' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-success' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-destructive' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Dashboard Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-card rounded-lg p-6 border border-border shadow-card">
            <div className="flex items-center justify-between mb-3">
              <c.icon className={`h-6 w-6 ${c.color}`} />
            </div>
            <p className="text-3xl font-bold text-foreground">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
