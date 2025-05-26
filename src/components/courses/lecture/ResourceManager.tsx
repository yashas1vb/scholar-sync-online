
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Paperclip, Upload, FileText, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface Resource {
  id: string;
  name: string;
  fileUrl: string;
  type: 'pdf' | 'assignment' | 'other';
}

interface ResourceManagerProps {
  resources: Resource[];
  onChange: (resources: Resource[]) => void;
}

const ResourceManager: React.FC<ResourceManagerProps> = ({ resources, onChange }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [resourceName, setResourceName] = useState('');
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceType, setResourceType] = useState<'pdf' | 'assignment' | 'other'>('pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      console.log('Selected resource file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Resource file must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setResourceFile(file);
      // Use filename as resource name if not provided
      if (!resourceName) {
        setResourceName(file.name.split('.')[0]);
      }
    }
  };

  const uploadResource = async () => {
    if (!resourceFile || !resourceName) {
      toast({
        title: "Missing information",
        description: "Please provide both name and file for the resource",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload resources",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      console.log('Starting resource upload to Supabase storage...');
      
      // Create a unique file path for the resource
      const fileExt = resourceFile.name.split('.').pop();
      const fileName = `${user.id}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      console.log('Uploading resource to path:', fileName);
      setUploadProgress(50);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('course_pdfs')
        .upload(fileName, resourceFile, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('Resource upload result:', { data, error });
      setUploadProgress(90);

      if (error) {
        console.error('Resource upload error:', error);
        throw error;
      }

      // Get the public URL for the uploaded resource
      const { data: publicUrlData } = supabase.storage
        .from('course_pdfs')
        .getPublicUrl(fileName);

      const resourcePublicUrl = publicUrlData.publicUrl;
      console.log('Generated resource public URL:', resourcePublicUrl);

      // Insert into pdfs table in Supabase for tracking
      try {
        const { error: pdfError } = await supabase
          .from('pdfs')
          .insert({
            file_url: resourcePublicUrl,
            title: resourceName,
            module_id: null, // Will be linked to module when available
            position: 0,
          });
        
        if (pdfError) {
          console.warn('Could not insert into pdfs table:', pdfError);
          // Don't throw here as the file upload succeeded
        }
      } catch (pdfError) {
        console.warn('DB insert warning:', pdfError);
        // Continue with the flow even if DB insert fails
      }

      // Add to resources list
      const newResource: Resource = {
        id: Math.random().toString(36).substring(2, 9),
        name: resourceName,
        fileUrl: resourcePublicUrl,
        type: resourceType,
      };

      const updatedResources = [...resources, newResource];
      onChange(updatedResources);

      // Reset form
      setResourceName('');
      setResourceFile(null);
      setUploadProgress(100);

      toast({
        title: "Resource uploaded successfully",
        description: "Your resource has been added to the lecture",
      });

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error: any) {
      console.error("Resource upload error:", error);
      
      let errorMessage = "There was an error uploading your resource";
      
      if (error.message?.includes('row-level security')) {
        errorMessage = "Storage permissions error. Please contact support.";
      } else if (error.message?.includes('bucket')) {
        errorMessage = "Storage bucket not found. Please contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessage,
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeResource = (id: string) => {
    const updatedResources = resources.filter(resource => resource.id !== id);
    onChange(updatedResources);
  };

  return (
    <div className="border rounded-md p-4 space-y-4">
      <h3 className="font-medium">Lecture Resources</h3>

      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Resource name"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
            />
          </div>
          <div>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as 'pdf' | 'assignment' | 'other')}
            >
              <option value="pdf">PDF</option>
              <option value="assignment">Assignment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>

        {resourceFile && (
          <p className="text-sm text-gray-600">
            Selected file: {resourceFile.name} ({(resourceFile.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}

        {isUploading && (
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-lms-indigo h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={uploadResource}
            disabled={isUploading || !resourceFile || !resourceName || !user}
          >
            <Upload className="mr-2" size={16} />
            {isUploading ? 'Uploading...' : 'Upload Resource'}
          </Button>
          {!user && (
            <p className="text-sm text-red-600">Please log in to upload files</p>
          )}
        </div>
      </div>

      {resources.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-2">Added Resources:</h4>
          <ul className="space-y-2">
            {resources.map((resource) => (
              <li
                key={resource.id}
                className="flex items-center justify-between bg-muted p-2 rounded-md"
              >
                <div className="flex items-center">
                  <FileText size={16} className="mr-2 text-gray-500" />
                  <div>
                    <span className="font-medium">{resource.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({resource.type})
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResource(resource.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
