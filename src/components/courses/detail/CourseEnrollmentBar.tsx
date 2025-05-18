
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { Course, Lecture } from '@/context/CourseContext';

interface CourseEnrollmentBarProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: () => void;
  setActiveLecture?: (lecture: Lecture) => void;
}

const CourseEnrollmentBar: React.FC<CourseEnrollmentBarProps> = ({ 
  course, 
  isEnrolled, 
  onEnroll,
  setActiveLecture 
}) => {
  return (
    <div className="bg-white border rounded-lg p-6 sticky top-24">
      {isEnrolled ? (
        <div className="text-center">
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Enrolled
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            You're enrolled in this course. Continue learning from where you left off.
          </p>
          <Button 
            className="w-full"
            onClick={() => {
              if (setActiveLecture && course.lectures.length > 0) {
                setActiveLecture(course.lectures[0]);
              }
            }}
          >
            Continue Learning
          </Button>
        </div>
      ) : (
        <div>
          <h3 className="text-2xl font-bold mb-4">Join This Course</h3>
          <p className="text-sm text-gray-600 mb-6">
            Enroll now to access all course materials, quizzes, and 
            participate in discussions.
          </p>
          <Button 
            size="lg" 
            onClick={onEnroll} 
            className="w-full mb-4"
          >
            Enroll Now
          </Button>
        </div>
      )}
      
      <div className="border-t mt-6 pt-6">
        <h4 className="font-semibold mb-3">This course includes:</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center">
            <BookOpen size={16} className="mr-2 text-gray-500" />
            <span>
              {course.lectures.length} lectures
            </span>
          </li>
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            <span>Downloadable resources</span>
          </li>
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
              <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
              <path d="M10 10.3c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2"/>
              <path d="M12 17h.01"/>
            </svg>
            <span>{course.quizzes.length} quizzes</span>
          </li>
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
              <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/>
              <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
            </svg>
            <span>Discussion forum</span>
          </li>
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
              <rect x="4" y="3" width="16" height="18" rx="2"/>
              <path d="M8 17h8"/>
              <path d="M8 13h4"/>
              <circle cx="9" cy="7" r="1"/>
              <circle cx="15" cy="7" r="1"/>
            </svg>
            <span>Certificate of completion</span>
          </li>
          <li className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
              <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/>
              <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
            </svg>
            <span>Live chat with instructor</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CourseEnrollmentBar;
