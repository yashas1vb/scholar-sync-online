
import React from 'react';
import { Course, Lecture } from '@/context/CourseContext';
import CourseHeader from './detail/CourseHeader';
import CourseContentTabs from './detail/CourseContentTabs';
import CourseEnrollmentBar from './detail/CourseEnrollmentBar';

interface CourseDetailProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: () => void;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  activeLecture?: Lecture | null;
  setActiveLecture?: (lecture: Lecture) => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({
  course,
  isEnrolled,
  onEnroll,
  onTabChange,
  activeTab = "content",
  activeLecture,
  setActiveLecture
}) => {
  return (
    <div className="flex flex-col">
      {/* Course Header */}
      <CourseHeader course={course} />
      
      {/* Course Content */}
      <div className="container px-4 mx-auto py-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-grow">
            <CourseContentTabs
              course={course}
              isEnrolled={isEnrolled}
              onEnroll={onEnroll}
              onTabChange={onTabChange}
              activeTab={activeTab}
              activeLecture={activeLecture}
              setActiveLecture={setActiveLecture}
            />
          </div>
          
          {/* Sidebar */}
          <div className="md:w-80 shrink-0">
            <CourseEnrollmentBar
              course={course}
              isEnrolled={isEnrolled}
              onEnroll={onEnroll}
              setActiveLecture={setActiveLecture}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
