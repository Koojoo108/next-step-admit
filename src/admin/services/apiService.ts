const API_BASE_URL = 'http://localhost:3000/api/admin';

export const apiService = {
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },

  async getApplications() {
    const response = await fetch(`${API_BASE_URL}/applications`);
    if (!response.ok) throw new Error('Failed to fetch applications');
    return response.json();
  },

  async updateApplicationStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/applications/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  async getApplicants() {
    const response = await fetch(`${API_BASE_URL}/applicants`);
    if (!response.ok) throw new Error('Failed to fetch applicants');
    return response.json();
  },

  async getAdmissions() {
    const response = await fetch(`${API_BASE_URL}/admissions`);
    if (!response.ok) throw new Error('Failed to fetch admissions');
    return response.json();
  },

  async getPayments() {
    const response = await fetch(`${API_BASE_URL}/payments`);
    if (!response.ok) throw new Error('Failed to fetch payments');
    return response.json();
  },

  async getDocuments() {
    const response = await fetch(`${API_BASE_URL}/documents`);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  async getReports() {
    const response = await fetch(`${API_BASE_URL}/reports`);
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  },

  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async createAdminUser(userData: any) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to create admin user');
    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST'
    });
    return response.json();
  },

  async generateAdmissionLetter(id: string) {
    // Placeholder: In a real app, this would call an endpoint to generate/email the PDF
    console.log('Generating admission letter for:', id);
    return Promise.resolve({ success: true });
  },

  async sendProspectus(id: string) {
    // Placeholder
    console.log('Sending prospectus to:', id);
    return Promise.resolve({ success: true });
  },

  async exportApplications(format: string) {
    // Placeholder
    console.log('Exporting applications as:', format);
    return Promise.resolve({ success: true });
  }
};
