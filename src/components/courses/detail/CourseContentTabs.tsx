
import React from 'react';
import { Course, Lecture } from '@/context/CourseContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseContent from '@/components/courses/CourseContent';
import CourseDiscussion from '@/components/forum/CourseDiscussion';
import QuizList from '@/components/quiz/QuizList';
import CourseChat from '@/components/chat/CourseChat';

interface CourseContentTabsProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: () => void;
  onTabChange?: (tab: string) => void;
  activeTab: string;
  activeLecture?: Lecture | null;
  setActiveLecture?: (lecture: Lecture) => void;
}

const CourseContentTabs: React.FC<CourseContentTabsProps> = ({
  course,
  isEnrolled,
  onEnroll,
  onTabChange,
  activeTab,
  activeLecture,
  setActiveLecture,
}) => {
  return (
    <>
      {!isEnrolled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            This is a preview of this course. To access all content, 
            <Button 
              variant="link" 
              onClick={onEnroll} 
              className="px-1 text-lms-indigo"
            >
              enroll now
            </Button>.
          </p>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="content">Course Content</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-0">
          <CourseContent 
            course={course} 
            isEnrolled={isEnrolled} 
            activeLecture={activeLecture}
            setActiveLecture={setActiveLecture}
          />
        </TabsContent>
        
        <TabsContent value="discussion" className="mt-0">
          <CourseDiscussion 
            courseId={course.id} 
            isEnrolled={isEnrolled} 
          />
        </TabsContent>
        
        <TabsContent value="quizzes" className="mt-0">
          <QuizList 
            quizzes={course.quizzes} 
            courseId={course.id}
            isEnrolled={isEnrolled}
          />
        </TabsContent>
        
        <TabsContent value="chat" className="mt-0">
          {isEnrolled ? (
            <CourseChat 
              courseId={course.id} 
              instructorId={course.instructorId}
              instructorName={course.instructorName}
            />
          ) : (
            <div className="text-center p-12 border border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-2">Chat is available for enrolled students</h3>
              <p className="text-gray-500 mb-4">
                Enroll in this course to chat with the instructor and other students
              </p>
              <Button onClick={onEnroll}>Enroll Now</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default CourseContentTabs;
