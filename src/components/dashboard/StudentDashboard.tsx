
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCourses, Course } from '@/context/CourseContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, BookOpen, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { getEnrolledCourses } = useCourses();
  
  const enrolledCourses = user ? getEnrolledCourses(user.id) : [];
  
  // Mock data for student progress
  const courseProgress: Record<string, number> = {
    '1': 35, // 35% complete for course id '1'
  };
  
  const getProgress = (courseId: string) => {
    return courseProgress[courseId] || 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>

      {enrolledCourses.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-6">Your Enrolled Courses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden flex flex-col">
                <img 
                  src={course.imageUrl} 
                  alt={course.title}
                  className="h-40 w-full object-cover"
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>by {course.instructorName}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{getProgress(course.id)}%</span>
                    </div>
                    <Progress value={getProgress(course.id)} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <BookOpen size={14} className="mr-1" />
                      <span>{course.lectures.length} lectures</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle size={14} className="mr-1" />
                      <span>1/{course.quizzes.length} quizzes</span>
                    </div>
                  </div>
                  
                  <Link to={`/courses/${course.id}`}>
                    <Button className="w-full">Continue Learning</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-lms-indigo" />
                  Learning Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Completed Lectures</span>
                    <span className="font-medium">3/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Quizzes</span>
                    <span className="font-medium">1/2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hours Spent</span>
                    <span className="font-medium">4.5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-lms-indigo" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Award className="mr-2 h-5 w-5 text-lms-indigo" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-16 h-16 bg-lms-indigo/10 rounded-full flex items-center justify-center mb-2">
                    <Award size={28} className="text-lms-indigo" />
                  </div>
                  <p className="font-medium">First Course Enrolled</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <BookOpen size={48} className="mx-auto text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't enrolled in any courses yet. Start learning today!
          </p>
          <Link to="/courses">
            <Button size="lg">Browse Courses</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
