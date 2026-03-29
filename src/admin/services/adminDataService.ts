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
  user_id: string;
  full_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  first_choice: string | null;
  second_choice: string | null;
  third_choice: string | null;
  gender: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  address: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  jhs_name: string | null;
  jhs_location: string | null;
  bece_index: string | null;
  bece_year: string | null;
  english_grade: string | null;
  math_grade: string | null;
  science_grade: string | null;
  social_grade: string | null;
}

export interface Student {
  id: string;
  full_name: string | null;
  student_id: string;
  program: string;
  admission_date: string;
  status: string;
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
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      const total = totalApplications || 0;
      const approved = approvedApplications || 0;
      const admissionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

      return {
        totalApplications: total,
        pendingApplications: pendingApplications || 0,
        approvedApplications: approved,
        rejectedApplications: rejectedApplications || 0,
        totalStudents: totalUsers || 0,
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
        query = query.ilike('full_name', `%${filters.search}%`);
      }
      
      const { data, count, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return { 
        applications: (data || []) as Application[], 
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
        query = query.ilike('full_name', `%${filters.search}%`);
      }

      const { data, count, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const mappedStudents = (data || []).map(student => ({
        id: student.id,
        full_name: student.full_name,
        student_id: student.id,
        program: student.first_choice || 'N/A',
        admission_date: student.created_at,
        status: student.status,
      }));

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
      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select('id, full_name, status, updated_at')
        .order('updated_at', { ascending: false })
        .limit(8);

      if (appsError) throw appsError;

      return (apps || []).map(app => ({
        id: `app-${app.id}`,
        type: 'application',
        title: `Application: ${app.full_name || 'Unknown'}`,
        description: `Status: ${app.status}`,
        timestamp: app.updated_at,
        status: app.status === 'admitted' ? 'success' : 'info'
      }));
    } catch (error) {
      console.error('Error fetching activity:', error);
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
      const { data, count, error } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact' });

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
