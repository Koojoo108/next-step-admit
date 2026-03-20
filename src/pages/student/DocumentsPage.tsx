import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const documentTypes = [
  { key: 'passport_photo', label: 'Passport Photograph', description: 'Recent color photo with white background' },
  { key: 'bece_result', label: 'BECE Result Slip', description: 'Certified copy of your BECE results' },
  { key: 'birth_certificate', label: 'Birth Certificate', description: 'Official copy of your birth certificate' },
];

const DocumentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchDocs = async () => {
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);
      setDocuments(data || []);
      setLoading(false);
    };
    fetchDocs();
  }, [user]);

  const handleUpload = async (type: string, file: File) => {
    if (!user) return;
    
    // File size validation (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 5MB', variant: 'destructive' });
      return;
    }

    setUploading(type);
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${type}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
    
    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploading(null);
      return;
    }

    // Remove old doc record of same type
    const existing = documents.find(d => d.document_type === type);
    if (existing) {
      await supabase.from('documents').delete().eq('id', existing.id);
    }

    const { data, error: insertError } = await supabase.from('documents').insert({
      user_id: user.id,
      document_type: type,
      file_path: filePath,
      file_name: file.name,
    }).select().single();

    if (insertError) {
      toast({ title: 'Database update failed', description: insertError.message, variant: 'destructive' });
    } else if (data) {
      setDocuments(prev => [...prev.filter(d => d.document_type !== type), data]);
      toast({ title: 'Document uploaded successfully!' });
    }
    
    setUploading(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Required Documents</h1>
          <p className="text-muted-foreground mt-2">Please upload clear scanned copies of the following documents.</p>
        </div>
        <div className="bg-secondary/10 px-4 py-2 rounded-xl border border-secondary/20 flex items-center gap-2">
          <AlertCircle className="text-secondary h-4 w-4" />
          <span className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">Format: PDF, JPG or PNG (Max 5MB)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentTypes.map(docType => {
          const existing = documents.find(d => d.document_type === docType.key);
          const isUploading = uploading === docType.key;
          
          return (
            <div key={docType.key} className={`group bg-card rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
              existing ? 'border-success/30 shadow-sm' : 'border-border shadow-sm hover:border-secondary/30'
            }`}>
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    existing ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary'
                  }`}>
                    {existing ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                  </div>
                  {existing && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-success px-2 py-1 bg-success/10 rounded-full border border-success/20">
                      Uploaded
                    </span>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-lg text-foreground">{docType.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {docType.description}
                  </p>
                </div>

                {existing && (
                  <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border border-border mt-2">
                    <div className="bg-white p-1 rounded shadow-sm">
                      <FileText size={14} className="text-muted-foreground" />
                    </div>
                    <span className="text-[10px] font-medium text-foreground truncate max-w-[150px]">
                      {existing.file_name}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/30 border-t border-border mt-auto">
                <Label htmlFor={docType.key} className="cursor-pointer">
                  <div className={`flex items-center justify-center gap-2 w-full h-10 rounded-xl text-sm font-bold transition-all ${
                    isUploading ? 'bg-muted text-muted-foreground cursor-not-allowed' :
                    existing ? 'bg-white border border-border text-foreground hover:bg-muted' :
                    'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm active:scale-95'
                  }`}>
                    {isUploading ? (
                      <><Clock className="h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="h-4 w-4" /> {existing ? 'Replace File' : 'Choose File'}</>
                    )}
                  </div>
                  <Input
                    id={docType.key}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(docType.key, file);
                    }}
                    disabled={isUploading}
                  />
                </Label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-border flex items-center justify-center shrink-0">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="font-bold text-xl">Finalizing Your Application</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Once you have uploaded all three required documents and submitted your application form, our team will begin the review process. You can track the progress on your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
