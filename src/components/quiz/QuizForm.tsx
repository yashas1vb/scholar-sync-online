
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2 } from 'lucide-react';

const quizFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().optional(),
  passingScore: z.number().min(1).max(100).default(70),
  timeLimitMinutes: z.number().optional(),
});

interface Question {
  id: string;
  text: string;
  options: { text: string; isCorrect: boolean }[];
}

interface QuizFormProps {
  courseId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ courseId, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof quizFormSchema>>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: "",
      description: "",
      passingScore: 70,
      timeLimitMinutes: undefined,
    },
  });

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substring(2, 9),
      text: "",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, text } : q
    ));
  };

  const updateOption = (questionId: string, optionIndex: number, text: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: q.options.map((opt, idx) => 
              idx === optionIndex ? { ...opt, text } : opt
            )
          }
        : q
    ));
  };

  const setCorrectOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: q.options.map((opt, idx) => 
              ({ ...opt, isCorrect: idx === optionIndex })
            )
          }
        : q
    ));
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const onSubmit = async (values: z.infer<typeof quizFormSchema>) => {
    if (questions.length === 0) {
      toast({
        variant: "destructive",
        title: "No questions",
        description: "Please add at least one question to the quiz",
      });
      return;
    }

    // Validate that all questions have text and at least one correct answer
    const invalidQuestions = questions.filter(q => 
      !q.text.trim() || !q.options.some(opt => opt.isCorrect && opt.text.trim())
    );

    if (invalidQuestions.length > 0) {
      toast({
        variant: "destructive",
        title: "Invalid questions",
        description: "All questions must have text and at least one correct answer",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create the quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert([
          {
            course_id: courseId,
            title: values.title,
            description: values.description,
            passing_score: values.passingScore,
            time_limit_minutes: values.timeLimitMinutes,
          }
        ])
        .select()
        .single();

      if (quizError) throw quizError;

      // Create questions and options
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .insert([
            {
              quiz_id: quiz.id,
              question_text: question.text,
              position: i,
            }
          ])
          .select()
          .single();

        if (questionError) throw questionError;

        // Create options for this question
        const optionsToInsert = question.options
          .filter(opt => opt.text.trim())
          .map((option, idx) => ({
            question_id: questionData.id,
            option_text: option.text,
            is_correct: option.isCorrect,
            position: idx,
          }));

        if (optionsToInsert.length > 0) {
          const { error: optionsError } = await supabase
            .from('quiz_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }
      }
      
      toast({
        title: "Quiz created",
        description: "Your quiz has been created successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create quiz:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create quiz",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quiz Title</FormLabel>
                <FormControl>
                  <Input placeholder="Final Assessment Quiz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Test your knowledge of the course material..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="passingScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passing Score (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="100" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="timeLimitMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Limit (minutes, optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      placeholder="No time limit"
                      {...field} 
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Button type="button" onClick={addQuestion} variant="outline">
                <Plus size={16} className="mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, questionIndex) => (
              <div key={question.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Question {questionIndex + 1}</h4>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                
                <Input
                  placeholder="Enter your question here..."
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, e.target.value)}
                />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Answer Options:</p>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={option.isCorrect}
                        onChange={() => setCorrectOption(question.id, optionIndex)}
                      />
                      <Input
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option.text}
                        onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  ))}
                  <p className="text-xs text-gray-500">Select the radio button next to the correct answer</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Quiz..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default QuizForm;
