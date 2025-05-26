import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimitMinutes?: number;
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
  duration?: number;
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
  category: string;
}

interface CourseContextType {
  courses: Course[];
  isLoading: boolean;
  fetchCourses: () => Promise<void>;
  createCourse: (courseData: Partial<Course>) => Promise<Course>;
  updateCourse: (courseId: string, courseData: Partial<Course>) => Promise<Course>;
  deleteCourse: (courseId: string) => Promise<void>;
  enrollInCourse: (courseId: string, studentId: string) => Promise<void>;
  getInstructorCourses: (instructorId: string) => Course[];
  getEnrolledCourses: (studentId: string) => Course[];
  addLecture: (courseId: string, lectureData: Omit<Lecture, 'id'>) => Promise<Lecture>;
  updateLecture: (courseId: string, lectureId: string, lectureData: Partial<Lecture>) => Promise<Lecture>;
  deleteLecture: (courseId: string, lectureId: string) => Promise<void>;
  markVideoAsWatched: (videoId: string, studentId: string) => Promise<void>;
  getVideoProgress: (studentId: string) => Promise<Record<string, boolean>>;
  checkCourseCompletion: (courseId: string, studentId: string) => Promise<boolean>;
}

const defaultContext: CourseContextType = {
  courses: [],
  isLoading: false,
  fetchCourses: async () => {},
  createCourse: async () => ({ id: '', title: '', description: '', imageUrl: '', instructorId: '', instructorName: '', lectures: [], quizzes: [], enrolledStudents: [], createdAt: '', category: '' }),
  updateCourse: async () => ({ id: '', title: '', description: '', imageUrl: '', instructorId: '', instructorName: '', lectures: [], quizzes: [], enrolledStudents: [], createdAt: '', category: '' }),
  deleteCourse: async () => { },
  enrollInCourse: async () => { },
  getInstructorCourses: () => [],
  getEnrolledCourses: () => [],
  addLecture: async () => ({ id: '', title: '', description: '', videoUrl: '', resources: [] }),
  updateLecture: async () => ({ id: '', title: '', description: '', videoUrl: '', resources: [] }),
  deleteLecture: async () => { },
  markVideoAsWatched: async () => { },
  getVideoProgress: async (studentId: string) => ({}),
  checkCourseCompletion: async (courseId: string, studentId: string) => false,
};

const CourseContext = createContext<CourseContextType>(defaultContext);

export const useCourses = () => useContext(CourseContext);

interface CourseProviderProps {
  children: ReactNode;
}

export const CourseProvider = ({ children }: CourseProviderProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCourses = async () => {
    console.log('Fetching courses from Supabase...');
    setIsLoading(true);
    try {
      // Fetch courses with instructor profile data
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!courses_instructor_id_fkey(full_name)
        `);

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        throw coursesError;
      }

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id, student_id');

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        throw enrollmentsError;
      }

      // Fetch videos from storage bucket and match with course data
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('course_videos')
        .list('', {
          limit: 1000,
          offset: 0
        });

      if (storageError) {
        console.error('Error fetching videos from storage:', storageError);
      }

      console.log('Storage files:', storageFiles);

      // Fetch quizzes for all courses
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_questions(
            *,
            quiz_options(*)
          )
        `);

      if (quizzesError) {
        console.error('Error fetching quizzes:', quizzesError);
        throw quizzesError;
      }

      // Transform the data to match our Course interface
      const transformedCourses: Course[] = coursesData?.map(course => {
        // Get enrollments for this course
        const courseEnrollments = enrollmentsData?.filter(e => e.course_id === course.id) || [];
        const enrolledStudents = courseEnrollments.map(e => e.student_id);

        // Get videos for this course from storage
        const courseVideos = storageFiles?.filter(file => {
          // Check if the file belongs to this course's instructor
          return file.name.startsWith(course.instructor_id);
        }) || [];

        const lectures: Lecture[] = courseVideos.map((file, index) => {
          // Get public URL for the video
          const { data: publicUrl } = supabase.storage
            .from('course_videos')
            .getPublicUrl(file.name);

          return {
            id: file.name,
            title: `Lecture ${index + 1}`,
            description: `Video lecture for ${course.title}`,
            videoUrl: publicUrl.publicUrl,
            duration: undefined,
            resources: []
          };
        });

        // Get quizzes for this course
        const courseQuizzes = quizzesData?.filter(q => q.course_id === course.id) || [];
        const transformedQuizzes: Quiz[] = courseQuizzes.map(quiz => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description || '',
          passingScore: quiz.passing_score || 70,
          timeLimitMinutes: quiz.time_limit_minutes,
          questions: quiz.quiz_questions?.map(question => ({
            id: question.id,
            text: question.question_text,
            options: question.quiz_options?.map(option => option.option_text) || [],
            correctOptionIndex: question.quiz_options?.findIndex(option => option.is_correct) || 0
          })) || []
        }));

        return {
          id: course.id,
          title: course.title,
          description: course.description || '',
          imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
          instructorId: course.instructor_id,
          instructorName: course.instructor?.full_name || 'Unknown Instructor',
          lectures,
          quizzes: transformedQuizzes,
          enrolledStudents,
          createdAt: course.created_at,
          category: course.category || 'General'
        };
      }) || [];

      console.log('Transformed courses:', transformedCourses);
      setCourses(transformedCourses);
    } catch (error) {
      console.error('Error in fetchCourses:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch courses from database',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch courses when user changes or on mount
  useEffect(() => {
    fetchCourses();
  }, [user]);

  const createCourse = async (courseData: Partial<Course>): Promise<Course> => {
    setIsLoading(true);
    try {
      console.log('Creating course with data:', courseData);
      
      if (!user) {
        throw new Error('User must be logged in to create courses');
      }

      // Insert into Supabase
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description,
          category: courseData.category || 'General',
          instructor_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating course:', error);
        throw error;
      }

      console.log('Course created in database:', data);

      // Build the new course object for local state
      const newCourse: Course = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        imageUrl: courseData.imageUrl || 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        instructorId: data.instructor_id,
        instructorName: user.name,
        lectures: [],
        quizzes: [],
        enrolledStudents: [],
        createdAt: data.created_at,
        category: data.category || 'General',
      };

      setCourses(prev => [...prev, newCourse]);
      
      toast({
        title: 'Course created',
        description: 'Your course has been created successfully',
      });
      
      return newCourse;
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create course',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourse = async (courseId: string, courseData: Partial<Course>): Promise<Course> => {
    setIsLoading(true);
    try {
      // Update in Supabase
      const { data, error } = await supabase
        .from('courses')
        .update({
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
        })
        .eq('id', courseId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
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
      // Delete from Supabase
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        throw error;
      }

      // Update local state
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
      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .single();

      if (existingEnrollment) {
        throw new Error('Already enrolled in this course');
      }

      // Insert enrollment
      const { error } = await supabase
        .from('enrollments')
        .insert({
          course_id: courseId,
          student_id: studentId,
        });

      if (error) {
        throw error;
      }

      // Update local state
      const updatedCourses = courses.map(course => {
        if (course.id === courseId) {
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

  const markVideoAsWatched = async (videoId: string, studentId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('video_progress')
        .upsert({
          video_id: videoId,
          student_id: studentId,
          watched_seconds: 1, // Mark as completed
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error marking video as watched:', error);
      throw error;
    }
  };

  const getVideoProgress = async (studentId: string): Promise<Record<string, boolean>> => {
    try {
      const { data, error } = await supabase
        .from('video_progress')
        .select('video_id, watched_seconds')
        .eq('student_id', studentId);

      if (error) {
        throw error;
      }

      const progress: Record<string, boolean> = {};
      data?.forEach(item => {
        progress[item.video_id] = item.watched_seconds > 0;
      });

      return progress;
    } catch (error) {
      console.error('Error fetching video progress:', error);
      return {};
    }
  };

  const checkCourseCompletion = async (courseId: string, studentId: string): Promise<boolean> => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course || course.lectures.length === 0) return false;

      const progress = await getVideoProgress(studentId);
      const completedLectures = course.lectures.filter(lecture => progress[lecture.id]);
      
      return completedLectures.length === course.lectures.length;
    } catch (error) {
      console.error('Error checking course completion:', error);
      return false;
    }
  };

  // New methods for lecture management
  const addLecture = async (courseId: string, lectureData: Omit<Lecture, 'id'>): Promise<Lecture> => {
    setIsLoading(true);
    try {
      const newLecture: Lecture = {
        ...lectureData,
        id: Math.random().toString(36).substring(2, 9),
      };

      const updatedCourses = courses.map(course => {
        if (course.id === courseId) {
          return {
            ...course,
            lectures: [...course.lectures, newLecture]
          };
        }
        return course;
      });

      setCourses(updatedCourses);

      toast({
        title: "Lecture added",
        description: "The lecture has been added to your course",
      });

      return newLecture;
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add lecture",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLecture = async (courseId: string, lectureId: string, lectureData: Partial<Lecture>): Promise<Lecture> => {
    setIsLoading(true);
    try {
      let updatedLecture: Lecture | null = null;

      const updatedCourses = courses.map(course => {
        if (course.id === courseId) {
          const updatedLectures = course.lectures.map(lecture => {
            if (lecture.id === lectureId) {
              updatedLecture = { ...lecture, ...lectureData };
              return updatedLecture;
            }
            return lecture;
          });

          return {
            ...course,
            lectures: updatedLectures
          };
        }
        return course;
      });

      setCourses(updatedCourses);

      if (!updatedLecture) {
        throw new Error('Lecture not found');
      }

      toast({
        title: "Lecture updated",
        description: "The lecture has been updated",
      });

      return updatedLecture;
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update lecture",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLecture = async (courseId: string, lectureId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const updatedCourses = courses.map(course => {
        if (course.id === courseId) {
          return {
            ...course,
            lectures: course.lectures.filter(lecture => lecture.id !== lectureId)
          };
        }
        return course;
      });

      setCourses(updatedCourses);

      toast({
        title: "Lecture deleted",
        description: "The lecture has been deleted from your course",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete lecture",
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
        fetchCourses,
        createCourse,
        updateCourse,
        deleteCourse,
        enrollInCourse,
        getInstructorCourses,
        getEnrolledCourses,
        addLecture,
        updateLecture,
        deleteLecture,
        markVideoAsWatched,
        getVideoProgress,
        checkCourseCompletion
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
