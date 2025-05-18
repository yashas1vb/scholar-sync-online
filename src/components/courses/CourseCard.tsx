
import React from 'react';
import { Course } from '@/context/CourseContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  showEnrollButton?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  isEnrolled = false,
  onEnroll,
  showEnrollButton = true
}) => {
  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      <div className="relative">
        <img 
          src={course.imageUrl} 
          alt={course.title} 
          className="h-48 w-full object-cover"
        />
        {isEnrolled && (
          <div className="absolute top-3 right-3">
            <span className="bg-lms-emerald text-white text-xs font-semibold px-2.5 py-1 rounded">
              Enrolled
            </span>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <h3 className="font-bold text-lg line-clamp-2">{course.title}</h3>
        <p className="text-gray-500 text-sm">by {course.instructorName}</p>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-gray-600 text-sm line-clamp-3">
          {course.description}
        </p>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex flex-col space-y-3">
        <div className="flex justify-between w-full text-sm text-gray-500">
          <div className="flex items-center">
            <BookOpen size={16} className="mr-1" />
            <span>{course.lectures.length} lectures</span>
          </div>
          <div className="flex items-center">
            <Users size={16} className="mr-1" />
            <span>{course.enrolledStudents.length} students</span>
          </div>
        </div>
        
        <div className="w-full">
          {showEnrollButton ? (
            isEnrolled ? (
              <Link to={`/courses/${course.id}`}>
                <Button className="w-full" variant="outline">
                  Continue Learning
                </Button>
              </Link>
            ) : (
              <Button 
                className="w-full" 
                onClick={onEnroll}
              >
                Enroll Now
              </Button>
            )
          ) : (
            <Link to={`/courses/${course.id}`}>
              <Button className="w-full">
                View Course
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
