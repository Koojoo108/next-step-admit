import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgrammesAdmin from '@/pages/admin/ProgrammesAdmin';
import AnnouncementsAdmin from '@/pages/admin/AnnouncementsAdmin';

const Settings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
      
      <Tabs defaultValue="programmes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="programmes">Programmes</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
        <TabsContent value="programmes">
          <ProgrammesAdmin />
        </TabsContent>
        <TabsContent value="announcements">
          <AnnouncementsAdmin />
        </TabsContent>
        <TabsContent value="general">
          <div className="p-4 bg-white rounded shadow text-gray-500">
            General settings content (School name, logo, admission periods etc.)
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
