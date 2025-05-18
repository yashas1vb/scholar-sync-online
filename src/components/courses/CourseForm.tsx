
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
import { useAuth } from '@/context/AuthContext';
import { useCourses } from '@/context/CourseContext';

const courseFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters long" }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL" }).optional(),
});

interface CourseFormProps {
  onSuccess?: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { createCourse, isLoading } = useCourses();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
    },
  });

  const handleImageUrlChange = (url: string) => {
    if (url && url.trim()) {
      setPreviewImage(url);
    } else {
      setPreviewImage(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof courseFormSchema>) => {
    if (!user) return;

    try {
      // Set a default image URL if none is provided
      const imageUrl = values.imageUrl || 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
      
      await createCourse({
        title: values.title,
        description: values.description,
        imageUrl,
        instructorId: user.id,
        instructorName: user.name,
        lectures: [],
        quizzes: []
      });
      
      form.reset();
      setPreviewImage(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create course:", error);
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
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Introduction to Web Development" 
                  {...field} 
                />
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
              <FormLabel>Course Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide a detailed description of your course..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Image URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/image.jpg"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleImageUrlChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
              {previewImage && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
                  <img 
                    src={previewImage} 
                    alt="Course preview" 
                    className="w-full h-40 object-cover rounded-md"
                    onError={() => setPreviewImage(null)}
                  />
                </div>
              )}
            </FormItem>
          )}
        />
        
        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CourseForm;
