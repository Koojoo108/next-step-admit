import React, { useImperativeHandle, useState, useRef, useCallback } from 'react';
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
const passportSchema = z.object({
  passportPhotoUrl: z.string().min(1, 'Passport photograph is required'),
});

type PassportForm = z.infer<typeof passportSchema>;

export type StepHandle = {
  trigger: () => Promise<boolean>;
};

// Simple constants
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const PassportStep = React.forwardRef<StepHandle>((_props, ref) => {
  const { steps, updatePassport } = useApplicationState();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Simple state - no complex stages
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    uploadedUrl: steps.passport?.passportPhotoUrl || '',
    error: null as string | null,
    dragOver: false
  });

  // Form setup
  const form = useForm<PassportForm>({
    resolver: zodResolver(passportSchema),
    defaultValues: {
      passportPhotoUrl: uploadState.uploadedUrl
    },
    mode: 'onChange',
  });

  // Sync form with uploaded URL
  React.useEffect(() => {
    if (uploadState.uploadedUrl) {
      form.setValue('passportPhotoUrl', uploadState.uploadedUrl, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }
  }, [uploadState.uploadedUrl, form]);

  // Simple file validation
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'JPG or PNG files only';
    }
    if (file.size > MAX_SIZE) {
      return 'File must be less than 2MB';
    }
    return null;
  };

  // Bulletproof upload function - SIMPLE & RELIABLE
  const uploadPassport = async (file: File): Promise<boolean> => {
    if (!user) {
      toast.error('Please log in again');
      return false;
    }

    // 1. Instant validation
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return false;
    }

    // 2. Fast base64 for instant preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      setUploadState(prev => ({ ...prev, uploadedUrl: base64Url }));
      
      // Update form immediately for instant feedback
      form.setValue('passportPhotoUrl', base64Url, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    };
    reader.readAsDataURL(file);

    // 3. Quick upload with minimal processing
    try {
      setUploadState(prev => ({ ...prev, isUploading: true, error: null }));

      // Generate simple filename
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const fileName = `passport_${user.id}_${timestamp}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log(`[PassportUpload] Starting: ${fileName}`);

      // Direct upload - no complex processing
      const { data, error } = await supabase.storage
        .from('passports')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('[PassportUpload] Upload error:', error);
        throw new Error(error.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('passports')
        .getPublicUrl(filePath);

      console.log(`[PassportUpload] Complete: ${publicUrl}`);

      // INSTANT SUCCESS - NO DELAYS
      setUploadState({
        isUploading: false,
        uploadedUrl: publicUrl,
        error: null,
        dragOver: false
      });

      // Update form immediately
      form.setValue('passportPhotoUrl', publicUrl, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });

      // Trigger validation right away
      await form.trigger('passportPhotoUrl');

      toast.success('Passport uploaded successfully!');
      return true;

    } catch (error) {
      console.error('[PassportUpload] Failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage
      }));
      
      toast.error(errorMessage);
      return false;
    }
  };

  // File input handler
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log(`[PassportUpload] File selected: ${file.name}`);
    const success = await uploadPassport(file);
    
    if (!success) {
      // Reset input on failure
      event.target.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, dragOver: true }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, dragOver: false }));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, dragOver: false }));
    
    const file = e.dataTransfer.files[0];
    if (!file) return;

    console.log(`[PassportUpload] File dropped: ${file.name}`);
    const success = await uploadPassport(file);
    
    if (!success && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove uploaded file
  const handleRemoveUpload = () => {
    setUploadState({
      isUploading: false,
      uploadedUrl: '',
      error: null,
      dragOver: false
    });
    
    form.setValue('passportPhotoUrl', '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast.info('Passport removed');
  };

  // Form validation trigger
  useImperativeHandle(ref, () => ({
    trigger: async () => {
      console.log('[PassportStep] Triggering validation...');
      const isValid = await form.trigger();
      console.log('[PassportStep] Validation result:', isValid);
      
      if (isValid) {
        updatePassport(form.getValues());
      }
      
      return isValid;
    },
  }));

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Passport Photograph</h2>
          <p className="text-sm text-gray-600">
            Upload a recent passport-sized photograph. JPG or PNG format, maximum 2MB.
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="passportPhotoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Passport Photograph</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Hidden form field for validation */}
                  <input
                    type="hidden"
                    {...field}
                    value={uploadState.uploadedUrl}
                    data-testid="passport-url-input"
                  />
                  
                  {/* Upload Area */}
                  {!uploadState.uploadedUrl ? (
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                        uploadState.dragOver
                          ? 'border-blue-500 bg-blue-50'
                          : uploadState.error
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileChange}
                        disabled={uploadState.isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        aria-label="Upload passport photograph"
                      />
                      
                      <div className="space-y-4">
                        {uploadState.isUploading ? (
                          <div className="space-y-3">
                            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-900">Uploading...</p>
                              <div className="w-full max-w-xs mx-auto">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">Processing upload...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="space-y-2">
                              <p className="text-lg font-medium text-gray-900">
                                Drop your passport photo here or click to browse
                              </p>
                              <p className="text-sm text-gray-500">
                                JPG or PNG files (Max 2MB)
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
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
                    /* Uploaded Image Preview */
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={uploadState.uploadedUrl}
                          alt="Passport Photograph"
                          className="w-32 h-40 object-cover rounded-lg border-2 border-green-200 shadow-sm"
                          data-testid="passport-preview"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 shadow-lg"
                          onClick={handleRemoveUpload}
                          aria-label="Remove passport photograph"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Passport photograph uploaded successfully</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <a
                            href={uploadState.uploadedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View full size image
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Error Display */}
                  {uploadState.error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">{uploadState.error}</span>
                    </div>
                  )}
                  
                  {/* Validation Message */}
                  <FormMessage />
                  
                  {/* Simple Debug Info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                      Debug: {field.value ? 'URL SET' : 'NO URL'} | Uploading: {uploadState.isUploading ? 'YES' : 'NO'}
                    </div>
                  )}
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
});

export default PassportStep;
