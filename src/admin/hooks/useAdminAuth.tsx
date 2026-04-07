import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AdminAuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const initDone = useRef(false);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('[AdminAuth] Role check error:', error);
        return false;
      }
      return !!data;
    } catch (err) {
      console.error('[AdminAuth] Error checking role:', err);
      return false;
    }
  };

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    // Safety timeout — never stay loading forever
    const timeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn('[AdminAuth] Loading timed out after 8s, forcing ready');
          return false;
        }
        return prev;
      });
    }, 8000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isUserAdmin = await checkAdminRole(session.user.id);
          setUser(session.user);
          setIsAuthenticated(true);
          setIsAdmin(isUserAdmin);
          console.log(`[AdminAuth] Session restored. Email: ${session.user.email}, isAdmin: ${isUserAdmin}`);
        } else {
          console.log('[AdminAuth] No session found');
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('[AdminAuth] Init error:', err);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AdminAuth] Auth state change: ${event}`);
      if (session?.user) {
        const isUserAdmin = await checkAdminRole(session.user.id);
        setUser(session.user);
        setIsAuthenticated(true);
        setIsAdmin(isUserAdmin);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log(`[AdminAuth] Attempting login for: ${email}`);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('[AdminAuth] Login error:', error.message);
        setLoading(false);
        return { success: false, error: error.message };
      }

      const isUserAdmin = await checkAdminRole(data.user.id);
      if (!isUserAdmin) {
        await supabase.auth.signOut();
        setLoading(false);
        return { success: false, error: 'Access denied. You do not have admin privileges.' };
      }

      console.log('[AdminAuth] Admin login successful');
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('[AdminAuth] Unexpected login error:', error);
      setLoading(false);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AdminAuth] Error during logout:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      navigate('/admin/login');
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
