import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  draft: { icon: FileText, color: 'text-muted-foreground', label: 'Draft' },
  pending: { icon: Clock, color: 'text-warning', label: 'Pending Review' },
  approved: { icon: CheckCircle, color: 'text-success', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-destructive', label: 'Rejected' },
  waitlisted: { icon: AlertTriangle, color: 'text-secondary', label: 'Waitlisted' },
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setApplication(data);
      setLoading(false);
    };
    fetchApplication();
  }, [user]);

  const status = application?.status || 'none';
  const statusInfo = statusConfig[status];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Student Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your admission application</p>
      </div>

      {/* Status Card */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-card">
        <h2 className="font-display font-semibold text-foreground mb-4">Application Status</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !application ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">You haven't started an application yet.</p>
            <Link to="/dashboard/application">
              <Button>Start Application</Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {statusInfo && <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />}
            <span className={`font-semibold ${statusInfo?.color || 'text-foreground'}`}>
              {statusInfo?.label || status}
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/dashboard/application" className="bg-card rounded-lg p-6 border border-border shadow-card hover:shadow-elevated transition-shadow text-center">
          <FileText className="h-8 w-8 text-secondary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">{application ? 'View Application' : 'Start Application'}</h3>
          <p className="text-sm text-muted-foreground mt-1">{application ? 'Review or edit your form' : 'Begin your admission form'}</p>
        </Link>
        <Link to="/dashboard/documents" className="bg-card rounded-lg p-6 border border-border shadow-card hover:shadow-elevated transition-shadow text-center">
          <Upload className="h-8 w-8 text-secondary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">Upload Documents</h3>
          <p className="text-sm text-muted-foreground mt-1">Submit required documents</p>
        </Link>
        <Link to="/dashboard/profile" className="bg-card rounded-lg p-6 border border-border shadow-card hover:shadow-elevated transition-shadow text-center">
          <CheckCircle className="h-8 w-8 text-secondary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">Profile</h3>
          <p className="text-sm text-muted-foreground mt-1">View your profile information</p>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
