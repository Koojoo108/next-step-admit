import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Save, RefreshCw } from 'lucide-react';

const GeneralSettings = () => {
  const [schoolName, setSchoolName] = useState('DUAPA ACADEMY');
  const [admissionStart, setAdmissionStart] = useState('');
  const [admissionEnd, setAdmissionEnd] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      if (data) {
        setSettingsId(data.id);
        setSchoolName(data.school_name || '');
        setAdmissionStart(data.admission_start || '');
        setAdmissionEnd(data.admission_end || '');
        setLogoUrl(data.logo_url);
        setFaviconUrl(data.favicon_url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, `site/logo.${file.name.split('.').pop()}`);
      setLogoUrl(url);
      toast.success('Logo uploaded');
    } catch {
      toast.error('Failed to upload logo');
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, `site/favicon.${file.name.split('.').pop()}`);
      setFaviconUrl(url);
      toast.success('Favicon uploaded');
    } catch {
      toast.error('Failed to upload favicon');
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (settingsId) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            school_name: schoolName,
            admission_start: admissionStart || null,
            admission_end: admissionEnd || null,
            logo_url: logoUrl,
            favicon_url: faviconUrl,
          })
          .eq('id', settingsId);
        if (error) throw error;
      } else {
        // Insert if no settings exist yet
        const { error } = await supabase
          .from('site_settings')
          .insert({
            school_name: schoolName,
            admission_start: admissionStart || null,
            admission_end: admissionEnd || null,
            logo_url: logoUrl,
            favicon_url: faviconUrl,
          });
        if (error) throw error;
        await load(); // reload to get the new ID
      }
      toast.success('Settings saved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-foreground">School Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>School Name</Label>
            <Input value={schoolName} onChange={e => setSchoolName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Admission Period Start</Label>
              <Input type="date" value={admissionStart} onChange={e => setAdmissionStart(e.target.value)} />
            </div>
            <div>
              <Label>Admission Period End</Label>
              <Input type="date" value={admissionEnd} onChange={e => setAdmissionEnd(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-foreground">Branding</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>School Logo</Label>
              <div className="mt-2 flex items-center gap-4">
                {logoUrl && <img src={logoUrl} alt="Logo" className="h-16 w-16 object-contain rounded border" />}
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background text-sm hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4" /> Upload Logo
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>
            <div>
              <Label>Favicon</Label>
              <div className="mt-2 flex items-center gap-4">
                {faviconUrl && <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain rounded border" />}
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background text-sm hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4" /> Upload Favicon
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} />
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full md:w-auto">
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
};

export default GeneralSettings;
