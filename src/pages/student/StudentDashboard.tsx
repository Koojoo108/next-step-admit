import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Upload, ArrowRight, User, Settings, CheckCircle, FileText, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Application {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  application_date: string;
  full_name: string;
  email: string;
  programme: string;
  application_id_display: string;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      console.log('[StudentDashboard] Fetching applications for user:', user?.id);
      
      // Try to fetch from database first
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user?.id)
        .order('application_date', { ascending: false });

      console.log('[StudentDashboard] Database response - data:', data);
      console.log('[StudentDashboard] Database response - error:', error);

      if (error) {
        console.error('Error fetching applications:', error);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        
        // Fallback to localStorage if database fails
        console.log('[StudentDashboard] Database not available, using localStorage fallback...');
        const storedApplications = JSON.parse(localStorage.getItem('applications') || '[]');
        const userApplications = storedApplications.filter((app: any) => app.user_id === user?.id);
        console.log('[StudentDashboard] Loaded user applications from localStorage:', userApplications);
        
        setApplications(userApplications as Application[]);
        toast.warning('Showing locally saved applications. Database not available.');
        return;
      }

      if (!data || data.length === 0) {
        console.log('[StudentDashboard] No applications found in database, checking localStorage...');
        const storedApplications = JSON.parse(localStorage.getItem('applications') || '[]');
        const userApplications = storedApplications.filter((app: any) => app.user_id === user?.id);
        setApplications(userApplications as Application[]);
        return;
      }

      console.log('[StudentDashboard] Fetched applications from database:', data);
      setApplications(data as Application[]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLiveChat = () => {
    toast.info("Live chat is currently unavailable. Please use email support.", {
      description: "Our agents are currently offline. We typically respond to emails within 24 hours.",
    });
  };

  const handleEmailSupport = () => {
    window.location.href = "mailto:admissions@prestigeshs.edu.gh?subject=Student Support Request - " + (user?.email || "");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <Clock className="h-4 w-4 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden bg-primary rounded-[2rem] p-8 md:p-12 shadow-elevated">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-primary-foreground">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest text-accent">
              Student Portal
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">
              Hello, {user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-primary-foreground/70 max-w-md text-sm md:text-base leading-relaxed">
              Welcome to your student portal. Manage your profile, documents, and access school resources all in one place.
            </p>
          </div>
          
          <div className="hidden md:block bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 min-w-[240px] text-center shadow-2xl relative group">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-primary shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <CheckCircle size={24} />
            </div>
            <div className="text-xl font-black mb-1 tracking-tighter uppercase italic text-accent">Status Active</div>
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Verified Account</div>
          </div>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Applications Section */}
          <div className="bg-card rounded-[2rem] border border-border p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                My Applications
              </h3>
              <Link to="/dashboard/application">
                <Button variant="outline" size="sm">
                  New Application
                </Button>
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No applications submitted yet</p>
                <Link to="/dashboard/application">
                  <Button>Start New Application</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{app.full_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Program: {app.programme} • Submitted: {app.application_date ? new Date(app.application_date).toLocaleDateString() : 'No date'}
                        </p>
                        <p className="text-xs text-muted-foreground">Reference: {app.application_id_display || app.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(app.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/dashboard/documents" className="group bg-card rounded-[2rem] border border-border p-8 shadow-sm hover:shadow-elevated hover:border-secondary/30 transition-all duration-500">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:rotate-6 transition-transform">
                <Upload size={28} />
              </div>
              <h3 className="font-bold text-xl mb-2">Document Vault</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Manage your academic certificates, ID cards, and photos in our secure storage.
              </p>
              <div className="mt-6 flex items-center text-xs font-bold text-secondary uppercase tracking-[0.1em] group-hover:gap-3 transition-all">
                Access Vault <ArrowRight size={16} className="ml-2" />
              </div>
            </Link>

            <Link to="/dashboard/profile" className="group bg-card rounded-[2rem] border border-border p-8 shadow-sm hover:shadow-elevated hover:border-secondary/30 transition-all duration-500">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:rotate-6 transition-transform">
                <Settings size={28} />
              </div>
              <h3 className="font-bold text-xl mb-2">Profile Settings</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Keep your contact information and emergency guardian details up to date.
              </p>
              <div className="mt-6 flex items-center text-xs font-bold text-secondary uppercase tracking-[0.1em] group-hover:gap-3 transition-all">
                Edit Profile <ArrowRight size={16} className="ml-2" />
              </div>
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Support Hub */}
          <div className="bg-gradient-to-br from-primary to-primary/90 rounded-[2rem] p-8 text-white text-center relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-white/20 group-hover:scale-110 transition-transform duration-500">
                <User size={28} className="text-accent" />
              </div>
              <h3 className="font-bold text-lg mb-2">Help Desk</h3>
              <p className="text-xs text-white/70 mb-8 leading-relaxed">Our support team is available to assist with any queries.</p>
              <div className="space-y-3">
                <Button 
                  onClick={handleLiveChat}
                  variant="hero" 
                  className="w-full text-xs h-11 rounded-xl font-bold bg-white text-primary hover:bg-accent transition-colors"
                >
                  Start Live Chat
                </Button>
                <Button 
                  onClick={handleEmailSupport}
                  variant="hero-outline" 
                  className="w-full text-xs h-11 rounded-xl font-bold border-white/20 text-white hover:bg-white/10"
                >
                  Email Support
                </Button>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
