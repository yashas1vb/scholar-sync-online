
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { BookOpen, CheckCircle, Users, Award } from 'lucide-react';

const About = () => {
  return (
    <MainLayout>
      <div className="bg-gradient-to-r from-lms-indigo to-lms-violet text-white py-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">About ScholarSync</h1>
            <p className="text-xl opacity-90">
              Transforming education through technology
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 py-16 mx-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
          <p className="text-gray-600 mb-8">
            At ScholarSync, we believe that education should be accessible to everyone, 
            everywhere. Our mission is to create a platform that connects passionate 
            instructors with eager students, facilitating a seamless learning experience 
            that empowers individuals to achieve their personal and professional goals.
          </p>
          
          <h2 className="text-2xl font-bold mb-6">Our Story</h2>
          <p className="text-gray-600 mb-4">
            ScholarSync was founded in 2023 with a vision to revolutionize online learning. 
            Recognizing the challenges faced by both educators and learners in the digital 
            space, our team set out to build a comprehensive learning management system 
            that prioritizes user experience, engagement, and educational outcomes.
          </p>
          <p className="text-gray-600 mb-8">
            Since our inception, we've been dedicated to continuous improvement, 
            regularly updating our platform based on user feedback and the latest 
            educational research to ensure we're providing the best possible tools 
            for knowledge sharing.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto my-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lms-indigo/10 text-lms-indigo mb-4">
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-bold">50+</h3>
              <p className="text-gray-600">Courses</p>
            </div>
            
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lms-indigo/10 text-lms-indigo mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold">10,000+</h3>
              <p className="text-gray-600">Students</p>
            </div>
            
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lms-indigo/10 text-lms-indigo mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold">98%</h3>
              <p className="text-gray-600">Completion Rate</p>
            </div>
            
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lms-indigo/10 text-lms-indigo mb-4">
                <Award size={32} />
              </div>
              <h3 className="text-2xl font-bold">5,000+</h3>
              <p className="text-gray-600">Certificates Issued</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-bold text-lg mb-2">Accessibility</h3>
              <p className="text-gray-600">
                We believe education should be available to everyone, regardless of 
                location or background. We strive to make our platform accessible 
                across all devices and internet conditions.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-bold text-lg mb-2">Quality</h3>
              <p className="text-gray-600">
                We maintain high standards for our course content, ensuring that 
                learners receive accurate, up-to-date, and valuable information 
                that will help them succeed.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-bold text-lg mb-2">Innovation</h3>
              <p className="text-gray-600">
                We continuously explore new technologies and teaching methodologies 
                to enhance the learning experience and improve educational outcomes.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-bold text-lg mb-2">Community</h3>
              <p className="text-gray-600">
                We foster a supportive environment where students and instructors can 
                connect, collaborate, and grow together as a community of lifelong learners.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
