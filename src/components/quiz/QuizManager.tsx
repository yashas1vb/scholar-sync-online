
import React, { useState, useEffect } from 'react';
import { Course } from '@/context/CourseContext';
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit, Users, Clock, Target, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import QuizForm from './QuizForm';
import { supabase } from "@/integrations/supabase/client";

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passing_score: number;
  time_limit_minutes?: number;
  created_at: string;
  question_count?: number;
  attempt_count?: number;
}

interface QuizManagerProps {
  course: Course;
}

const QuizManager: React.FC<QuizManagerProps> = ({ course }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchQuizzes();
  }, [course.id]);
  
  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_questions(count),
          quiz_attempts(count)
        `)
        .eq('course_id', course.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedQuizzes = data.map(quiz => ({
        ...quiz,
        question_count: quiz.quiz_questions?.[0]?.count || 0,
        attempt_count: quiz.quiz_attempts?.[0]?.count || 0,
      }));
      
      setQuizzes(formattedQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load quizzes",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const addQuiz = async () => {
    setIsDialogOpen(false);
    await fetchQuizzes();
  };
  
  const deleteQuiz = async (quizId: string) => {
    if (window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      try {
        const { error } = await supabase
          .from('quizzes')
          .delete()
          .eq('id', quizId);
        
        if (error) throw error;
        
        setQuizzes(quizzes.filter(q => q.id !== quizId));
        
        toast({
          title: "Quiz deleted",
          description: "The quiz has been removed from your course",
        });
      } catch (error) {
        console.error("Failed to delete quiz:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete quiz",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Course Quizzes</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} className="mr-2" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <QuizForm 
              courseId={course.id} 
              onSuccess={addQuiz}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 size={40} className="mx-auto animate-spin text-gray-400" />
          <p className="mt-4 text-gray-500">Loading quizzes...</p>
        </div>
      ) : quizzes.length > 0 ? (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div 
              key={quiz.id} 
              className="border rounded-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <h4 className="font-medium text-lg">{quiz.title}</h4>
                {quiz.description && (
                  <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                  <div className="flex items-center">
                    <Target size={16} className="mr-1" />
                    <span>{quiz.question_count} questions</span>
                  </div>
                  <div className="flex items-center">
                    <Target size={16} className="mr-1" />
                    <span>{quiz.passing_score}% passing score</span>
                  </div>
                  {quiz.time_limit_minutes && (
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      <span>{quiz.time_limit_minutes} min limit</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    <span>{quiz.attempt_count} attempts</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteQuiz(quiz.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-md">
          <div className="mb-4">
            <Target size={40} className="mx-auto text-gray-400" />
          </div>
          <h4 className="text-lg font-medium mb-2">No quizzes yet</h4>
          <p className="text-gray-500 mb-4">Create your first quiz to assess student knowledge</p>
          <Dialog onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Your First Quiz</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
              </DialogHeader>
              <QuizForm 
                courseId={course.id} 
                onSuccess={addQuiz}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default QuizManager;
