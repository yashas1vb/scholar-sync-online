import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Paperclip, Upload, FileText, Trash2 } from 'lucide-react';

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
  const [resourceName, setResourceName] = useState('');
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceType, setResourceType] = useState<'pdf' | 'assignment' | 'other'>('pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Create a unique file path for the resource
      const fileExt = resourceFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('course_pdfs')
        .upload(filePath, resourceFile, {
          cacheControl: '3600',
          upsert: false
        });

      // Manually set progress to 100% when upload completes
      setUploadProgress(100);

      if (error) {
        throw error;
      }

      // Get the public URL for the uploaded resource
      const { data: publicUrlData } = supabase.storage
        .from('course_pdfs')
        .getPublicUrl(filePath);

      const resourcePublicUrl = publicUrlData.publicUrl;

      // Insert into pdfs table in Supabase
      try {
        const { error: pdfError } = await supabase
          .from('pdfs')
          .insert({
            file_url: resourcePublicUrl,
            title: resourceName,
            module_id: null, // You can update this if you have a module_id
            position: 0, // You can update this if you want to track order
          });
        if (pdfError) {
          throw pdfError;
        }
      } catch (pdfError) {
        toast({
          variant: "destructive",
          title: "DB insert failed",
          description: pdfError instanceof Error ? pdfError.message : "Failed to save PDF info to database",
        });
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

      toast({
        title: "Resource uploaded successfully",
        description: "Your resource has been added to the lecture",
      });

      setTimeout(() => {
        setIsUploading(false);
      }, 1000);

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your resource",
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
              accept=".pdf,.doc,.docx,.txt"
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

        <Button
          type="button"
          variant="outline"
          onClick={uploadResource}
          disabled={isUploading || !resourceFile || !resourceName}
        >
          <Upload className="mr-2" size={16} />
          Upload Resource
        </Button>
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
