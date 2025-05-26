
import React, { useState, useEffect } from 'react';
import { Course, Lecture } from '@/context/CourseContext';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, Download, Play, Lock, CheckCircle } from 'lucide-react';
import { useCourses } from '@/context/CourseContext';
import { useAuth } from '@/context/AuthContext';
import VideoPlayer from './VideoPlayer';

interface CourseContentProps {
  course: Course;
  isEnrolled: boolean;
  activeLecture: Lecture | null | undefined;
  setActiveLecture?: (lecture: Lecture) => void;
}

const CourseContent: React.FC<CourseContentProps> = ({
  course,
  isEnrolled,
  activeLecture,
  setActiveLecture
}) => {
  const [expandedLectureIds, setExpandedLectureIds] = useState<string[]>([]);
  const [videoProgress, setVideoProgress] = useState<Record<string, boolean>>({});
  const [courseCompleted, setCourseCompleted] = useState(false);
  
  const { getVideoProgress, checkCourseCompletion } = useCourses();
  const { user } = useAuth();

  useEffect(() => {
    if (user && isEnrolled) {
      loadVideoProgress();
    }
  }, [user, isEnrolled, course.id]);

  const loadVideoProgress = async () => {
    if (!user) return;
    
    try {
      const progress = await getVideoProgress(user.id);
      setVideoProgress(progress);
      
      const completed = await checkCourseCompletion(course.id, user.id);
      setCourseCompleted(completed);
    } catch (error) {
      console.error('Error loading video progress:', error);
    }
  };

  const toggleLectureExpanded = (lectureId: string) => {
    if (expandedLectureIds.includes(lectureId)) {
      setExpandedLectureIds(expandedLectureIds.filter(id => id !== lectureId));
    } else {
      setExpandedLectureIds([...expandedLectureIds, lectureId]);
    }
  };
  
  const handleSelectLecture = (lecture: Lecture) => {
    if (!isEnrolled && course.lectures.indexOf(lecture) > 0) {
      return; // Only allow the first lecture to be viewed in preview mode
    }
    
    if (setActiveLecture) {
      setActiveLecture(lecture);
    }
  };

  const handleVideoComplete = () => {
    loadVideoProgress(); // Refresh progress after completion
  };

  return (
    <div>
      {/* Active Lecture View */}
      {activeLecture && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{activeLecture.title}</h2>
          
          {isEnrolled ? (
            <VideoPlayer 
              lecture={activeLecture}
              onComplete={handleVideoComplete}
              isCompleted={videoProgress[activeLecture.id]}
            />
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
              {activeLecture.videoUrl ? (
                activeLecture.videoUrl.includes('youtube.com') || activeLecture.videoUrl.includes('youtu.be') ? (
                  <iframe 
                    src={activeLecture.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={activeLecture.title}
                  ></iframe>
                ) : (
                  <video 
                    src={activeLecture.videoUrl} 
                    controls 
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <p className="text-gray-500">No video available for this lecture</p>
                </div>
              )}
            </div>
          )}
          
          <div className="prose max-w-none">
            <p>{activeLecture.description}</p>
          </div>
          
          {activeLecture.resources.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Lecture Resources</h3>
              <div className="space-y-2">
                {activeLecture.resources.map(resource => (
                  <div 
                    key={resource.id} 
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md border"
                  >
                    <div className="flex items-center">
                      <FileText size={18} className="mr-2 text-lms-indigo" />
                      <span>{resource.name}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download size={16} className="mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Course Progress Summary */}
      {isEnrolled && course.lectures.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Course Progress</h3>
              <p className="text-sm text-blue-700">
                {Object.values(videoProgress).filter(Boolean).length} of {course.lectures.length} lectures completed
              </p>
            </div>
            {courseCompleted && (
              <div className="flex items-center text-green-600">
                <CheckCircle size={20} className="mr-2" />
                <span className="font-medium">Course Completed!</span>
              </div>
            )}
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(Object.values(videoProgress).filter(Boolean).length / course.lectures.length) * 100}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Course Content List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Course Content</h3>
        <div className="border rounded-lg overflow-hidden">
          <Accordion type="multiple" className="w-full">
            {course.lectures.map((lecture, index) => {
              const isLocked = !isEnrolled && index > 0;
              const isActive = activeLecture?.id === lecture.id;
              const isCompleted = videoProgress[lecture.id];
              
              return (
                <AccordionItem 
                  value={lecture.id} 
                  key={lecture.id}
                  className={`border-b last:border-0 ${isActive ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex">
                    <AccordionTrigger 
                      className="flex-grow py-4 px-4"
                      onClick={() => toggleLectureExpanded(lecture.id)}
                    >
                      <div className="flex items-center">
                        {isLocked && <Lock size={16} className="mr-2 text-gray-400" />}
                        {isCompleted && <CheckCircle size={16} className="mr-2 text-green-600" />}
                        <div className="text-left">
                          <div className="font-medium">{lecture.title}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {lecture.resources.length} resources • Video lecture
                            {isCompleted && <span className="ml-2 text-green-600">✓ Completed</span>}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <div className="flex items-center pr-4">
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={`${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isLocked && handleSelectLecture(lecture)}
                        disabled={isLocked}
                      >
                        <Play size={16} className="mr-1" />
                        {isActive ? "Playing" : "Play"}
                      </Button>
                    </div>
                  </div>
                  
                  <AccordionContent className="px-4 pb-4">
                    <div className="text-sm text-gray-600 mb-3">
                      {lecture.description}
                    </div>
                    {lecture.resources.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <h4 className="text-xs uppercase text-gray-500 font-semibold">Resources</h4>
                        {lecture.resources.map(resource => (
                          <div 
                            key={resource.id} 
                            className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-sm"
                          >
                            <div className="flex items-center">
                              <FileText size={14} className="mr-2 text-gray-500" />
                              <span>{resource.name}</span>
                            </div>
                            {isEnrolled && (
                              <Button variant="ghost" size="sm">
                                <Download size={14} className="mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default CourseContent;
