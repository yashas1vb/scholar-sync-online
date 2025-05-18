
import React, { useState, useEffect } from 'react';
import { Quiz as QuizType } from '@/context/CourseContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';

interface QuizTakerProps {
  quiz: QuizType;
  onComplete: (score: number, totalQuestions: number) => void;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(quiz.questions.length).fill(null)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(quiz.questions.length * 120); // 2 minutes per question

  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  // Timer effect
  useEffect(() => {
    if (isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isSubmitted]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    
    // Calculate score
    let correctAnswers = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      if (selectedAnswers[i] === quiz.questions[i].correctOptionIndex) {
        correctAnswers++;
      }
    }
    
    onComplete(correctAnswers, quiz.questions.length);
  };

  const isQuizComplete = !selectedAnswers.includes(null);

  return (
    <div className="max-w-3xl mx-auto">
      {isSubmitted ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-gray-600 mb-6">Your answers have been submitted.</p>
          <Button onClick={() => onComplete(0, 0)}>Return to Course</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            <div className="text-sm px-3 py-1 bg-gray-100 rounded-full">
              Time remaining: <span className="font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between">
            <div>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div className="text-sm text-gray-600">
              {selectedAnswers.filter(a => a !== null).length} of {quiz.questions.length} answered
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{currentQuestion.text}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={selectedAnswers[currentQuestionIndex]?.toString() || ""}
                onValueChange={(value) => handleAnswerSelect(parseInt(value, 10))}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-gray-50">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-grow">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                onClick={handlePrevious} 
                variant="outline" 
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <Button onClick={handleNext} disabled={selectedAnswers[currentQuestionIndex] === null}>
                  Next
                  <ArrowRight size={16} className="ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!isQuizComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Quiz
                </Button>
              )}
            </CardFooter>
          </Card>

          <div className="grid grid-cols-8 gap-2">
            {quiz.questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                size="sm"
                className={`
                  ${selectedAnswers[index] !== null ? "bg-gray-100" : ""}
                  ${index === currentQuestionIndex ? "ring-2 ring-offset-2 ring-lms-indigo" : ""}
                `}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          {!isQuizComplete && (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
              <AlertTriangle size={18} className="text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                You must answer all questions before submitting the quiz.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuizTaker;
