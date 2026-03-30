import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'; // useNavigate is imported
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, Upload, LogOut, User, Menu, X, FileCheck } from 'lucide-react';
import schoolCrest from '@/assets/school-crest.png';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Added Supabase import

const sidebarLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/application', label: 'Admission', icon: FileCheck },
  { to: '/dashboard/documents', label: 'Documents', icon: Upload },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
];

const StudentLayout = () => {
  // Note: 'signOut' from useAuth is not directly called in handleLogout, but its availability is fine.
  // setUser, setSession, setUserRole might still be needed if we wanted to clear client-side state before redirection,
  // but the user's provided handleLogout clears localStorage/sessionStorage and uses window.location.href,
  // which might be sufficient. We keep them as part of the context.
  const { user, loading, signOut, userRole, setUser, setSession, setUserRole } = useAuth();
  const location = useLocation();
  // const navigate = useNavigate(); // Removed as window.location.href is used for redirection
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Simple, direct logout function
  const handleLogout = () => {
    console.log("🚪 [StudentLayout] Simple logout initiated");
    
    // Clear everything immediately
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(cookie => {
      document.cookie = `${cookie}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });
    
    // Clear React state
    setUser(null);
    setSession(null);
    setUserRole(null);
    
    // Force redirect immediately
    console.log("🔄 [StudentLayout] Redirecting to login...");
    window.location.href = '/login';
  };

  useEffect(() => {
    console.log("[StudentLayout] Auth State Change - User:", user?.email, "| Loading:", loading, "| Role:", userRole);
  }, [user, loading, userRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium tracking-wide">Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    console.warn("[StudentLayout] Access denied: No authenticated user. Redirecting to /login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userRole === 'admin') {
    console.log("[StudentLayout] Admin user detected in student layout. Redirecting to /admin.");
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block shadow-2xl`}>
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <img src={schoolCrest} alt="Crest" className="h-8 w-8" />
          <span className="font-display font-bold text-accent text-sm tracking-tight italic">Duapa Academy</span>
          <button className="md:hidden ml-auto text-accent p-1" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                location.pathname === link.to
                  ? 'bg-accent text-primary font-bold shadow-md transform scale-[1.02]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between md:px-8 sticky top-0 z-40 backdrop-blur-md bg-card/90">
          <button className="md:hidden text-foreground p-2 hover:bg-muted rounded-full transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary font-bold text-xs border border-secondary/20 shadow-sm">
              {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium">Welcome back, <span className="text-foreground font-bold">{user.user_metadata?.full_name || user.email}</span></span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
            type="button"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>
        
        <main className="flex-1 p-4 md:p-10 overflow-y-auto bg-muted/20 custom-scrollbar animate-in fade-in duration-1000 slide-in-from-bottom-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;