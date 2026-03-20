import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Calendar, 
  FileText, 
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  Globe,
  Home
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
import { adminDataService } from '../services/adminDataService';
import { apiService } from '../services/apiService';
import { toast } from 'sonner';

const Applicants = () => {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [allApplicants, setAllApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Profile Modal State
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      try {
        const data = await apiService.getApplicants();
        setAllApplicants(data);
        setApplicants(data);
      } catch (err: any) {
        toast.error('Failed to load applicants');
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setApplicants(allApplicants);
      return;
    }
    
    const filtered = allApplicants.filter(app => 
      app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setApplicants(filtered);
  }, [searchTerm, allApplicants]);

  const openProfile = (app: any) => {
    setSelectedApp(app);
    setProfileOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'admitted': return 'bg-success/10 text-success border-success/20';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Applicants Directory</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search applicants..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applicants.map((app) => (
          <Card key={app.id} className="hover:shadow-lg transition-all border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border border-primary/20">
                  {app.full_name?.charAt(0) || 'A'}
                </div>
                <Badge className={getStatusColor(app.status)}>
                  {app.status}
                </Badge>
              </div>
              
              <div className="mt-4">
                <h3 className="font-bold text-xl text-foreground">{app.full_name}</h3>
                <p className="text-sm text-muted-foreground">{app.application_id_display || 'No ID'}</p>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-3 text-primary" />
                  <span className="truncate">{app.email || 'No email'}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-3 text-primary" />
                  <span>{app.phone || 'No phone'}</span>
                </div>
                {app.city_town && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-3 text-primary" />
                    <span>{app.city_town}, {app.region_state}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                 <span className="text-xs text-muted-foreground">Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary/80 hover:bg-primary/10 font-semibold"
                    onClick={() => openProfile(app)}
                 >
                    View Profile
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && applicants.length === 0 && (
          <div className="col-span-full text-center py-20 bg-card rounded-lg border border-dashed border-border">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground text-lg">No applicants found matching your search.</p>
          </div>
        )}
      </div>

      {/* Applicant Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 border-border bg-card">
          <DialogHeader className="p-8 pb-4 bg-primary/5 border-b border-border">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {selectedApp?.fullName?.charAt(0) || 'A'}
                </div>
                <div>
                    <DialogTitle className="text-3xl font-extrabold text-foreground">
                        {selectedApp?.fullName}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-mono">{selectedApp?.application_id_display}</Badge>
                        <Badge className={getStatusColor(selectedApp?.status)}>{selectedApp?.status}</Badge>
                    </div>
                </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-8 pt-4">
            {selectedApp && (
              <div className="space-y-8">
                {/* Contact & Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-border pb-2">
                            <User className="h-5 w-5" /> Personal Details
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Full Name:</span>
                                <span className="font-medium text-foreground">{selectedApp.fullName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Gender:</span>
                                <span className="font-medium text-foreground">{selectedApp.gender || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date of Birth:</span>
                                <span className="font-medium text-foreground">{selectedApp.dateOfBirth || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nationality:</span>
                                <span className="font-medium text-foreground">{selectedApp.nationality || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Religion:</span>
                                <span className="font-medium text-foreground">{selectedApp.religion || 'N/A'}</span>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-border pb-2">
                            <Mail className="h-5 w-5" /> Contact Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-foreground">{selectedApp.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-foreground">{selectedApp.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Home className="h-4 w-4 text-muted-foreground" />
                                <span className="text-foreground">{selectedApp.address || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="text-foreground">{selectedApp.city_town}, {selectedApp.region_state}, {selectedApp.country}</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Academic Profile */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-border pb-2">
                        <FileText className="h-5 w-5" /> Academic Profile
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <span className="text-xs text-muted-foreground block uppercase font-bold mb-1">Previous School</span>
                            <span className="font-semibold text-foreground">{selectedApp.jhs_name || 'N/A'}</span>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <span className="text-xs text-muted-foreground block uppercase font-bold mb-1">BECE Index</span>
                            <span className="font-semibold text-foreground">{selectedApp.bece_index || 'N/A'}</span>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <span className="text-xs text-muted-foreground block uppercase font-bold mb-1">BECE Year</span>
                            <span className="font-semibold text-foreground">{selectedApp.bece_year || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div className="mt-4 bg-muted/10 p-6 rounded-xl border border-border">
                        <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" /> Program Choice
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-card border border-border rounded-lg shadow-sm">
                                <span className="text-xs text-muted-foreground block">Programme</span>
                                <span className="font-medium text-primary">{selectedApp.programmeName || 'N/A'}</span>
                            </div>
                            <div className="p-3 bg-card border border-border rounded-lg shadow-sm">
                                <span className="text-xs text-muted-foreground block">Elective Combination</span>
                                <span className="font-medium text-foreground">{selectedApp.electiveCombination || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Parent/Guardian Section */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-border pb-2">
                        <Briefcase className="h-5 w-5" /> Parent / Guardian Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-xl border border-border">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Guardian Name:</span>
                                <span className="font-medium text-foreground">{selectedApp.guardian_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Relationship:</span>
                                <span className="font-medium text-foreground">{selectedApp.parent_relationship || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone Number:</span>
                                <span className="font-medium text-foreground">{selectedApp.guardian_phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Occupation:</span>
                                <span className="font-medium text-foreground">{selectedApp.parent_occupation || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Documents Section */}
                <section className="space-y-4 pb-10">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-primary border-b border-border pb-2">
                        <FileText className="h-5 w-5" /> Uploaded Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedApp.results_slip_url && (
                            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded text-blue-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-sm">BECE Results Slip</span>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => window.open(selectedApp.results_slip_url, '_blank')}>View</Button>
                            </div>
                        )}
                        {selectedApp.national_id_url && (
                            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded text-green-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-sm">National ID</span>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => window.open(selectedApp.national_id_url, '_blank')}>View</Button>
                            </div>
                        )}
                        {!selectedApp.results_slip_url && !selectedApp.national_id_url && (
                            <div className="col-span-full text-center py-6 text-muted-foreground italic border border-dashed border-border rounded-lg">
                                No documents uploaded
                            </div>
                        )}
                    </div>
                </section>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="p-6 border-t border-border bg-muted/20">
            <Button className="w-full md:w-auto" onClick={() => setProfileOpen(false)}>Close Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applicants;

