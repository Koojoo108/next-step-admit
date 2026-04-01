import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgrammesAdmin from '@/pages/admin/ProgrammesAdmin';
import AnnouncementsAdmin from '@/pages/admin/AnnouncementsAdmin';
import GeneralSettings from '@/admin/pages/GeneralSettings';

const Settings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
      
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
          <GeneralSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
