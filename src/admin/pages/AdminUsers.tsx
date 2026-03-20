import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Shield } from 'lucide-react';
import { apiService } from '../services/apiService';
import { toast } from 'sonner';

const AdminUsers = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const data = await apiService.getUsers();
        setAdmins(data);
      } catch (err: any) {
        toast.error('Failed to load admin users');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleAddAdmin = () => {
    // Basic prompt for demonstration, a dialog would be better
    const email = prompt('Enter admin email:');
    if (!email) return;
    const fullName = prompt('Enter full name:');
    if (!fullName) return;
    const password = prompt('Enter password:');
    if (!password) return;

    apiService.createAdminUser({ email, fullName, password, role: 'Admin' })
      .then(() => {
        toast.success('Admin added successfully');
        apiService.getUsers().then(setAdmins);
      })
      .catch(err => toast.error(err.message));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Users</h1>
        <Button onClick={handleAddAdmin}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <Shield className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{admin.full_name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-900 cursor-pointer">
                      Edit
                    </td>
                  </tr>
                ))}
                {!loading && admins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No admin users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;

