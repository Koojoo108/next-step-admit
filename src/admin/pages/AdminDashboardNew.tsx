import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Calendar,
  GraduationCap,
  BookOpen,
  Mail,
  Phone,
  Archive,
  Download,
  Filter
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { apiService } from '../services/apiService';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalStudents: number;
  recentApplications: number;
  applicationGrowth: number;
  admissionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'admission' | 'document' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const AdminDashboard = () => {
  const { isAdmin, user } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalStudents: 0,
    recentApplications: 0,
    applicationGrowth: 0,
    admissionRate: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real dashboard data from Express API
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        const data = await apiService.getDashboardStats();
        
        setStats({
          totalApplications: data.totalApplications || 0,
          pendingApplications: data.pendingReview || 0,
          approvedApplications: data.approvedApplications || 0,
          rejectedApplications: 0, // Add logic if needed
          totalStudents: data.totalStudents || 0,
          recentApplications: data.recentActivity?.length || 0,
          applicationGrowth: 0,
          admissionRate: data.totalApplications > 0 ? Math.round((data.approvedApplications / data.totalApplications) * 100) : 0
        });

        if (data.recentActivity) {
          const mappedActivity = data.recentActivity.map((act: any, idx: number) => ({
            id: `act-${idx}`,
            type: 'application',
            title: `Application: ${act.first_name} ${act.last_name}`,
            description: `Status: ${act.status}`,
            timestamp: act.updated_at,
            status: act.status === 'Admitted' ? 'success' : 'info'
          }));
          setRecentActivity(mappedActivity);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application': return <FileText className="h-4 w-4" />;
      case 'admission': return <CheckCircle className="h-4 w-4" />;
      case 'document': return <BookOpen className="h-4 w-4" />;
      case 'system': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-success/10 text-success border-success/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'info': return 'bg-info/10 text-info border-info/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return `${Math.floor(hours / 24)}d ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const exportReport = (type: string) => {
    adminDataService.exportApplications(type);
  };

  return (
    <div className="space-y-6">
      {!isAdmin && user && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="h-5 w-5" />
            Database Permission Required
          </div>
          <p className="text-sm">
            You are logged in as <span className="font-mono font-bold underline">{user.email}</span>, but this user does not have the "admin" role assigned in the <code className="bg-destructive/20 px-1 rounded">user_roles</code> table. 
            <strong> All delete or update actions will be blocked by Supabase security policies.</strong>
          </p>
          <div className="mt-2">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1">How to fix:</p>
            <pre className="bg-background/50 p-3 rounded border border-destructive/20 text-[10px] overflow-x-auto font-mono">
              {`INSERT INTO public.user_roles (user_id, role) 
VALUES ('${user.id}', 'admin') 
ON CONFLICT (user_id, role) DO NOTHING;`}
            </pre>
            <p className="text-[10px] mt-1 opacity-70 italic">Copy and run the SQL above in your Supabase Dashboard SQL Editor.</p>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of admission system and key metrics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportReport('applications')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => exportReport('students')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Students
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {stats.applicationGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={stats.applicationGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(stats.applicationGrowth)}% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedApplications}</div>
            <p className="text-xs text-muted-foreground">Successfully admitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admission Rate Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Admission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{stats.admissionRate}%</div>
                <p className="text-sm text-gray-600">Acceptance Rate</p>
                <div className="text-xs text-gray-500 mt-2">
                  Based on {stats.approvedApplications + stats.rejectedApplications} applications
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.status)}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-12">
              <Mail className="h-4 w-4 mr-2" />
              Send Notifications
            </Button>
            <Button variant="outline" className="justify-start h-12">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Reviews
            </Button>
            <Button variant="outline" className="justify-start h-12">
              <GraduationCap className="h-4 w-4 mr-2" />
              Generate Letters
            </Button>
            <Button variant="outline" className="justify-start h-12">
              <Filter className="h-4 w-4 mr-2" />
              Filter Applications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
