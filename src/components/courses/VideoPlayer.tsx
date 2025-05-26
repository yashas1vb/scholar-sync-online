
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from 'lucide-react';
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
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { markVideoAsWatched } = useCourses();
  const { user } = useAuth();
  const { toast } = useToast();

  console.log('VideoPlayer rendering with lecture:', lecture);

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
      setIsLoading(false);
      console.log('Video metadata loaded, duration:', video.duration);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setVideoError(null);
      console.log('Video can play');
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
      const error = (e.target as HTMLVideoElement)?.error;
      setVideoError(error?.message || 'Failed to load video');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setVideoError(null);
      console.log('Video loading started');
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
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
      video.play().catch(error => {
        console.error('Error playing video:', error);
        setVideoError('Failed to play video');
      });
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

  // Check if it's a YouTube URL
  const isYouTubeUrl = lecture.videoUrl.includes('youtube.com') || lecture.videoUrl.includes('youtu.be');

  return (
    <div className="w-full">
      <div className="relative bg-black rounded-lg overflow-hidden">
        {isYouTubeUrl ? (
          <iframe 
            src={lecture.videoUrl}
            className="w-full aspect-video"
            allowFullScreen
            title={lecture.title}
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p>Loading video...</p>
                </div>
              </div>
            )}
            
            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
                <div className="text-center p-4">
                  <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                  <h3 className="text-lg font-semibold mb-2">Video Error</h3>
                  <p className="text-sm text-gray-300 mb-4">{videoError}</p>
                  <p className="text-xs text-gray-400">Video URL: {lecture.videoUrl}</p>
                </div>
              </div>
            )}

            <video 
              ref={videoRef}
              src={lecture.videoUrl} 
              className="w-full aspect-video"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              crossOrigin="anonymous"
              preload="metadata"
            />
            
            {/* Custom Video Controls */}
            {!videoError && (
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
                      disabled={isLoading}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                      disabled={isLoading}
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
                    disabled={isLoading}
                  >
                    <Maximize size={20} />
                  </Button>
                </div>
              </div>
            )}
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
        
        {watchedPercentage > 0 && !isYouTubeUrl && (
          <span className="text-sm text-gray-500">
            {Math.round(watchedPercentage)}% watched
          </span>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
