import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { smsVerificationService } from '@/services/smsVerificationService';

// Expose setter functions
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithPhone: (phone: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithEmailOrPhone: (identifier: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  userRole: string | null;
  // Expose setters for external use to clear state if needed
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('user_role'));

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      const role = data?.role ?? 'student';
      if (!error) {
        setUserRole(role);
        localStorage.setItem('user_role', role);
      }
      return role;
    } catch (err) {
      return 'student';
    }
  };

  useEffect(() => {
    let mounted = true;

    // Fast session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        // Fetch role in background if not already cached
        if (!userRole) fetchUserRole(initialSession.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        fetchUserRole(currentUser.id);
      } else {
        // This block is executed when the session is cleared (e.g., by signOut)
        setUserRole(null);
        localStorage.removeItem('user_role');
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
        },
      });

      if (error) {
        return { data, error };
      }

      // Return success even if email confirmation is needed
      // The user will be told to check their email or try logging in
      return { data, error: null };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err };
    }
  };

  const signInWithPhone = async (phone: string, password: string) => {
    try {
      // For phone login, we'll use a simple approach
      // Try to sign in with phone as if it's an email (Supabase might handle this)
      // This is a workaround - in production you'd implement proper SMS verification
      const phoneAsEmail = `${phone}@phone.local`;
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: phoneAsEmail, 
        password 
      });

      if (error) {
        // If phone-as-email fails, return proper error message
        return { 
          data: { user: null, session: null }, 
          error: { message: 'No account found with this phone number' } 
        };
      }

      return { data, error: null };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err };
    }
  };

  const signInWithEmailOrPhone = async (identifier: string, password: string) => {
    try {
      // Check if identifier is an email or phone number
      const isEmail = identifier.includes('@');
      
      if (isEmail) {
        return await signIn(identifier, password);
      } else {
        return await signInWithPhone(identifier, password);
      }
    } catch (err: any) {
      return { data: { user: null, session: null }, error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear local storage and session
      localStorage.clear();
      sessionStorage.clear();
      // Update context state
      setUser(null);
      setSession(null);
      setUserRole(null);
    } catch (error) {
      console.error("Supabase sign out error:", error);
      throw error; // Re-throw to be caught by caller if needed
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signUp, 
      signIn, 
      signInWithPhone, 
      signInWithEmailOrPhone, 
      signOut, 
      userRole,
      setUser, // Expose setters
      setSession,
      setUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
