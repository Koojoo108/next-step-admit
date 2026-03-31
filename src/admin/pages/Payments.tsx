import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Payments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });
      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      paid: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      failed: 'bg-destructive/10 text-destructive',
    };
    return map[status?.toLowerCase()] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>No payments recorded yet.</p>
                    </td>
                  </tr>
                ) : payments.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 text-foreground">{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{p.currency} {Number(p.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{p.reference || '—'}</td>
                    <td className="px-6 py-4 text-foreground">{p.payment_method || '—'}</td>
                    <td className="px-6 py-4"><Badge className={getStatusColor(p.status)}>{p.status}</Badge></td>
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

export default Payments;
