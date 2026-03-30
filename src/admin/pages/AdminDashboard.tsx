import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  FileText, 
  GraduationCap, 
  Settings, 
  LogOut,
  Bell,
  TrendingUp,
  UserCheck,
  Clock,
  RefreshCw
} from 'lucide-react';
import schoolCrest from '@/assets/school-crest.png';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalStudents: number;
  recentApplications: number;
}

interface Application {
  id: string;
  full_name: string;
  email: string;
  programme: string;
  programme_name: string;
  status: 'pending' | 'approved' | 'rejected';
  application_date: string;
  application_id_display: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalStudents: 0,
    recentApplications: 0
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Also test basic database connection
    testDatabaseConnection();
  }, []);

  const testDatabaseConnection = async () => {
    console.log('[AdminDashboard] Testing database connection...');
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('count')
        .limit(1);
      
      console.log('[AdminDashboard] Connection test - data:', data);
      console.log('[AdminDashboard] Connection test - error:', error);
      
      if (error) {
        console.error('[AdminDashboard] Database connection failed:', error);
      } else {
        console.log('[AdminDashboard] Database connection successful');
      }
    } catch (error) {
      console.error('[AdminDashboard] Connection test error:', error);
    }
  };

  // Direct database query - NO MIDDLEWARE
  const fetchDashboardData = async () => {
    console.log('[AdminDashboard] DIRECT QUERY - Fetching from applications table...');
    setLoading(true);
    
    try {
      const { data: applications, error: appError, count } = await supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      console.log('[AdminDashboard] RAW DATA:', applications);
      console.log('[AdminDashboard] COUNT:', count);
      console.log('[AdminDashboard] ERROR:', appError);

      if (appError) {
        console.error('[AdminDashboard] Database error:', appError);
        console.error('[AdminDashboard] Error details:', appError.details);
        console.error('[AdminDashboard] Error hint:', appError.hint);
        
        // Fallback to localStorage if database fails
        console.log('[AdminDashboard] Database not available, using localStorage fallback...');
        const storedApplications = JSON.parse(localStorage.getItem('applications') || '[]');
        console.log('[AdminDashboard] Loaded applications from localStorage:', storedApplications);
        
        processApplicationsData(storedApplications);
        return;
      }

      if (!applications || applications.length === 0) {
        console.log('[AdminDashboard] No applications found in database, checking localStorage...');
        const storedApplications = JSON.parse(localStorage.getItem('applications') || '[]');
        console.log('[AdminDashboard] Found applications in localStorage:', storedApplications.length);
        processApplicationsData(storedApplications);
        return;
      }

      console.log('[AdminDashboard] Processing application stats from database...');
      processApplicationsData(applications);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'applications' 
      }, (payload) => {
        console.log('[AdminDashboard] REALTIME UPDATE:', payload);
        fetchDashboardData(); // Refresh data
      })
      .subscribe();
    
    return () => { 
      console.log('[AdminDashboard] Cleaning up realtime subscription');
      supabase.removeChannel(channel); 
    };
  }, []);

  const processApplicationsData = (applications: any[]) => {
    console.log('[AdminDashboard] Processing applications data:', applications);
    
    // Calculate stats
    const totalApps = applications?.length || 0;
    const pendingApps = applications?.filter(app => app.status === 'pending').length || 0;
    const approvedApps = applications?.filter(app => app.status === 'approved').length || 0;
    const rejectedApps = applications?.filter(app => app.status === 'rejected').length || 0;
    
    console.log('[AdminDashboard] Stats calculated:', { totalApps, pendingApps, approvedApps, rejectedApps });
    
    // Calculate recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentApps = applications?.filter(app => {
      const appDate = app.created_at || app.application_date;
      return appDate && new Date(appDate) >= sevenDaysAgo;
    }).length || 0;

    // Get recent applications for display
    const recentAppsList = applications?.slice(0, 5) || [];

    console.log('[AdminDashboard] Setting dashboard state...');

    setStats({
      totalApplications: totalApps,
      pendingApplications: pendingApps,
      approvedApplications: approvedApps,
      rejectedApplications: rejectedApps,
      totalStudents: approvedApps, // Assuming approved students are the total students
      recentApplications: recentApps
    });

    setRecentApplications(recentAppsList as Application[]);
    
    console.log('[AdminDashboard] Dashboard data loaded successfully');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-auth');
    navigate('/admin/login');
  };

  const menuItems = [
    {
      icon: BarChart3,
      label: 'Dashboard',
      active: true,
      onClick: () => {}
    },
    {
      icon: FileText,
      label: 'Applications',
      active: false,
      onClick: () => navigate('/admin/applications')
    },
    {
      icon: Users,
      label: 'Students',
      active: false,
      onClick: () => navigate('/admin/students')
    },
    {
      icon: GraduationCap,
      label: 'Results',
      active: false,
      onClick: () => navigate('/admin/results')
    },
    {
      icon: Settings,
      label: 'Settings',
      active: false,
      onClick: () => navigate('/admin/settings')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <img src={schoolCrest} alt="Crest" className="h-8 w-8" />
            <div>
              <h1 className="font-bold text-gray-900">Duapa Academy</h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  item.active 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of admission system statistics and recent activity</p>
        </div>

        {/* DEBUG PANEL - CRITICAL FOR PRODUCTION */}
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold text-red-800">🚨 DEBUG PANEL - PRODUCTION CRITICAL</p>
                <p className="text-xs text-red-600">Total Applications: {stats.totalApplications}</p>
                <p className="text-xs text-red-600">Pending: {stats.pendingApplications} | Approved: {stats.approvedApplications}</p>
                <p className="text-xs text-red-600">Recent Applications: {recentApplications.length}</p>
                <p className="text-xs text-red-600">Loading: {loading ? 'Yes' : 'No'}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => fetchDashboardData()}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Force Refresh
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => console.log('[AdminDashboard] Current state:', { stats, recentApplications, loading })}
                >
                  Log State
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
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
              <UserCheck className="h-4 w-4 text-green-600" />
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
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Active students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentApplications}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">3</div>
              <p className="text-xs text-muted-foreground">New alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading applications...</p>
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No applications submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{app.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {app.programme} • {app.application_date ? new Date(app.application_date).toLocaleDateString() : 'No date'}
                      </p>
                      <p className="text-xs text-gray-400">ID: {app.application_id_display || app.id.substring(0, 8)}...</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      app.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : app.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
