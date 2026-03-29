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
import { adminDataService } from '../services/adminDataService';
import { toast } from 'sonner';

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Fetch from Supabase directly
  const fetchApplications = async () => {
    console.log('[Applications] Fetching from database...');
    setLoading(true);
    setError(null);
    
    try {
      const { applications: data, total } = await adminDataService.getApplications({
        status: statusFilter,
        search: searchTerm,
      });

      setApplications(data);
      setFilteredApplications(data);
      console.log(`[Applications] Loaded ${data.length} applications from database`);
    } catch (err: any) {
      console.error('[Applications] Error:', err);
      setError(err.message || 'Failed to fetch applications');
      toast.error('Could not load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  // Filter locally by search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredApplications(applications);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredApplications(
        applications.filter(app => 
          (app.full_name || '').toLowerCase().includes(term) ||
          (app.id || '').toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, applications]);

  const handleStatusUpdate = async (applicationId: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'admitted' : 'rejected';
    
    try {
      const result = await adminDataService.updateApplicationStatus(applicationId, newStatus);
      if (result.success) {
        toast.success(`Application ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        fetchApplications();
        if (selectedApp && selectedApp.id === applicationId) {
          setDetailsOpen(false);
        }
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (err: any) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) return;
    
    try {
      const result = await adminDataService.deleteApplication(applicationId);
      if (result.success) {
        toast.success('Application deleted successfully');
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        setFilteredApplications(prev => prev.filter(app => app.id !== applicationId));
        if (detailsOpen) setDetailsOpen(false);
      } else {
        toast.error(result.error || 'Failed to delete application');
      }
    } catch (err) {
      console.error('[Applications] Delete error:', err);
      toast.error('Failed to delete application');
    }
  };

  const openDetails = (app: any) => {
    setSelectedApp(app);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications Management</h1>
          <p className="text-muted-foreground">Review and manage student applications from the database</p>
        </div>
        <Button onClick={fetchApplications} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
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
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="admitted">Admitted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{applications.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{applications.filter(a => a.status === 'pending').length}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{applications.filter(a => a.status === 'admitted').length}</div>
            <div className="text-xs text-muted-foreground">Admitted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{applications.filter(a => a.status === 'rejected').length}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Programme</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Loading applications...</p>
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3 border border-primary/20">
                            {(app.full_name || 'U').charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">{app.full_name || 'Unnamed'}</div>
                            <div className="text-xs text-muted-foreground">{app.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                        {app.first_choice || 'Not selected'}
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
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(app.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
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
                  <div className="h-24 w-24 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-border">
                    <User className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">{selectedApp.full_name || 'Unnamed Applicant'}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="font-mono bg-background">{selectedApp.id.slice(0, 8)}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-primary" /> DOB: {selectedApp.date_of_birth || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-primary" /> {selectedApp.address || 'N/A'}
                      </div>
                    </div>
                    <div className="pt-2">
                      <Badge className={getStatusColor(selectedApp.status)}>
                        Status: {selectedApp.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal & Academic Info */}
                  <Card className="border-border bg-muted/20">
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                        <FileText className="h-5 w-5 text-primary" />
                        Personal & Academic
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block text-xs uppercase font-bold">Gender</span>
                          <span className="font-medium text-foreground">{selectedApp.gender || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs uppercase font-bold">Nationality</span>
                          <span className="font-medium text-foreground">{selectedApp.nationality || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs uppercase font-bold">Guardian</span>
                          <span className="font-medium text-foreground">{selectedApp.guardian_name || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs uppercase font-bold">Guardian Phone</span>
                          <span className="font-medium text-foreground">{selectedApp.guardian_phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs uppercase font-bold">JHS</span>
                          <span className="font-medium text-foreground">{selectedApp.jhs_name || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs uppercase font-bold">BECE Index</span>
                          <span className="font-medium text-foreground">{selectedApp.bece_index || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="border-t border-border pt-4">
                        <span className="text-muted-foreground block mb-2 text-xs uppercase font-bold">Programme Choices</span>
                        <div className="space-y-2">
                          <div className="flex justify-between p-2 bg-background rounded border border-border/50">
                            <span className="text-muted-foreground">1st Choice:</span>
                            <span className="font-bold text-primary">{selectedApp.first_choice || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-background rounded border border-border/50">
                            <span className="text-muted-foreground">2nd Choice:</span>
                            <span className="font-medium text-foreground">{selectedApp.second_choice || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-background rounded border border-border/50">
                            <span className="text-muted-foreground">3rd Choice:</span>
                            <span className="font-medium text-foreground">{selectedApp.third_choice || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* BECE Grades */}
                  <Card className="border-border bg-muted/20">
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        BECE Results
                      </h3>
                      <div className="space-y-2">
                        <div className="bg-background p-3 rounded border border-border shadow-sm">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Mathematics</span>
                          <span className="font-black text-2xl text-foreground">{selectedApp.math_grade || 'N/A'}</span>
                        </div>
                        <div className="bg-background p-3 rounded border border-border shadow-sm">
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold">English Language</span>
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
                Delete
              </Button>
              
              <div className="flex gap-3 w-full md:w-auto justify-end">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
                {selectedApp && (selectedApp.status === 'pending' || selectedApp.status === 'draft') && (
                  <>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleStatusUpdate(selectedApp.id, 'reject')}
                    >
                      Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleStatusUpdate(selectedApp.id, 'approve')}
                    >
                      Approve
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
