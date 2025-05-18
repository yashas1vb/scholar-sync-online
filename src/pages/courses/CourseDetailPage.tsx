
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useCourses, Lecture } from '@/context/CourseContext';
import { useAuth } from '@/context/AuthContext';
import CourseDetail from '@/components/courses/CourseDetail';
import { useToast } from '@/components/ui/use-toast';

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { courses, enrollInCourse } = useCourses();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('content');
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  
  const course = courses.find(c => c.id === courseId);
  
  useEffect(() => {
    // Set the first lecture as active by default
    if (course && course.lectures.length > 0 && !activeLecture) {
      setActiveLecture(course.lectures[0]);
    }
  }, [course]);
  
  if (!course) {
    return <Navigate to="/courses" />;
  }
  
  const isEnrolled = user ? course.enrolledStudents.includes(user.id) : false;
  
  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in before enrolling in courses",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      await enrollInCourse(courseId!, user.id);
      toast({
        title: "Enrolled Successfully",
        description: `You are now enrolled in ${course.title}`,
      });
    } catch (error: any) {
      toast({
        title: "Enrollment failed",
        description: error.message || "An error occurred while enrolling in the course",
        variant: "destructive",
      });
    }
  };
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <MainLayout>
      <CourseDetail
        course={course}
        isEnrolled={isEnrolled}
        onEnroll={handleEnroll}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeLecture={activeLecture}
        setActiveLecture={setActiveLecture}
      />
    </MainLayout>
  );
};

export default CourseDetailPage;
