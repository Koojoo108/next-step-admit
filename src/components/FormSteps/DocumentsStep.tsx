import React, { useImperativeHandle, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApplicationState } from '@/hooks/useApplicationState';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { CheckCircle, Upload, X, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Simple validation schema
const documentsSchema = z.object({
  birthCertificateUrl: z.string().min(1, 'Birth certificate is required'),
  beceResultsUrl: z.string().min(1, 'BECE results are required'),
  transcriptUrl: z.string().min(1, 'Academic transcript is required'),
  otherDocumentsUrl: z.string().optional(),
});

type DocumentsForm = z.infer<typeof documentsSchema>;

export type StepHandle = {
  trigger: () => Promise<boolean>;
};

// Universal document uploaders configuration
const DOCUMENT_UPLOADERS = {
  birthCertificate: { 
    maxSize: 2, 
    types: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'], 
    folder: 'birth-certificates',
    label: 'Birth Certificate',
    required: true
  },
  beceResults: { 
    maxSize: 3, 
    types: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'], 
    folder: 'bece-results',
    label: 'BECE Results',
    required: true
  },
  transcript: { 
    maxSize: 2, 
    types: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'], 
    folder: 'transcripts',
    label: 'Academic Transcript',
    required: true
  },
  otherDocuments: { 
    maxSize: 5, 
    types: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'], 
    folder: 'other-documents',
    label: 'Other Documents',
    required: false
  }
};

const DocumentsStep = React.forwardRef<StepHandle>((_props, ref) => {
  const { steps, updateDocuments } = useApplicationState();
  const { user } = useAuth();
  
  // Individual file input refs
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({});
  
  // Upload state for each document type
  const [uploadStates, setUploadStates] = useState<Record<string, {
    isUploading: boolean;
    uploadedUrl: string;
    error: string | null;
  }>>(() => {
    const initial: Record<string, any> = {};
    Object.keys(DOCUMENT_UPLOADERS).forEach(docType => {
      const fieldName = `${docType}Url`;
      initial[docType] = {
        isUploading: false,
        uploadedUrl: steps.documents?.[fieldName as keyof typeof steps.documents] || '',
        error: null
      };
    });
    return initial;
  });

  // Form setup
  const form = useForm<DocumentsForm>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      birthCertificateUrl: uploadStates.birthCertificate.uploadedUrl,
      beceResultsUrl: uploadStates.beceResults.uploadedUrl,
      transcriptUrl: uploadStates.transcript.uploadedUrl,
      otherDocumentsUrl: uploadStates.otherDocuments.uploadedUrl
    },
    mode: 'onChange',
  });

  // Sync form with upload states
  React.useEffect(() => {
    Object.keys(uploadStates).forEach(docType => {
      const fieldName = `${docType}Url`;
      if (uploadStates[docType].uploadedUrl) {
        form.setValue(fieldName as keyof DocumentsForm, uploadStates[docType].uploadedUrl, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      }
    });
  }, [uploadStates, form]);

  // Universal upload handler - works for EVERY document type
  const uploadDocument = async (docType: string, file: File): Promise<boolean> => {
    const config = DOCUMENT_UPLOADERS[docType as keyof typeof DOCUMENT_UPLOADERS];
    
    if (!user) {
      toast.error('Please log in again');
      return false;
    }

    // Instant validation
    const ext = file.name.split('.').pop().toLowerCase();
    if (!config.types.some(type => type.includes(ext))) {
      const extList = config.types.map(t => t.split('/')[1] || t).join('/');
      toast.error(`${config.label}: Only ${extList} allowed`);
      return false;
    }
    
    if (file.size > config.maxSize * 1024 * 1024) {
      toast.error(`${config.label}: Max ${config.maxSize}MB`);
      return false;
    }

    // Update state to show uploading
    setUploadStates(prev => ({
      ...prev,
      [docType]: { ...prev[docType], isUploading: true, error: null }
    }));

    try {
      // Base64 preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target?.result as string;
        setUploadStates(prev => ({
          ...prev,
          [docType]: { ...prev[docType], uploadedUrl: base64Url }
        }));
        
        // Update form immediately for instant feedback
        const fieldName = `${docType}Url`;
        form.setValue(fieldName as keyof DocumentsForm, base64Url, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      };
      reader.readAsDataURL(file);

      // Generate filename
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const fileName = `${docType}_${user.id}_${timestamp}.${fileExt}`;
      const filePath = `${user.id}/${config.folder}/${fileName}`;

      console.log(`[DocumentUpload] Uploading ${docType}: ${fileName}`);

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error(`[DocumentUpload] ${docType} error:`, error);
        throw new Error(error.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      console.log(`[DocumentUpload] ${docType} complete: ${publicUrl}`);

      // Update state with final URL
      setUploadStates(prev => ({
        ...prev,
        [docType]: { 
          isUploading: false, 
          uploadedUrl: publicUrl, 
          error: null 
        }
      }));

      // Update form with final URL
      const fieldName = `${docType}Url`;
      form.setValue(fieldName as keyof DocumentsForm, publicUrl, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });

      // Trigger validation
      await form.trigger(fieldName as keyof DocumentsForm);

      toast.success(`${config.label} uploaded successfully!`);
      return true;

    } catch (error) {
      console.error(`[DocumentUpload] ${docType} failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setUploadStates(prev => ({
        ...prev,
        [docType]: { 
          isUploading: false, 
          uploadedUrl: '', 
          error: errorMessage 
        }
      }));
      
      toast.error(`${config.label}: ${errorMessage}`);
      return false;
    }
  };

  // File input handlers
  const handleFileChange = async (docType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(`[DocumentUpload] ${docType} file selected: ${file.name}`);
    const success = await uploadDocument(docType, file);
    
    if (!success && fileInputRefs.current[docType]) {
      fileInputRefs.current[docType].value = '';
    }
  };

  // Remove uploaded file
  const handleRemoveUpload = (docType: string) => {
    setUploadStates(prev => ({
      ...prev,
      [docType]: { isUploading: false, uploadedUrl: '', error: null }
    }));
    
    const fieldName = `${docType}Url`;
    form.setValue(fieldName as keyof DocumentsForm, '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    
    if (fileInputRefs.current[docType]) {
      fileInputRefs.current[docType].value = '';
    }
    
    const config = DOCUMENT_UPLOADERS[docType as keyof typeof DOCUMENT_UPLOADERS];
    toast.info(`${config.label} removed`);
  };

  // Form validation trigger
  useImperativeHandle(ref, () => ({
    trigger: async () => {
      console.log('[DocumentsStep] Triggering validation...');
      const isValid = await form.trigger();
      console.log('[DocumentsStep] Validation result:', isValid);
      
      if (isValid) {
        updateDocuments(form.getValues());
      }
      
      return isValid;
    },
  }));

  return (
    <Form {...form}>
      <form className="space-y-6">
        <h2 className="text-2xl font-semibold">Document Uploads</h2>
        <div className="text-sm text-gray-600 mb-4">
          Please upload all required documents. Accepted formats: JPG, PNG, PDF.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(DOCUMENT_UPLOADERS).map(([docType, config]) => {
            const fieldName = `${docType}Url`;
            const uploadState = uploadStates[docType];
            
            return (
              <FormField
                key={docType}
                control={form.control}
                name={fieldName as keyof DocumentsForm}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {config.label} {config.required && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {/* Hidden form field for validation */}
                        <input
                          type="hidden"
                          {...field}
                          value={uploadState.uploadedUrl}
                          data-testid={`${docType}-url-input`}
                        />
                        
                        {/* Upload Area */}
                        {!uploadState.uploadedUrl ? (
                          <div className="relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 border-gray-300 hover:border-gray-400 hover:bg-gray-50">
                            <input
                              ref={(el) => { if (el) fileInputRefs.current[docType] = el; }}
                              type="file"
                              accept={config.types.join(',')}
                              onChange={(e) => handleFileChange(docType, e)}
                              disabled={uploadState.isUploading}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                              aria-label={`Upload ${config.label}`}
                            />
                            
                            <div className="space-y-3">
                              {uploadState.isUploading ? (
                                <div className="space-y-2">
                                  <Loader2 className="mx-auto h-8 w-8 text-blue-500 animate-spin" />
                                  <p className="text-sm font-medium text-gray-900">Uploading...</p>
                                  <div className="w-full max-w-xs mx-auto">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      Drop {config.label.toLowerCase()} here or click to browse
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Max {config.maxSize}MB • {config.types.map(t => t.split('/')[1] || t).join('/')}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={uploadState.isUploading}
                                    className="mx-auto"
                                  >
                                    Choose File
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Uploaded Document Preview */
                          <div className="space-y-3">
                            <div className="relative inline-block">
                              {uploadState.uploadedUrl.startsWith('data:') ? (
                                <img
                                  src={uploadState.uploadedUrl}
                                  alt={config.label}
                                  className="w-24 h-24 object-cover rounded-lg border-2 border-green-200 shadow-sm"
                                />
                              ) : (
                                <div className="w-24 h-24 flex items-center justify-center rounded-lg border-2 border-green-200 bg-green-50">
                                  <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 shadow-lg"
                                onClick={() => handleRemoveUpload(docType)}
                                aria-label={`Remove ${config.label}`}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">{config.label} uploaded</span>
                              </div>
                              {uploadState.uploadedUrl.startsWith('http') && (
                                <div className="text-xs text-gray-500">
                                  <a
                                    href={uploadState.uploadedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View document
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Error Display */}
                        {uploadState.error && (
                          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-700">{uploadState.error}</span>
                          </div>
                        )}
                        
                        {/* Validation Message */}
                        <FormMessage />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            );
          })}
        </div>
      </form>
    </Form>
  );
});

export default DocumentsStep;
