
import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useCourses, Quiz } from '@/context/CourseContext';
import { useAuth } from '@/context/AuthContext';
import QuizTaker from '@/components/quiz/QuizTaker';
import Certificate from '@/components/certificates/Certificate';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CourseQuizPage = () => {
  const { courseId, quizId } = useParams<{ courseId: string, quizId: string }>();
  const { courses } = useCourses();
  const { user } = useAuth();
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  
  const course = courses.find(c => c.id === courseId);
  const quiz = course?.quizzes.find(q => q.id === quizId);
  
  if (!course || !quiz) {
    return <Navigate to="/courses" />;
  }
  
  const isEnrolled = user ? course.enrolledStudents.includes(user.id) : false;
  
  if (!isEnrolled) {
    return <Navigate to={`/courses/${courseId}`} />;
  }
  
  const handleQuizComplete = (correct: number, total: number) => {
    setScore({ correct, total });
    setIsCompleted(true);
  };
  
  const scorePercentage = Math.round((score.correct / score.total) * 100);
  const passingScore = 70;
  const hasPassed = scorePercentage >= passingScore;

  return (
    <MainLayout>
      <div className="container px-4 py-8 mx-auto">
        {!isCompleted ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <p className="text-gray-600 mt-1">
                {course.title}
              </p>
            </div>
            <QuizTaker 
              quiz={quiz} 
              onComplete={handleQuizComplete} 
            />
          </>
        ) : (
          <div>
            <div className="bg-white border rounded-lg p-8 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
                <p className="text-gray-600">
                  You've completed the {quiz.title}
                </p>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="w-40 h-40 rounded-full border-8 border-lms-indigo flex items-center justify-center">
                  <span className="text-3xl font-bold">{scorePercentage}%</span>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-lg">
                  You answered <span className="font-bold">{score.correct}</span> out of <span className="font-bold">{score.total}</span> questions correctly.
                </p>
                {hasPassed ? (
                  <p className="text-green-600 font-semibold mt-2">
                    Congratulations! You passed the quiz.
                  </p>
                ) : (
                  <p className="text-red-600 font-semibold mt-2">
                    You didn't pass this time. The passing score is {passingScore}%.
                  </p>
                )}
              </div>
              
              <div className="flex justify-center space-x-4">
                <Link to={`/courses/${courseId}`}>
                  <Button variant="outline">Back to Course</Button>
                </Link>
                {!hasPassed && (
                  <Link to={`/courses/${courseId}/quiz/${quizId}`}>
                    <Button onClick={() => setIsCompleted(false)}>Retry Quiz</Button>
                  </Link>
                )}
              </div>
            </div>
            
            {hasPassed && user && (
              <div>
                <h3 className="text-xl font-bold mb-4">Your Certificate</h3>
                <Certificate
                  studentName={user.name}
                  courseName={course.title}
                  instructorName={course.instructorName}
                  completionDate={new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CourseQuizPage;
