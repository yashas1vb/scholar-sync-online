
import React, { useState, useEffect } from 'react';
import { Course } from '@/context/CourseContext';
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { Pencil, Plus, Trash2, FileUp, Video, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LectureForm from './LectureForm';
import { supabase } from "@/integrations/supabase/client";

interface Lecture {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  position: number;
  resources: any[];
  module_id?: string | null;
}

interface CourseLectureManagerProps {
  course: Course;
}

const CourseLectureManager: React.FC<CourseLectureManagerProps> = ({ course }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch lectures from Supabase
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        // For demonstration, we'll fetch all videos
        // In a real implementation, you would filter by module_id related to the course
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('position', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match our lecture interface
        const fetchedLectures = data.map(video => ({
          id: video.id,
          title: video.title,
          description: video.description,
          video_url: video.video_url,
          position: video.position,
          resources: [], // We would fetch resources in a real implementation
          module_id: video.module_id
        }));
        
        setLectures(fetchedLectures);
      } catch (error) {
        console.error('Error fetching lectures:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load lectures",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLectures();
  }, [toast]);
  
  const addLecture = async () => {
    setIsDialogOpen(false);
    // The lecture will be added via the LectureForm component
    // We'll refresh the list after a successful addition
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Transform the data to match our lecture interface
      const fetchedLectures = data.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        position: video.position,
        resources: [], // We would fetch resources in a real implementation
        module_id: video.module_id
      }));
      
      setLectures(fetchedLectures);
    } catch (error) {
      console.error('Error refreshing lectures:', error);
    }
  };
  
  const removeLecture = async (lectureId: string) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        const { error } = await supabase
          .from('videos')
          .delete()
          .eq('id', lectureId);
        
        if (error) {
          throw error;
        }
        
        setLectures(lectures.filter(l => l.id !== lectureId));
        
        toast({
          title: "Lecture removed",
          description: "The lecture has been removed from your course",
        });
      } catch (error) {
        console.error("Failed to remove lecture:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove lecture",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Course Lectures</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} className="mr-2" />
              Add Lecture
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Add New Lecture</DialogTitle>
            </DialogHeader>
            <LectureForm 
              courseId={course.id} 
              onSuccess={addLecture} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 size={40} className="mx-auto animate-spin text-gray-400" />
          <p className="mt-4 text-gray-500">Loading lectures...</p>
        </div>
      ) : lectures.length > 0 ? (
        <div className="space-y-3">
          {lectures.map((lecture) => (
            <div 
              key={lecture.id} 
              className="border rounded-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-md">
                  <Video size={20} className="text-gray-500" />
                </div>
                <div>
                  <h4 className="font-medium">{lecture.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {lecture.resources.length} resources
                    {lecture.video_url && <span className="ml-2">• Has video</span>}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Pencil size={16} className="mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeLecture(lecture.id)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
                <Button variant="outline" size="sm">
                  <FileUp size={16} className="mr-2" />
                  Resources
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-md">
          <div className="mb-4">
            <Video size={40} className="mx-auto text-gray-400" />
          </div>
          <h4 className="text-lg font-medium mb-2">No lectures yet</h4>
          <p className="text-gray-500 mb-4">Add your first lecture to this course</p>
          <Dialog onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Your First Lecture</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Add New Lecture</DialogTitle>
              </DialogHeader>
              <LectureForm 
                courseId={course.id} 
                onSuccess={addLecture} 
              />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default CourseLectureManager;
