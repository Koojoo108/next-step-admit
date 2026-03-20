import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminDataService } from '../services/adminDataService';

const Reports = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Mock data for charts as real aggregation might be heavy for client side without backend support
    // In production, this should come from an API endpoint for reports
    const mockChartData = [
      { name: 'Jan', applications: 40 },
      { name: 'Feb', applications: 30 },
      { name: 'Mar', applications: 20 },
      { name: 'Apr', applications: 27 },
      { name: 'May', applications: 18 },
      { name: 'Jun', applications: 23 },
      { name: 'Jul', applications: 34 },
    ];
    setData(mockChartData);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
