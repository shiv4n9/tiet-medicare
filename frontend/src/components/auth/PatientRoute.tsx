import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingPage } from '@/components/ui/loading-spinner';

interface PatientRouteProps {
  children: React.ReactNode;
}

const PatientRoute: React.FC<PatientRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== 'patient') {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (user?.role === 'doctor') {
      return <Navigate to="/doctor" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PatientRoute;