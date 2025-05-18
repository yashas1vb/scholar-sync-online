
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/components/ui/use-toast';
import { Upload, Video } from 'lucide-react';

const lectureFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  videoUrl: z.string().url({ message: "Please enter a valid video URL" }).or(z.string().length(0)),
});

interface Resource {
  id: string;
  name: string;
  fileUrl: string;
  type: 'pdf' | 'assignment' | 'other';
}

interface LectureFormProps {
  courseId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LectureForm: React.FC<LectureFormProps> = ({ courseId, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceName, setResourceName] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState<'pdf' | 'assignment' | 'other'>('pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof lectureFormSchema>>({
    resolver: zodResolver(lectureFormSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
    },
  });

  const addResource = () => {
    if (!resourceName || !resourceUrl) {
      toast({
        title: "Missing information",
        description: "Please provide both name and URL for the resource",
        variant: "destructive",
      });
      return;
    }

    const newResource: Resource = {
      id: Math.random().toString(36).substring(2, 9),
      name: resourceName,
      fileUrl: resourceUrl,
      type: resourceType,
    };

    setResources([...resources, newResource]);
    setResourceName('');
    setResourceUrl('');
  };

  const removeResource = (id: string) => {
    setResources(resources.filter(resource => resource.id !== id));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video file must be less than 100MB",
          variant: "destructive",
        });
        return;
      }
      setVideoFile(file);
    }
  };

  const uploadVideo = async () => {
    if (!videoFile) return;

    setIsUploading(true);
    setVideoUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setVideoUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);

    try {
      // In a production app with Supabase, we would upload the file here
      // For demo purposes, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a mock URL that would come from Supabase Storage
      const mockVideoUrl = `https://example.com/videos/${videoFile.name}`;
      
      // Update the form with the new video URL
      form.setValue("videoUrl", mockVideoUrl);

      clearInterval(interval);
      setVideoUploadProgress(100);
      
      toast({
        title: "Video uploaded successfully",
        description: "Your video file has been uploaded",
      });

      setTimeout(() => {
        setIsUploading(false);
        setVideoUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your video",
      });
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof lectureFormSchema>) => {
    try {
      // In a production app, this would be an API call to Supabase
      console.log("Submitting lecture data:", { ...values, resources, courseId });
      
      toast({
        title: "Lecture added",
        description: "Your lecture has been added to the course",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to add lecture:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add lecture to the course",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lecture Title</FormLabel>
              <FormControl>
                <Input placeholder="Introduction to React Hooks" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lecture Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide a detailed description of this lecture..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Content</FormLabel>
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-gray-500" />
                    <h3 className="text-sm font-medium">Upload Lecture Video</h3>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Input 
                          type="file" 
                          accept="video/*"
                          onChange={handleVideoChange}
                          disabled={isUploading}
                          className="max-w-md"
                        />
                        <Button 
                          type="button" 
                          onClick={uploadVideo} 
                          disabled={!videoFile || isUploading}
                          variant="outline"
                        >
                          <Upload className="mr-2" size={16} />
                          Upload
                        </Button>
                      </div>
                      
                      {isUploading && (
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-lms-indigo h-full transition-all duration-300"
                            style={{ width: `${videoUploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {videoFile && (
                        <p className="text-sm text-gray-600">
                          Selected file: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <FormLabel>Or provide a video URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://www.youtube.com/embed/your-video-id"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports YouTube embed URLs. For YouTube videos, use the embed URL format:
                    https://www.youtube.com/embed/VIDEO_ID
                  </p>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
                  placeholder="Resource URL"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                />
              </div>
            </div>
            <Button type="button" variant="outline" onClick={addResource}>
              Add Resource
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
                    <div>
                      <span className="font-medium">{resource.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({resource.type})
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeResource(resource.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Add Lecture</Button>
        </div>
      </form>
    </Form>
  );
};

export default LectureForm;
