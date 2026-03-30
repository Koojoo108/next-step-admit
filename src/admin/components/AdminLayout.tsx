import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  LogOut,
  Settings,
  LayoutDashboard,
  FileText,
  Users,
  GraduationCap,
  CreditCard,
  File,
  BarChart,
  Shield,
  Moon,
  Sun
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import schoolCrest from '@/assets/school-crest.png';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useTheme } from '@/components/ThemeProvider';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading, isAuthenticated } = useAdminAuth();
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
        navigate('/admin/login');
    }
  }, [loading, isAuthenticated, navigate]);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
    },
    {
      title: 'Applications',
      icon: FileText,
      path: '/admin/applications',
    },
    {
      title: 'Applicants',
      icon: Users,
      path: '/admin/applicants',
    },
    {
      title: 'Admissions',
      icon: GraduationCap,
      path: '/admin/admissions',
    },
    {
      title: 'Payments',
      icon: CreditCard,
      path: '/admin/payments',
    },
    {
      title: 'Documents',
      icon: File,
      path: '/admin/documents',
    },
    {
      title: 'Reports',
      icon: BarChart,
      path: '/admin/reports',
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
    {
      title: 'Admin Users',
      icon: Shield,
      path: '/admin/users',
    }
  ];

  const handleLogout = async () => {
    await logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={schoolCrest} alt="Duapa Academy" className="h-8 w-8 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Duapa Academy</h1>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.title}</span>
            </Link>
          ))}

          {/* Logout Button */}
          <div className="pt-4 mt-4 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0 transition-all duration-300">
        {/* Top Navigation */}
        <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold text-foreground hidden sm:block">
                {menuItems.find(item => item.path === location.pathname)?.title || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full w-10 h-10 p-0"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring w-64"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative rounded-full w-10 h-10 p-0">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {notifications > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
                  )}
                </Button>
              </div>

              {/* Admin Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 border-l border-border pl-4 ml-2 outline-none">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-foreground">{user?.email || 'Admin User'}</p>
                      <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold border border-primary/20 hover:bg-primary/20 transition-colors">
                      {user?.email ? user.email.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 border-border bg-card">
                  <DropdownMenuLabel className="font-bold text-foreground">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem className="cursor-pointer hover:bg-muted focus:bg-muted text-foreground">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-muted focus:bg-muted text-foreground">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>System Config</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 font-bold"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-background">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="bg-card border-t border-border py-4 px-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Duapa Academy. All rights reserved.
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default AdminLayout;


