import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Trash2 } from 'lucide-react';

const documentTypes = [
  { key: 'passport_photo', label: 'Passport Photograph' },
  { key: 'bece_result', label: 'BECE Result Slip' },
  { key: 'birth_certificate', label: 'Birth Certificate' },
];

const DocumentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => setDocuments(data || []));
  }, [user]);

  const handleUpload = async (type: string, file: File) => {
    if (!user) return;
    setUploading(type);
    const filePath = `${user.id}/${type}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploading(null);
      return;
    }

    // Remove old doc of same type
    const existing = documents.find(d => d.document_type === type);
    if (existing) {
      await supabase.from('documents').delete().eq('id', existing.id);
    }

    const { data } = await supabase.from('documents').insert({
      user_id: user.id,
      document_type: type,
      file_path: filePath,
      file_name: file.name,
    }).select().single();

    if (data) {
      setDocuments(prev => [...prev.filter(d => d.document_type !== type), data]);
    }
    toast({ title: 'Document uploaded!' });
    setUploading(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Upload Documents</h1>
      <p className="text-muted-foreground mb-8">Upload the required documents for your application.</p>

      <div className="space-y-4">
        {documentTypes.map(docType => {
          const existing = documents.find(d => d.document_type === docType.key);
          return (
            <div key={docType.key} className="bg-card rounded-lg p-6 border border-border shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-secondary" />
                  <div>
                    <h3 className="font-semibold text-foreground">{docType.label}</h3>
                    {existing && (
                      <p className="text-sm text-success mt-0.5">✓ {existing.file_name}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor={docType.key} className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild disabled={uploading === docType.key}>
                      <span>
                        <Upload className="h-4 w-4 mr-1" />
                        {uploading === docType.key ? 'Uploading...' : existing ? 'Replace' : 'Upload'}
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id={docType.key}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(docType.key, file);
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsPage;
