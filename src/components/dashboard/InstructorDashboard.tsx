
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCourses } from '@/context/CourseContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Users, PlusCircle, Edit, BarChart3, Grid, List } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CourseForm from '../courses/CourseForm';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const { getInstructorCourses } = useCourses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const instructorCourses = user ? getInstructorCourses(user.id) : [];

  // Mock stats data
  const dashboardStats = {
    totalStudents: instructorCourses.reduce((acc, course) => acc + course.enrolledStudents.length, 0),
    totalCourses: instructorCourses.length,
    totalLectures: instructorCourses.reduce((acc, course) => acc + course.lectures.length, 0),
    totalQuizzes: instructorCourses.reduce((acc, course) => acc + course.quizzes.length, 0),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your courses and students</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle size={16} className="mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <CourseForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{dashboardStats.totalStudents}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{dashboardStats.totalCourses}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Lectures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{dashboardStats.totalLectures}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">{dashboardStats.totalQuizzes}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Courses</h2>
        <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'ghost'} 
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'ghost'} 
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      {instructorCourses.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructorCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden flex flex-col">
                  <div className="relative">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      className="h-40 w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 w-full p-4">
                      <h3 className="text-white font-bold text-lg line-clamp-1">{course.title}</h3>
                    </div>
                  </div>
                  <CardContent className="py-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <div className="flex items-center">
                        <BookOpen size={14} className="mr-1" />
                        <span>{course.lectures.length} lectures</span>
                      </div>
                      <div className="flex items-center">
                        <Users size={14} className="mr-1" />
                        <span>{course.enrolledStudents.length} students</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <Link to={`/courses/${course.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Link to={`/courses/${course.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit size={14} className="mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link to={`/instructor/analytics/${course.id}`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 size={14} className="mr-1" />
                        Analytics
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {instructorCourses.map((course) => (
                <Card key={course.id}>
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-40 shrink-0">
                      <img 
                        src={course.imageUrl} 
                        alt={course.title}
                        className="h-full w-full object-cover md:rounded-l-lg"
                      />
                    </div>
                    <div className="flex-grow p-4">
                      <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <BookOpen size={14} className="mr-1" />
                            <span>{course.lectures.length} lectures</span>
                          </div>
                          <div className="flex items-center">
                            <Users size={14} className="mr-1" />
                            <span>{course.enrolledStudents.length} students</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link to={`/courses/${course.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          <Link to={`/courses/${course.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Link to={`/instructor/analytics/${course.id}`}>
                            <Button variant="outline" size="sm">
                              <BarChart3 size={14} className="mr-1" />
                              Analytics
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <BookOpen size={48} className="mx-auto text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first course to share your knowledge with students.
          </p>
          <Dialog onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">Create Your First Course</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <CourseForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
