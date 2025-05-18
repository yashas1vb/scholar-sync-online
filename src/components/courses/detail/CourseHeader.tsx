
import React from 'react';
import { BookOpen, Users, Calendar, Clock } from 'lucide-react';
import { Course } from '@/context/CourseContext';

interface CourseHeaderProps {
  course: Course;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  const formattedDate = new Date(course.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-gradient-to-r from-lms-indigo to-lms-violet text-white py-12">
      <div className="container px-4 mx-auto">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <p className="text-lg opacity-90 mb-6 max-w-3xl">{course.description}</p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center text-white/80">
            <BookOpen size={18} className="mr-2" />
            <span>{course.lectures.length} lectures</span>
          </div>
          <div className="flex items-center text-white/80">
            <Users size={18} className="mr-2" />
            <span>{course.enrolledStudents.length} students</span>
          </div>
          <div className="flex items-center text-white/80">
            <Calendar size={18} className="mr-2" />
            <span>Created {formattedDate}</span>
          </div>
          <div className="flex items-center text-white/80">
            <Clock size={18} className="mr-2" />
            <span>Self-paced</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <img
            src={course.instructorId === '2' ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Instructor'}
            alt={course.instructorName}
            className="h-10 w-10 rounded-full mr-3"
          />
          <div>
            <p className="text-sm text-white/80">Instructor</p>
            <p className="font-medium">{course.instructorName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
