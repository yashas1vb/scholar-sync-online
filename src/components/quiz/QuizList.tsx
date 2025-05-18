
import React from 'react';
import { Quiz } from '@/context/CourseContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, HelpCircle } from 'lucide-react';

interface QuizListProps {
  quizzes: Quiz[];
  courseId: string;
  isEnrolled: boolean;
}

const QuizList: React.FC<QuizListProps> = ({ quizzes, courseId, isEnrolled }) => {
  const navigate = useNavigate();

  // Mock data for completed quizzes
  const completedQuizIds = ['301']; // Assuming quiz with id '301' is completed

  const handleStartQuiz = (quizId: string) => {
    navigate(`/courses/${courseId}/quiz/${quizId}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Course Quizzes</h2>
      
      {!isEnrolled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            You need to enroll in this course to take quizzes and track your progress.
          </p>
        </div>
      )}
      
      {quizzes.length > 0 ? (
        <div className="space-y-4">
          {quizzes.map(quiz => {
            const isCompleted = completedQuizIds.includes(quiz.id);
            
            return (
              <div 
                key={quiz.id} 
                className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      {quiz.title}
                      {isCompleted && (
                        <span className="ml-2 text-green-500">
                          <CheckCircle2 size={18} />
                        </span>
                      )}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <HelpCircle size={16} className="mr-1" />
                        <span>{quiz.questions.length} questions</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        <span>Est. time: {Math.max(5, quiz.questions.length * 2)} mins</span>
                      </div>
                    </div>
                    
                    {isCompleted && (
                      <div className="text-sm text-green-600 mb-4">
                        You scored 90% on this quiz
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Button 
                      onClick={() => handleStartQuiz(quiz.id)}
                      disabled={!isEnrolled}
                    >
                      {isCompleted ? "Retake Quiz" : "Start Quiz"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No quizzes available for this course yet.</p>
        </div>
      )}
    </div>
  );
};

export default QuizList;
