
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useCourses } from '@/context/CourseContext';
import CourseCard from '@/components/courses/CourseCard';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Search } from 'lucide-react';

const CoursesPage = () => {
  const { courses, enrollInCourse } = useCourses();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in before enrolling in courses",
        variant: "destructive",
      });
      return;
    }

    try {
      await enrollInCourse(courseId, user.id);
    } catch (error: any) {
      toast({
        title: "Enrollment failed",
        description: error.message || "An error occurred while enrolling in the course",
        variant: "destructive",
      });
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEnrolled = (courseId: string) => {
    return user ? courses.find(c => c.id === courseId)?.enrolledStudents.includes(user.id) : false;
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Courses</h1>
            <p className="text-gray-600 mb-8">
              Browse our comprehensive catalog of courses designed to help you achieve your learning goals.
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 mx-auto py-12">
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={isEnrolled(course.id)}
                onEnroll={() => handleEnroll(course.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-gray-600">
              We couldn't find any courses matching your search. Please try a different query.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CoursesPage;
