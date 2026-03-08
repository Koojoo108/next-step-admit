import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, BookOpen, Megaphone, LogOut, Menu, X, Shield } from 'lucide-react';
import schoolCrest from '@/assets/school-crest.png';
import { useState } from 'react';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/applicants', label: 'Applicants', icon: Users },
  { to: '/admin/programmes', label: 'Programmes', icon: BookOpen },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
];

const AdminLayout = () => {
  const { user, loading, signOut, userRole } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!user) return <Navigate to="/login" />;
  if (userRole !== 'admin') return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary transform transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:block`}>
        <div className="flex items-center gap-3 p-5 border-b border-sidebar-border">
          <img src={schoolCrest} alt="Crest" className="h-8 w-8" />
          <div>
            <span className="font-display font-bold text-accent text-sm block">Admin Panel</span>
            <span className="text-xs text-sidebar-foreground/50 flex items-center gap-1"><Shield size={10} /> Prestige SHS</span>
          </div>
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
          <button onClick={signOut} className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive w-full transition-colors">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between md:px-6">
          <button className="md:hidden text-foreground" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
          <div className="text-sm text-muted-foreground">Admin Dashboard</div>
          <div />
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
