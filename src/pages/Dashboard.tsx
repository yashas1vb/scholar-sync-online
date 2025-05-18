
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import InstructorDashboard from '@/components/dashboard/InstructorDashboard';

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-lms-indigo border-t-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <MainLayout>
      {user.role === 'student' ? (
        <StudentDashboard />
      ) : (
        <InstructorDashboard />
      )}
    </MainLayout>
  );
};

export default Dashboard;
