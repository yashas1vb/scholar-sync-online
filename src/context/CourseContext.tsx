
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";

export interface Quiz {
  id: string;
  title: string;
  questions: {
    id: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
  }[];
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  resources: {
    id: string;
    name: string;
    fileUrl: string;
    type: 'pdf' | 'assignment' | 'other';
  }[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  instructorId: string;
  instructorName: string;
  lectures: Lecture[];
  quizzes: Quiz[];
  enrolledStudents: string[];
  createdAt: string;
}

interface CourseContextType {
  courses: Course[];
  isLoading: boolean;
  createCourse: (courseData: Partial<Course>) => Promise<Course>;
  updateCourse: (courseId: string, courseData: Partial<Course>) => Promise<Course>;
  deleteCourse: (courseId: string) => Promise<void>;
  enrollInCourse: (courseId: string, studentId: string) => Promise<void>;
  getInstructorCourses: (instructorId: string) => Course[];
  getEnrolledCourses: (studentId: string) => Course[];
}

const defaultContext: CourseContextType = {
  courses: [],
  isLoading: false,
  createCourse: async () => ({ id: '', title: '', description: '', imageUrl: '', instructorId: '', instructorName: '', lectures: [], quizzes: [], enrolledStudents: [], createdAt: '' }),
  updateCourse: async () => ({ id: '', title: '', description: '', imageUrl: '', instructorId: '', instructorName: '', lectures: [], quizzes: [], enrolledStudents: [], createdAt: '' }),
  deleteCourse: async () => {},
  enrollInCourse: async () => {},
  getInstructorCourses: () => [],
  getEnrolledCourses: () => [],
};

const CourseContext = createContext<CourseContextType>(defaultContext);

export const useCourses = () => useContext(CourseContext);

interface CourseProviderProps {
  children: ReactNode;
}

export const CourseProvider = ({ children }: CourseProviderProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock courses data
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Introduction to Web Development',
      description: 'Learn the basics of HTML, CSS, and JavaScript to build modern websites.',
      imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      instructorId: '2',
      instructorName: 'Jane Instructor',
      lectures: [
        {
          id: '101',
          title: 'HTML Fundamentals',
          description: 'Learn the building blocks of web pages.',
          videoUrl: 'https://www.youtube.com/embed/qz0aGYrrlhU',
          resources: [
            {
              id: '201',
              name: 'HTML Cheatsheet',
              fileUrl: '#',
              type: 'pdf'
            },
            {
              id: '202',
              name: 'Practice Exercise',
              fileUrl: '#',
              type: 'assignment'
            }
          ]
        },
        {
          id: '102',
          title: 'CSS Styling',
          description: 'Make your websites beautiful with CSS.',
          videoUrl: 'https://www.youtube.com/embed/1PnVor36_40',
          resources: [
            {
              id: '203',
              name: 'CSS Reference',
              fileUrl: '#',
              type: 'pdf'
            }
          ]
        }
      ],
      quizzes: [
        {
          id: '301',
          title: 'HTML Basics Quiz',
          questions: [
            {
              id: '401',
              text: 'What does HTML stand for?',
              options: [
                'Hyper Text Markup Language',
                'Hyper Transfer Markup Language',
                'Home Tool Markup Language',
                'Hyperlink Text Management Language'
              ],
              correctOptionIndex: 0
            },
            {
              id: '402',
              text: 'Which HTML tag is used to create a paragraph?',
              options: ['<paragraph>', '<p>', '<para>', '<text>'],
              correctOptionIndex: 1
            }
          ]
        }
      ],
      enrolledStudents: ['1'],
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Advanced React Development',
      description: 'Master React hooks, context API, and performance optimization.',
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      instructorId: '2',
      instructorName: 'Jane Instructor',
      lectures: [
        {
          id: '103',
          title: 'React Hooks',
          description: 'Understand useState, useEffect, and custom hooks.',
          videoUrl: 'https://www.youtube.com/embed/TNhaISOUy6Q',
          resources: [
            {
              id: '204',
              name: 'Hooks Cheatsheet',
              fileUrl: '#',
              type: 'pdf'
            }
          ]
        }
      ],
      quizzes: [
        {
          id: '302',
          title: 'React Fundamentals',
          questions: [
            {
              id: '403',
              text: 'What hook would you use to store state in a functional component?',
              options: ['useStore', 'useState', 'useStateful', 'stateHook'],
              correctOptionIndex: 1
            }
          ]
        }
      ],
      enrolledStudents: [],
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Data Science Fundamentals',
      description: 'Introduction to data analysis, visualization, and machine learning basics.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      instructorId: '2',
      instructorName: 'Jane Instructor',
      lectures: [
        {
          id: '104',
          title: 'Introduction to Python for Data Science',
          description: 'Learn Python basics for data analysis.',
          videoUrl: 'https://www.youtube.com/embed/LHBE6Q9XlzI',
          resources: [
            {
              id: '205',
              name: 'Python Basics',
              fileUrl: '#',
              type: 'pdf'
            }
          ]
        }
      ],
      quizzes: [
        {
          id: '303',
          title: 'Python Basics',
          questions: [
            {
              id: '404',
              text: 'Which of the following is NOT a data type in Python?',
              options: ['Integer', 'Boolean', 'Character', 'Float'],
              correctOptionIndex: 2
            }
          ]
        }
      ],
      enrolledStudents: [],
      createdAt: new Date().toISOString()
    }
  ]);

  const createCourse = async (courseData: Partial<Course>): Promise<Course> => {
    setIsLoading(true);
    try {
      // In production, this would be a call to Supabase
      const newCourse: Course = {
        id: Math.random().toString(36).substring(2, 9),
        title: courseData.title || '',
        description: courseData.description || '',
        imageUrl: courseData.imageUrl || 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        instructorId: courseData.instructorId || '',
        instructorName: courseData.instructorName || '',
        lectures: courseData.lectures || [],
        quizzes: courseData.quizzes || [],
        enrolledStudents: [],
        createdAt: new Date().toISOString()
      };
      
      setCourses(prev => [...prev, newCourse]);
      
      toast({
        title: "Course created",
        description: "Your course has been created successfully",
      });
      
      return newCourse;
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create course",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourse = async (courseId: string, courseData: Partial<Course>): Promise<Course> => {
    setIsLoading(true);
    try {
      // In production, this would be a call to Supabase
      const updatedCourses = courses.map(course => {
        if (course.id === courseId) {
          return { ...course, ...courseData };
        }
        return course;
      });
      
      setCourses(updatedCourses);
      
      const updatedCourse = updatedCourses.find(course => course.id === courseId);
      
      if (!updatedCourse) {
        throw new Error('Course not found');
      }
      
      toast({
        title: "Course updated",
        description: "Your course has been updated successfully",
      });
      
      return updatedCourse;
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update course",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (courseId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // In production, this would be a call to Supabase
      setCourses(prev => prev.filter(course => course.id !== courseId));
      
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete course",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string, studentId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // In production, this would be a call to Supabase
      const updatedCourses = courses.map(course => {
        if (course.id === courseId) {
          if (course.enrolledStudents.includes(studentId)) {
            throw new Error('Already enrolled in this course');
          }
          return {
            ...course,
            enrolledStudents: [...course.enrolledStudents, studentId]
          };
        }
        return course;
      });
      
      setCourses(updatedCourses);
      
      toast({
        title: "Enrollment successful",
        description: "You have been enrolled in the course",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: error.message || "Failed to enroll in course",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getInstructorCourses = (instructorId: string): Course[] => {
    return courses.filter(course => course.instructorId === instructorId);
  };

  const getEnrolledCourses = (studentId: string): Course[] => {
    return courses.filter(course => course.enrolledStudents.includes(studentId));
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        isLoading,
        createCourse,
        updateCourse,
        deleteCourse,
        enrollInCourse,
        getInstructorCourses,
        getEnrolledCourses
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
