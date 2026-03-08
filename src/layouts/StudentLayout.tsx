import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Upload, LogOut, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import schoolCrest from '@/assets/school-crest.png';
import { useState } from 'react';

const sidebarLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/application', label: 'Application', icon: FileText },
  { to: '/dashboard/documents', label: 'Documents', icon: Upload },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
];

const StudentLayout = () => {
  const { user, loading, signOut, userRole } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!user) return <Navigate to="/login" />;
  if (userRole === 'admin') return <Navigate to="/admin" />;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary transform transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:block`}>
        <div className="flex items-center gap-3 p-5 border-b border-sidebar-border">
          <img src={schoolCrest} alt="Crest" className="h-8 w-8" />
          <span className="font-display font-bold text-accent text-sm">Prestige SHS</span>
          <button className="md:hidden ml-auto text-accent" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
                location.pathname === link.to
                  ? 'bg-sidebar-accent text-accent'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-accent'
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive w-full transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between md:px-6">
          <button className="md:hidden text-foreground" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
          <div className="text-sm text-muted-foreground">Welcome, {user.user_metadata?.full_name || user.email}</div>
          <div />
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
