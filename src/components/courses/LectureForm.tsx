
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

const lectureFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  videoUrl: z.string().url({ message: "Please enter a valid video URL" }),
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
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://www.youtube.com/embed/your-video-id"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-gray-500">
                Supports YouTube embed URLs. For YouTube videos, use the embed URL format:
                https://www.youtube.com/embed/VIDEO_ID
              </p>
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
