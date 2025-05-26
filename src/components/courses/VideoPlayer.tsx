
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Lecture } from '@/context/CourseContext';
import { useCourses } from '@/context/CourseContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface VideoPlayerProps {
  lecture: Lecture;
  onComplete?: () => void;
  isCompleted?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  lecture, 
  onComplete,
  isCompleted = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const [hasCompletedVideo, setHasCompletedVideo] = useState(isCompleted);
  
  const { markVideoAsWatched } = useCourses();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const percentage = (video.currentTime / video.duration) * 100;
      setWatchedPercentage(percentage);

      // Mark as completed when 90% watched
      if (percentage >= 90 && !hasCompletedVideo && user) {
        handleVideoCompletion();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [hasCompletedVideo, user]);

  const handleVideoCompletion = async () => {
    if (!user) return;

    try {
      await markVideoAsWatched(lecture.id, user.id);
      setHasCompletedVideo(true);
      onComplete?.();
      
      toast({
        title: "Lecture completed!",
        description: "Great job! You've completed this lecture.",
      });
    } catch (error) {
      console.error('Error marking video as watched:', error);
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    video.currentTime = newTime;
  };

  return (
    <div className="w-full">
      <div className="relative bg-black rounded-lg overflow-hidden">
        {lecture.videoUrl.includes('youtube.com') || lecture.videoUrl.includes('youtu.be') ? (
          <iframe 
            src={lecture.videoUrl}
            className="w-full aspect-video"
            allowFullScreen
            title={lecture.title}
          />
        ) : (
          <>
            <video 
              ref={videoRef}
              src={lecture.videoUrl} 
              className="w-full aspect-video"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Custom Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div 
                className="w-full h-2 bg-white/20 rounded-full mb-3 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </Button>
                  
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize size={20} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Completion Status */}
      <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Checkbox 
            checked={hasCompletedVideo} 
            disabled 
            className="data-[state=checked]:bg-green-600"
          />
          <span className={`text-sm ${hasCompletedVideo ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
            {hasCompletedVideo ? 'Completed' : 'Mark as complete by watching 90%'}
          </span>
        </div>
        
        {watchedPercentage > 0 && (
          <span className="text-sm text-gray-500">
            {Math.round(watchedPercentage)}% watched
          </span>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
