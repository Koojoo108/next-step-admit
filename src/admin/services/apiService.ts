// This service is deprecated - all admin operations now use Supabase directly
// Kept for reference only - do not use

import { supabase } from '@/integrations/supabase/client';

export const apiService = {
  async getDashboardStats() {
    const { count: totalApps } = await supabase.from('applications').select('*', { count: 'exact', head: true });
    const { count: pendingApps } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
    const { count: approvedApps } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'Approved');
    return { total: totalApps || 0, pending: pendingApps || 0, approved: approvedApps || 0 };
  },

  async getApplications() {
    const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateApplicationStatus(id: string, status: string) {
    const { data, error } = await supabase.from('applications').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async getApplicants() {
    const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAdmissions() {
    const { data, error } = await supabase.from('applications').select('*').in('status', ['Approved', 'Admitted']).order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getPayments() {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getDocuments() {
    const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getReports() {
    const { data: apps } = await supabase.from('applications').select('status');
    return { applications: apps || [] };
  },

  async getUsers() {
    const { data, error } = await supabase.from('user_roles').select('*');
    if (error) throw error;
    return data;
  },

  async createAdminUser(_userData: any) {
    console.log('Admin user creation should be done via Supabase Auth');
    return { success: false, message: 'Use Supabase Auth to create admin users' };
  },

  async logout() {
    await supabase.auth.signOut();
    return { success: true };
  },

  async generateAdmissionLetter(id: string) {
    console.log('Generating admission letter for:', id);
    return { success: true };
  },

  async sendProspectus(id: string) {
    console.log('Sending prospectus to:', id);
    return { success: true };
  },

  async exportApplications(format: string) {
    console.log('Exporting applications as:', format);
    return { success: true };
  }
};
