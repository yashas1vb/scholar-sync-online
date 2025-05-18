
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useCourses } from '@/context/CourseContext';
import { BookOpen, CheckCircle, MessageSquare, Users } from 'lucide-react';
import CourseCard from '@/components/courses/CourseCard';

const Index = () => {
  const { courses } = useCourses();
  
  // Only show the 3 most recent courses on the homepage
  const featuredCourses = courses.slice(0, 3);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-lms-indigo to-lms-violet text-white py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
              Learn Without Limits
            </h1>
            <p className="text-xl mb-8 opacity-90 animate-fade-in">
              Discover, learn, and grow with ScholarSync. Access quality courses 
              taught by expert instructors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in">
              <Link to="/courses">
                <Button size="lg" className="bg-white text-lms-indigo hover:bg-gray-100">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Join for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured Courses</h2>
            <Link to="/courses" className="text-lms-indigo hover:underline">
              View all courses
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Benefits/Features */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose ScholarSync</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our comprehensive learning platform provides everything you need to succeed in your educational journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 hover:shadow-md rounded-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lms-indigo/10 text-lms-indigo mb-4">
                <BookOpen size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Content</h3>
              <p className="text-gray-600">
                Access high-quality courses with comprehensive learning materials.
              </p>
            </div>
            
            <div className="text-center p-6 hover:shadow-md rounded-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lms-blue/10 text-lms-blue mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Instructors</h3>
              <p className="text-gray-600">
                Learn from experienced professionals in various fields.
              </p>
            </div>
            
            <div className="text-center p-6 hover:shadow-md rounded-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lms-violet/10 text-lms-violet mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Interactive Learning</h3>
              <p className="text-gray-600">
                Engage through forums, quizzes, and direct instructor interaction.
              </p>
            </div>
            
            <div className="text-center p-6 hover:shadow-md rounded-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lms-emerald/10 text-lms-emerald mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Certificates</h3>
              <p className="text-gray-600">
                Earn certificates upon course completion to showcase your skills.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to start learning?</h2>
            <p className="text-gray-300 mb-8">
              Join thousands of students and instructors already on ScholarSync.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-lms-indigo hover:bg-lms-indigo/90">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
