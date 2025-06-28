import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import MedicalInterfaceCard from './MedicalInterfaceCard';

const Hero: React.FC = () => {
  const { theme } = useTheme();
  
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

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white to-medical-blue-50 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -bottom-16 -right-16 w-80 h-80 bg-medical-blue-300/30 dark:bg-medical-blue-700/20 rounded-full blur-3xl"
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
          className="absolute top-40 -left-20 w-80 h-80 bg-medical-green-300/20 dark:bg-medical-green-700/20 rounded-full blur-3xl"
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
              <span className="inline-block px-4 py-1.5 rounded-full bg-medical-blue-100 dark:bg-medical-blue-900/50 text-medical-blue-700 dark:text-medical-blue-300 font-medium text-sm mb-4">
                Next Generation Healthcare
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight dark:text-white">
                TIET Medi-Care
                <motion.span 
                  className="block text-medical-blue-600 dark:text-medical-blue-400"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  Redefining Healthcare
                </motion.span>
                <motion.span 
                  className="block"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  at Thapar Institute
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
                className="btn-primary dark:bg-medical-blue-600 dark:hover:bg-medical-blue-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.a>
              <motion.a 
                href="#appointments" 
                className="btn-outline dark:border-medical-blue-400 dark:text-medical-blue-400 dark:hover:bg-medical-blue-900/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Appointment
              </motion.a>
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
