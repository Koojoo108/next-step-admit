import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  label: string;
  bucket: string;
  path: string;
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
  acceptedFileTypes?: string;
}

export function FileUpload({ label, bucket, path, onUploadComplete, currentUrl, acceptedFileTypes = "image/*,application/pdf" }: FileUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | undefined>(currentUrl);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    console.log("[FileUpload] Starting upload...");
    setUploading(true);
    
    // Add a timeout fallback to ensure uploading state is always reset
    const timeoutId = setTimeout(() => {
      console.log("[FileUpload] Timeout fallback - setting uploading to false");
      setUploading(false);
    }, 10000); // 10 second timeout
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log("[FileUpload] Uploading to:", bucket, filePath);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("[FileUpload] Upload error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      
      console.log("[FileUpload] Upload successful:", data.publicUrl);
      setFileUrl(data.publicUrl);
      onUploadComplete(data.publicUrl);
      toast.success("File uploaded successfully");
      
      // Clear the file input
      event.target.value = '';
      
    } catch (error: any) {
      console.error("[FileUpload] Error:", error);
      toast.error("Error uploading file: " + (error.message || "Unknown error"));
    } finally {
      clearTimeout(timeoutId);
      console.log("[FileUpload] Upload completed, setting uploading to false");
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setFileUrl(undefined);
      onUploadComplete("");
      toast.success("File removed");
    } catch (error: any) {
      console.error("[FileUpload] Remove error:", error);
      toast.error("Error removing file");
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {!fileUrl ? (
        <div className="flex items-center gap-2">
          <Input 
            type="file" 
            accept={acceptedFileTypes}
            onChange={handleUpload}
            disabled={uploading}
            className="cursor-pointer"
          />
          {uploading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>
      ) : (
        <div className="flex items-center gap-4 p-2 border rounded-md bg-green-50/50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-green-700 truncate">File uploaded</p>
                <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View File</a>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <XCircle className="h-4 w-4" />
            </Button>
        </div>
      )}
    </div>
  );
}
