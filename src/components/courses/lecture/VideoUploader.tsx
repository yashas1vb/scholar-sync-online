
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, Video } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface VideoUploaderProps {
  onChange: (url: string) => void;
  defaultValue?: string;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onChange, defaultValue = '' }) => {
  const { toast } = useToast();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>(defaultValue);

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
    
    try {
      // Create a unique file path for the video
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Set up a progress tracking function
      const trackProgress = (progress: { loaded: number; total: number }) => {
        const calculatedProgress = (progress.loaded / progress.total) * 100;
        setVideoUploadProgress(calculatedProgress);
      };

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('course_videos')
        .upload(filePath, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      // Manually update progress to 100% when upload completes
      setVideoUploadProgress(100);

      if (error) {
        throw error;
      }

      // Get the public URL for the uploaded video
      const { data: publicUrlData } = supabase.storage
        .from('course_videos')
        .getPublicUrl(filePath);

      const videoPublicUrl = publicUrlData.publicUrl;
      
      setVideoUrl(videoPublicUrl);
      onChange(videoPublicUrl);
      
      toast({
        title: "Video uploaded successfully",
        description: "Your video file has been uploaded",
      });

      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your video",
      });
      setIsUploading(false);
      setVideoUploadProgress(0);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    onChange(e.target.value);
  };

  return (
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
            value={videoUrl}
            onChange={handleUrlChange}
          />
        </FormControl>
        <p className="text-xs text-gray-500 mt-1">
          Supports YouTube embed URLs. For YouTube videos, use the embed URL format:
          https://www.youtube.com/embed/VIDEO_ID
        </p>
      </div>
    </div>
  );
};

export default VideoUploader;
