import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download, 
  Mail, 
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Send,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { apiService } from '../services/apiService';
import { toast } from 'sonner';

interface AdmittedStudent {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  program: string;
  admissionDate: string;
  studentId: string;
  status: 'admitted' | 'pending' | 'rejected';
}

const AdmissionsManagement = () => {
  const [students, setStudents] = useState<AdmittedStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<AdmittedStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const data = await apiService.getAdmissions();
        const mapped = data.map((s: any) => ({
          id: s.application_id,
          fullName: `${s.first_name} ${s.last_name}`,
          email: s.email,
          phone: s.mobile_phone,
          program: s.selected_programme,
          admissionDate: s.updated_at,
          studentId: s.application_id,
          status: s.status.toLowerCase()
        }));
        setStudents(mapped);
        setFilteredStudents(mapped);
      } catch (err: any) {
        toast.error('Failed to load admitted students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [students, statusFilter, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'admitted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAdmissionAction = async (studentId: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'Admitted' : 'Rejected';
    try {
      await apiService.updateApplicationStatus(studentId, newStatus);
      toast.success(`Student ${action === 'approve' ? 'admitted' : 'rejected'} successfully`);
      // Refresh
      const data = await apiService.getAdmissions();
      const mapped = data.map((s: any) => ({
        id: s.application_id,
        fullName: `${s.first_name} ${s.last_name}`,
        email: s.email,
        phone: s.mobile_phone,
        program: s.selected_programme,
        admissionDate: s.updated_at,
        studentId: s.application_id,
        status: s.status.toLowerCase()
      }));
      setStudents(mapped);
    } catch (err: any) {
      toast.error('Failed to update admission status');
    }
  };

  const generateLetter = (student: AdmittedStudent) => {
    apiService.generateAdmissionLetter(student.id).then(() => {
        alert(`Admission letter generated for ${student.fullName}`);
    });
  };

  const sendProspectus = (student: AdmittedStudent) => {
    apiService.sendProspectus(student.id).then(() => {
        alert(`Prospectus sent to ${student.email}`);
    });
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const bulkAction = (action: 'approve' | 'reject') => {
    const selectedCount = selectedStudents.length;
    if (selectedCount === 0) {
      alert(`Please select students to ${action}`);
      return;
    }

    const message = `Are you sure you want to ${action} ${selectedCount} student(s)?`;
    if (window.confirm(message)) {
      selectedStudents.forEach(studentId => {
        handleAdmissionAction(studentId, action);
      });
      setSelectedStudents([]);
    }
  };

  const exportAdmissions = () => {
    apiService.exportApplications('csv');
  };


  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admissions Management</h1>
        <p className="text-gray-600">Manage student admissions, generate letters, and send prospectus</p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="admitted">Admitted</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              
              {selectedStudents.length > 0 && (
                <>
                  <Button 
                    onClick={() => bulkAction('approve')}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Selected ({selectedStudents.length})
                  </Button>
                  <Button 
                    onClick={() => bulkAction('reject')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Selected ({selectedStudents.length})
                  </Button>
                </>
              )}
              
              <Button onClick={exportAdmissions} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(students.map(s => s.id));
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {student.studentId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.program}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.admissionDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(student.status)}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        
                        {student.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleAdmissionAction(student.id, 'approve')}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleAdmissionAction(student.id, 'reject')}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        
                        {student.status === 'admitted' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => generateLetter(student)}
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => sendProspectus(student)}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionsManagement;
