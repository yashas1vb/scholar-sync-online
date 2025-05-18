
import React, { useState } from 'react';
import { Course, Lecture } from '@/context/CourseContext';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, Download, Play, Lock } from 'lucide-react';

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

  return (
    <div>
      {/* Active Lecture View */}
      {activeLecture && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{activeLecture.title}</h2>
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden mb-6">
            <iframe 
              src={activeLecture.videoUrl} 
              title={activeLecture.title}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
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

      {/* Course Content List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Course Content</h3>
        <div className="border rounded-lg overflow-hidden">
          <Accordion type="multiple" className="w-full">
            {course.lectures.map((lecture, index) => {
              const isLocked = !isEnrolled && index > 0;
              const isActive = activeLecture?.id === lecture.id;
              
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
                        <div className="text-left">
                          <div className="font-medium">{lecture.title}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {lecture.resources.length} resources • Video lecture
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
