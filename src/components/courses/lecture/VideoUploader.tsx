
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, Video, AlertCircle } from 'lucide-react';
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

  // Maximum file size: 500MB (increased from 100MB)
  const MAX_FILE_SIZE = 500 * 1024 * 1024;
  const MAX_FILE_SIZE_MB = 500;

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `Video file must be less than ${MAX_FILE_SIZE_MB}MB. Current file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid video file",
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
      
      // Start with initial progress
      setVideoUploadProgress(10);
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('course_videos')
        .upload(filePath, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      // Update progress to 100% when upload completes
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
        description: `Your video file (${(videoFile.size / (1024 * 1024)).toFixed(2)}MB) has been uploaded`,
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

  const getVideoDurationEstimate = (file: File) => {
    // Rough estimate: 1MB per minute for decent quality video
    const estimatedMinutes = Math.round(file.size / (1024 * 1024));
    return estimatedMinutes;
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Video className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-medium">Upload Lecture Video</h3>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Video Upload Specifications:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Maximum file size: {MAX_FILE_SIZE_MB}MB</li>
                <li>Supported formats: MP4, MOV, AVI, WebM</li>
                <li>Recommended resolution: 720p or 1080p</li>
                <li>For longer videos, consider using YouTube and embedding the link below</li>
              </ul>
            </div>
          </div>
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
              <div className="text-sm text-gray-600 space-y-1">
                <p>Selected file: <span className="font-medium">{videoFile.name}</span></p>
                <p>Size: <span className="font-medium">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span></p>
                <p>Estimated duration: <span className="font-medium">~{getVideoDurationEstimate(videoFile)} minutes</span></p>
              </div>
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
          Supports YouTube embed URLs, Vimeo, or direct video links. For YouTube videos, use the embed URL format:
          https://www.youtube.com/embed/VIDEO_ID
        </p>
      </div>
    </div>
  );
};

export default VideoUploader;
