
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import InstructorDashboard from '@/components/dashboard/InstructorDashboard';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const InstructorDashboardPage = () => {
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

  if (user.role !== 'instructor') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <MainLayout>
      <InstructorDashboard />
    </MainLayout>
  );
};

export default InstructorDashboardPage;
