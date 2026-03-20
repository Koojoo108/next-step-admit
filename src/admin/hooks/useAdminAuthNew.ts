import React, { createContext, useContext, useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  permissions: string[];
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Mock admin credentials for development
const MOCK_ADMINS = [
  {
    id: 'admin-1',
    email: 'admin@prestige.edu.gh',
    name: 'System Administrator',
    role: 'admin' as const,
    password: 'admin123',
    permissions: ['applications', 'students', 'results', 'settings', 'admissions']
  },
  {
    id: 'staff-1',
    email: 'staff@prestige.edu.gh',
    name: 'Staff Member',
    role: 'staff' as const,
    password: 'staff123',
    permissions: ['applications', 'students', 'results']
  }
];

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing admin session on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin-auth');
    if (storedAdmin) {
      const adminData = JSON.parse(storedAdmin);
      setAdmin(adminData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find admin by credentials
      const adminData = MOCK_ADMINS.find(
        admin => admin.email === email && admin.password === password
      );

      if (adminData) {
        const { password: _, ...admin } = adminData;
        setAdmin(admin);
        setIsAuthenticated(true);
        localStorage.setItem('admin-auth', JSON.stringify(admin));
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin-auth');
  };

  const value = {
    admin,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
