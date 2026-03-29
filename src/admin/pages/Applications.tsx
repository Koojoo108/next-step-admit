import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download, 
  Eye, 
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from '@/integrations/supabase/client';
import { apiService } from '../services/apiService';
import { toast } from 'sonner';

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'admitted': case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const ApplicationsManagement = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Details Modal State
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch from Express API
  const fetchApplications = async () => {
    console.log('[Applications] Fetching from Express API...');
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getApplications();
      
      const mappedApps = data.map((app: any) => ({
        ...app,
        id: app.application_id, // Map for frontend compatibility
        fullName: `${app.first_name} ${app.last_name}`,
        programme: app.selected_programme,
        status: app.status.toLowerCase(),
        created_at: app.created_at
      }));

      setApplications(mappedApps);
      setFilteredApplications(mappedApps);
    } catch (err: any) {
      console.error('[Applications] Error:', err);
      setError(err.message || 'Failed to fetch applications');
      toast.error('Could not load applications from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (applicationId: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'Admitted' : 'Rejected';
    
    try {
      await apiService.updateApplicationStatus(applicationId, newStatus);
      toast.success(`Application ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchApplications(); // Refresh list
      if (selectedApp && selectedApp.id === applicationId) {
        setDetailsOpen(false);
      }
    } catch (err: any) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) return;
    
    console.log(`[Applications] Deleting application ${applicationId}`);
    
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);
      
      if (error) {
        console.error('[Applications] Delete error:', error);
        toast.error(`Failed to delete application: ${error.message}`);
        return;
      }
      
      console.log(`[Applications] Application ${applicationId} deleted successfully`);
      toast.success('Application deleted successfully');
      
      // Update local state
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      setFilteredApplications(prev => prev.filter(app => app.id !== applicationId));
      if (detailsOpen) setDetailsOpen(false);
    } catch (err) {
      console.error('[Applications] Critical delete error:', err);
      toast.error('Failed to delete application');
    }
  };

  const openDetails = (app: any) => {
    setSelectedApp(app);
    setDetailsOpen(true);
  };

  const syncLocalStorageToDatabase = async () => {
    console.log('[Applications] Syncing localStorage applications to database...');
    
    try {
      const storedApplications = JSON.parse(localStorage.getItem('applications') || '[]');
      
      if (storedApplications.length === 0) {
        toast.info('No applications in localStorage to sync');
        return;
      }
      
      console.log('[Applications] Found applications to sync:', storedApplications.length);
      
      let syncedCount = 0;
      let errorCount = 0;
      
      for (const app of storedApplications) {
        try {
          // Remove localStorage-specific fields
          const { id, created_at, ...dbApp } = app;
          
          const { data, error } = await supabase
            .from('applications')
            .insert([dbApp])
            .select();
          
          if (error) {
            console.error('[Applications] Error syncing app:', error);
            errorCount++;
          } else {
            console.log('[Applications] Successfully synced app:', data);
            syncedCount++;
          }
        } catch (err) {
          console.error('[Applications] Critical error syncing app:', err);
          errorCount++;
        }
      }
      
      toast.success(`Synced ${syncedCount} applications to database. ${errorCount} errors.`);
      
      // Clear localStorage after successful sync
      if (syncedCount > 0) {
        localStorage.removeItem('applications');
        toast.info('Local storage cleared after successful sync');
      }
      
      // Refresh the applications list
      fetchApplications();
      
    } catch (error) {
      console.error('[Applications] Error during sync:', error);
      toast.error('Failed to sync applications');
    }
  };

  const exportApplications = () => {
    console.log('[Applications] Export feature - placeholder');
    toast.info('Export feature coming soon');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications Management</h1>
          <p className="text-muted-foreground">Review and manage student applications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={syncLocalStorageToDatabase} variant="outline" className="bg-blue-50 border-blue-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Local Storage
          </Button>
          <Button onClick={exportApplications} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* DEBUG PANEL - CRITICAL FOR PRODUCTION */}
      <Card className="border-red-500 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-red-800">🚨 DEBUG PANEL - PRODUCTION CRITICAL</p>
              <p className="text-xs text-red-600">Applications: {applications?.length || 0} | Filtered: {filteredApplications?.length || 0}</p>
              <p className="text-xs text-red-600">Last Error: {error || 'None'}</p>
              <p className="text-xs text-red-600">Loading: {loading ? 'Yes' : 'No'}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => fetchApplications()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Force Refresh
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => console.log('[Applications] Current state:', { applications, filteredApplications, error, loading })}
              >
                Log State
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background text-foreground border-input"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="admitted">Admitted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-border">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3 border border-primary/20">
                          {app.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">{app.fullName}</div>
                          <div className="text-xs text-muted-foreground">{app.application_id_display || 'No ID'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                      {app.programme || app.programme_name || 'Not selected'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(app.status)}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openDetails(app)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(app.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredApplications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Applicant Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 border-border bg-card text-foreground">
          <DialogHeader className="p-6 pb-2 border-b border-border bg-muted/30">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <User className="h-6 w-6 text-primary" />
              Applicant Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Review application information and take action.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-6 pt-2 bg-card">
            {selectedApp && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row gap-6 items-start mt-4">
                  <div className="h-32 w-32 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-border">
                    {selectedApp.passport_photo_url ? (
                      <img src={selectedApp.passport_photo_url} alt="Passport" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground opacity-50" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">{selectedApp.fullName}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="font-mono bg-background">{selectedApp.application_id_display}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-primary" /> {selectedApp.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-primary" /> {selectedApp.phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-primary" /> DOB: {selectedApp.dateOfBirth || 'N/A'}
                      </div>
                    </div>
                    <div className="pt-2">
                      <Badge className={getStatusColor(selectedApp.status)}>
                        Current Status: {selectedApp.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Academic Info */}
                  <Card className="border-border bg-muted/20">
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                        <FileText className="h-5 w-5 text-primary" />
                        Academic Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block text-xs uppercase font-bold">JHS Attended</span>
                          <span className="font-medium text-foreground">{selectedApp.jhs_name || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs uppercase font-bold">BECE Index</span>
                          <span className="font-medium text-foreground">{selectedApp.bece_index || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="border-t border-border pt-4">
                        <span className="text-muted-foreground block mb-2 text-xs uppercase font-bold">Program Choices</span>
                        <div className="space-y-4">
                        <div className="flex justify-between p-2 bg-background rounded border border-border/50">
                          <span className="text-muted-foreground">Program:</span>
                          <span className="font-bold text-primary">{selectedApp.programme || selectedApp.programme_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-background rounded border border-border/50">
                          <span className="text-muted-foreground">Application Date:</span>
                          <span className="font-medium text-foreground">{new Date(selectedApp.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-background rounded border border-border/50">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium text-foreground">{selectedApp.status}</span>
                        </div>
                      </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Grades */}
                  <Card className="border-border bg-muted/20">
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                        <CheckCircle className="h-5 w-5 text-success" />
                        BECE Results
                      </h3>
                      <div className="space-y-2">
                        <div className="bg-background p-3 rounded border border-border shadow-sm">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Mathematics</span>
                          <span className="font-black text-2xl text-foreground">{selectedApp.math_grade || 'N/A'}</span>
                        </div>
                        <div className="bg-background p-3 rounded border border-border shadow-sm">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">English Lang.</span>
                          <span className="font-black text-2xl text-foreground">{selectedApp.english_grade || 'N/A'}</span>
                        </div>
                        <div className="bg-background p-3 rounded border border-border shadow-sm">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Integrated Science</span>
                          <span className="font-black text-2xl text-foreground">{selectedApp.science_grade || 'N/A'}</span>
                        </div>
                        <div className="bg-background p-3 rounded border border-border shadow-sm">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Social Studies</span>
                          <span className="font-black text-2xl text-foreground">{selectedApp.social_grade || 'N/A'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Documents */}
                <Card className="border-border bg-muted/20">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
                      <FileText className="h-5 w-5 text-warning" />
                      Uploaded Documents
                    </h3>
                    {selectedApp.passport_photo_url ? (
                        <div className="flex items-center justify-between p-3 border border-border rounded bg-background hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded text-primary">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-bold text-foreground">Passport Photo</span>
                            </div>
                            <Button size="sm" variant="outline" className="font-bold" onClick={() => window.open(selectedApp.passport_photo_url, '_blank')}>View File</Button>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground italic p-4 text-center border border-dashed border-border rounded">No documents uploaded</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="p-6 border-t bg-muted/20">
            <div className="flex flex-col md:flex-row gap-3 w-full justify-between items-center">
              <Button 
                variant="ghost" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full md:w-auto"
                onClick={() => selectedApp && handleDelete(selectedApp.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Permanently Delete
              </Button>
              
              <div className="flex gap-3 w-full md:w-auto justify-end">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
                {selectedApp && selectedApp.status === 'pending' && (
                  <>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleStatusUpdate(selectedApp.id, 'reject')}
                    >
                      Reject Application
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleStatusUpdate(selectedApp.id, 'approve')}
                    >
                      Approve Application
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationsManagement;
