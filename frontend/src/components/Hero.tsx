import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, LayoutDashboard, Stethoscope, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import MedicalInterfaceCard from './MedicalInterfaceCard';
import FloatingMedicalIcons from './FloatingMedicalIcons';
import HeartbeatAnimation from './HeartbeatAnimation';

const Hero: React.FC = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Temporary debug log
  console.log('Hero Component - User data:', {
    isAuthenticated,
    user,
    userRole: user?.role,
    shouldShowDashboard: isAuthenticated && user?.role === 'admin'
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      const pulseElements = document.querySelectorAll('.hero-pulse');
      pulseElements.forEach(el => {
        (el as HTMLElement).style.transform = 'scale(1.1)';
        setTimeout(() => {
          (el as HTMLElement).style.transform = 'scale(1)';
        }, 500);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDashboardClick = () => {
    navigate('/admin');
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-medical-blue-50/30 to-medical-green-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingMedicalIcons />
        <HeartbeatAnimation />
        
        <motion.div 
          className="absolute -bottom-16 -right-16 w-80 h-80 bg-gradient-to-br from-medical-blue-300/30 to-medical-green-300/20 dark:from-medical-blue-700/20 dark:to-medical-green-700/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div 
          className="absolute top-40 -left-20 w-80 h-80 bg-gradient-to-br from-medical-green-300/20 to-medical-blue-300/20 dark:from-medical-green-700/20 dark:to-medical-blue-700/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 1,
          }}
        />
        
        {/* Additional gradient orbs */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-purple-300/10 to-pink-300/10 dark:from-purple-700/10 dark:to-pink-700/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [-50, 50, -50],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 0.5,
          }}
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-24 md:pt-32 md:pb-40">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <motion.span 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-medical-blue-100 to-medical-green-100 dark:from-medical-blue-900/50 dark:to-medical-green-900/50 text-medical-blue-700 dark:text-medical-blue-300 font-medium text-sm mb-4 border border-medical-blue-200 dark:border-medical-blue-800"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Sparkles className="w-4 h-4" />
                Next Generation Healthcare
              </motion.span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight dark:text-white">
                <motion.span
                  className="block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Your Health, Instantly Connected
                </motion.span>
                <motion.span 
                  className="block mt-2 bg-gradient-to-r from-medical-blue-600 via-medical-green-500 to-medical-blue-600 dark:from-medical-blue-400 dark:via-medical-green-400 dark:to-medical-blue-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  Smart, Secure & Human-Centric
                </motion.span>
                <motion.span 
                  className="block text-2xl md:text-3xl lg:text-4xl mt-2 text-gray-700 dark:text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  Healthcare at Thapar
                </motion.span>
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-10"
            >
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg">
                A secure, AI-driven healthcare platform with IoT integration, designed to provide students and staff with seamless medical services and emergency assistance.
              </p>
            </motion.div>
            
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.a 
                href="#features" 
                className="relative px-8 py-4 rounded-lg font-semibold text-white bg-gradient-to-r from-medical-blue-600 to-medical-green-500 hover:from-medical-blue-700 hover:to-medical-green-600 shadow-lg hover:shadow-xl transition-all overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Get Started
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-medical-green-500 to-medical-blue-600"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
              <motion.a 
                href="#appointments" 
                className="px-8 py-4 rounded-lg font-semibold border-2 border-medical-blue-600 text-medical-blue-600 hover:bg-medical-blue-50 dark:border-medical-blue-400 dark:text-medical-blue-400 dark:hover:bg-medical-blue-900/30 transition-all shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Appointment
              </motion.a>
              {isAuthenticated && user?.role === 'admin' && (
                <motion.button 
                  onClick={handleDashboardClick}
                  className="btn-outline bg-medical-green-600 hover:bg-medical-green-700 text-white border-medical-green-600 hover:border-medical-green-700 dark:bg-medical-green-600 dark:hover:bg-medical-green-700 dark:border-medical-green-600 dark:hover:border-medical-green-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </motion.button>
              )}
              {isAuthenticated && user?.role === 'doctor' && (
                <motion.button 
                  onClick={() => navigate('/doctor')}
                  className="btn-outline bg-medical-blue-600 hover:bg-medical-blue-700 text-white border-medical-blue-600 hover:border-medical-blue-700 dark:bg-medical-blue-600 dark:hover:bg-medical-blue-700 dark:border-medical-blue-600 dark:hover:border-medical-blue-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Doctor Dashboard
                </motion.button>
              )}
            </motion.div>
          </div>
          
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <MedicalInterfaceCard />
          </div>
        </div>
      </div>
      
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
        animate={{ 
          y: [0, 10, 0],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-sm text-gray-600 dark:text-gray-400 mb-2">Scroll Down</span>
        <ChevronDown className="w-5 h-5 text-medical-blue-500 dark:text-medical-blue-400" />
      </motion.div>
      
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
    </section>
  );
};

export default Hero;
