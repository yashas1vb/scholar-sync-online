
import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useCourses } from '@/context/CourseContext';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseForm from '@/components/courses/CourseForm';
import CourseLectureManager from '@/components/courses/CourseLectureManager';
import QuizManager from '@/components/quiz/QuizManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CourseEditPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { courses, updateCourse } = useCourses();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  
  const course = courses.find(c => c.id === courseId);
  
  if (!course) {
    return <Navigate to="/instructor-dashboard" />;
  }
  
  // Check if the current user is the instructor of this course
  if (!user || user.id !== course.instructorId) {
    return <Navigate to="/courses" />;
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Edit Course</h1>
            <p className="text-gray-600 mt-1">Make changes to your course</p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>
              Course ID: {course.id} • Created on {new Date(course.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="details">Course Details</TabsTrigger>
                <TabsTrigger value="lectures">Lectures</TabsTrigger>
                <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                <TabsTrigger value="chat">Live Chat</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <CourseForm onSuccess={() => {}} />
              </TabsContent>
              
              <TabsContent value="lectures">
                <CourseLectureManager course={course} />
              </TabsContent>
              
              <TabsContent value="quizzes">
                <QuizManager course={course} />
              </TabsContent>
              
              <TabsContent value="chat">
                <div className="text-center py-12">
                  <h4 className="text-lg font-medium mb-2">Course Live Chat</h4>
                  <p className="text-gray-500">Chat configuration and history will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CourseEditPage;
