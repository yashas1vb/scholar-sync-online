
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
import VideoUploader from './lecture/VideoUploader';
import ResourceManager, { Resource } from './lecture/ResourceManager';

const lectureFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  videoUrl: z.string().url({ message: "Please enter a valid video URL" }).or(z.string().length(0)),
});

interface LectureFormProps {
  courseId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LectureForm: React.FC<LectureFormProps> = ({ courseId, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);

  const form = useForm<z.infer<typeof lectureFormSchema>>({
    resolver: zodResolver(lectureFormSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
    },
  });

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
              <VideoUploader onChange={field.onChange} defaultValue={field.value} />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <ResourceManager 
          resources={resources} 
          onChange={setResources} 
        />
        
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
