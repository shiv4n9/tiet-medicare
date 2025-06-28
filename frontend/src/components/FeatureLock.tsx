import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface FeatureLockProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showLock?: boolean; // Whether to show the lock UI or just check auth
  onlyLockSubmit?: boolean; // Whether to render children and only lock submit actions
}

const FeatureLock: React.FC<FeatureLockProps> = ({ 
  children, 
  title = "Sign in Required", 
  description = "Please sign in to access this feature",
  showLock = true,
  onlyLockSubmit = false
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth');
  };

  // If user is authenticated, or we're only locking submits, render children
  if (isAuthenticated || onlyLockSubmit) {
    return <>{children}</>;
  }

  // If showLock is false, just return null (e.g., for hiding elements)
  if (!showLock) {
    return null;
  }

  // Otherwise, show the lock UI
  return (
    <motion.div 
      className="w-full h-full min-h-[300px] rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center p-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      <Button 
        onClick={handleSignIn}
        className="bg-medical-blue-600 hover:bg-medical-blue-700"
      >
        Sign In to Access
      </Button>
    </motion.div>
  );
};

export default FeatureLock;
