import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  Users, 
  Stethoscope, 
  Shield, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Heart,
  AlertTriangle,
  FileText,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const QuickNavigation: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) return null;

  const navigationItems = [
    {
      label: 'Home',
      icon: Home,
      path: '/',
      color: 'text-gray-600 hover:text-medical-blue-600',
      bgColor: 'hover:bg-medical-blue-50'
    },
    // Only show My Appointments for non-doctor users
    ...(user?.role !== 'doctor' ? [{
      label: 'My Appointments',
      icon: Calendar,
      path: '/my-appointments',
      color: 'text-gray-600 hover:text-medical-green-600',
      bgColor: 'hover:bg-medical-green-50'
    }] : []),
    {
      label: 'Profile',
      icon: User,
      path: '/profile',
      color: 'text-gray-600 hover:text-medical-purple-600',
      bgColor: 'hover:bg-medical-purple-50'
    }
  ];

  // Add role-specific navigation items
  if (user?.role === 'admin') {
    navigationItems.push(
      {
        label: 'Admin Dashboard',
        icon: Shield,
        path: '/admin',
        color: 'text-gray-600 hover:text-red-600',
        bgColor: 'hover:bg-red-50'
      },
      {
        label: 'Doctor View',
        icon: Stethoscope,
        path: '/doctor',
        color: 'text-gray-600 hover:text-medical-blue-600',
        bgColor: 'hover:bg-medical-blue-50'
      },
      {
        label: 'Patient View',
        icon: Heart,
        path: '/patient',
        color: 'text-gray-600 hover:text-medical-green-600',
        bgColor: 'hover:bg-medical-green-50'
      }
    );
  } else if (user?.role === 'doctor') {
    navigationItems.push(
      {
        label: 'Doctor Dashboard',
        icon: Stethoscope,
        path: '/doctor',
        color: 'text-gray-600 hover:text-medical-blue-600',
        bgColor: 'hover:bg-medical-blue-50'
      }
    );
  } else if (user?.role === 'patient') {
    navigationItems.push(
      {
        label: 'Patient Dashboard',
        icon: Heart,
        path: '/patient',
        color: 'text-gray-600 hover:text-medical-green-600',
        bgColor: 'hover:bg-medical-green-50'
      },
      {
        label: 'Emergency',
        icon: AlertTriangle,
        path: '/#emergency',
        color: 'text-gray-600 hover:text-red-600',
        bgColor: 'hover:bg-red-50'
      }
    );
  }

  const handleNavigation = (path: string) => {
    if (path.includes('#')) {
      // Handle anchor links
      const [route, anchor] = path.split('#');
      navigate(route || '/');
      setTimeout(() => {
        const element = document.getElementById(anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Quick Navigation Button */}
      <motion.div
        className="fixed bottom-24 right-4 z-[9998]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-medical-blue-600 hover:bg-medical-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </motion.div>

      {/* Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9990]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Navigation Panel */}
            <motion.div
              className="fixed bottom-[10.5rem] right-4 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[9998] overflow-hidden"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-medical-blue-50 to-medical-green-50 dark:from-medical-blue-900/20 dark:to-medical-green-900/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-medical-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className="text-xs bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                        {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                      </Badge>
                      {user?.specialization && (
                        <Badge className="text-xs bg-medical-green-100 text-medical-green-800 dark:bg-medical-green-900 dark:text-medical-green-200">
                          {user.specialization}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="p-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${item.color} ${item.bgColor} dark:hover:bg-gray-700`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}

                {/* Divider */}
                <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

                {/* Settings */}
                <motion.button
                  onClick={() => handleNavigation('/profile')}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navigationItems.length * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </motion.button>

                {/* Logout */}
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 dark:hover:text-red-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navigationItems.length + 1) * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickNavigation;