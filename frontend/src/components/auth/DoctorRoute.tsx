import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface DoctorRouteProps {
  children: React.ReactNode;
}

const DoctorRoute = ({ children }: DoctorRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default DoctorRoute; 