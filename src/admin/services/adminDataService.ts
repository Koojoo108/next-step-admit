import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalStudents: number;
  recentApplications: number;
  applicationGrowth: number;
  admissionRate: number;
}

export interface Application {
  id: string;
  application_id_display?: string;
  user_id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  status: 'draft' | 'pending' | 'reviewed' | 'admitted' | 'rejected';
  created_at: string;
  updated_at: string;
  programme?: string;
  programme_name?: string;
  elective_combination?: string;
  city_town?: string;
  region_state?: string;
  personal_info?: any;
}

export interface Student {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  student_id: string;
  program: string;
  elective_combination?: string;
  admission_date: string;
  status: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  reference: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

class AdminDataService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const { count: totalApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

      const { count: pendingApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: approvedApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'admitted');

      const { count: rejectedApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const total = totalApplications || 0;
      const approved = approvedApplications || 0;
      const admissionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

      return {
        totalApplications: total,
        pendingApplications: pendingApplications || 0,
        approvedApplications: approved,
        rejectedApplications: rejectedApplications || 0,
        totalStudents: totalUsers || 0, // This will now show total registered users
        recentApplications: 0,
        applicationGrowth: 0,
        admissionRate
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getApplications(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ applications: Application[]; total: number }> {
    try {
      let query = supabase
        .from('applications')
        .select('*', { count: 'exact' });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      
      const { data, count, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const mappedApplications = (data || []).map(app => ({
        ...app,
        fullName: app.full_name,
        programmeName: app.programme_name || app.programme,
        electiveCombination: app.elective_combination,
      })) as any[];

      return { 
        applications: mappedApplications, 
        total: count || 0 
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return { applications: [], total: 0 };
    }
  }

  async getStudents(filters?: {
    search?: string;
  }): Promise<{ students: Student[]; total: number }> {
    try {
      let query = supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .eq('status', 'admitted');

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, count, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const mappedStudents = (data || []).map(student => ({
        ...student,
        fullName: student.full_name,
        admissionDate: student.created_at,
        program: student.programme_name || student.programme || 'N/A',
        studentId: student.application_id_display || student.id,
      })) as any[];

      return { students: mappedStudents, total: count || 0 };
    } catch (error) {
      console.error('Error fetching students:', error);
      return { students: [], total: 0 };
    }
  }

  async updateApplicationStatus(applicationId: string, status: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error updating application:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteApplication(applicationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: appData } = await supabase
        .from('applications')
        .select('user_id')
        .eq('id', applicationId)
        .single();

      if (appData?.user_id) {
        await supabase
          .from('documents')
          .delete()
          .eq('user_id', appData.user_id);
      }

      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting application:', error);
      return { success: false, error: error.message || 'Failed to delete application' };
    }
  }

  async getRecentActivity(): Promise<any[]> {
    try {
      // Get recent applications
      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select('id, full_name, status, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (appsError) throw appsError;

      // Get recent registrations
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (profilesError) throw profilesError;

      const appActivity = (apps || []).map(app => ({
        id: `app-${app.id}`,
        type: 'application',
        title: `Application Update: ${app.full_name}`,
        description: `Status changed to ${app.status}`,
        timestamp: app.updated_at,
        status: app.status === 'admitted' ? 'success' : 'info'
      }));

      const profileActivity = (profiles || []).map(profile => ({
        id: `profile-${profile.id}`,
        type: 'admission', // Using admission type as a placeholder for registration
        title: `New User: ${profile.full_name}`,
        description: `Successfully registered an account`,
        timestamp: profile.created_at,
        status: 'success'
      }));

      // Combine and sort by timestamp
      return [...appActivity, ...profileActivity]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);
    } catch (error) {
      console.error('Error fetching activity:', error);
      return [];
    }
  }

  async getPayments(): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
         const { data: rawData, error: rawError } = await supabase
            .from('payments')
            .select('*');
         if (rawError) throw rawError;
         return rawData as any;
      }

      return data as any;
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  async getDocuments(): Promise<any[]> {
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
    }
  }

  async getUsers(filters?: {
    search?: string;
  }): Promise<{ users: any[]; total: number }> {
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, count, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return { users: data || [], total: count || 0 };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], total: 0 };
    }
  }

  async exportApplications(format: 'csv' | 'excel'): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}

export const adminDataService = new AdminDataService();
