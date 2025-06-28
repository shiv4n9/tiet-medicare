
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap } from 'lucide-react';

const MedicalInterfaceCard: React.FC = () => {
  return (
    <motion.div 
      className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        type: "spring", 
        stiffness: 100 
      }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-medical-blue-600 via-medical-green-500 to-medical-blue-400 opacity-90" />
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div 
            key={i}
            className="absolute bg-white/20 rounded-full"
            style={{
              width: Math.random() * 50 + 10,
              height: Math.random() * 50 + 10,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-8 text-white text-center">
        <motion.div
          className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 10 
          }}
        >
          <Heart className="w-12 h-12 text-white" />
        </motion.div>
        
        <motion.h2 
          className="text-2xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Medical Care Interface
        </motion.h2>
        
        <motion.p
          className="text-white/80 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Your health is our priority. Experience seamless healthcare with cutting-edge technology.
        </motion.p>
        
        <motion.div
          className="flex justify-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <motion.button
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full flex items-center space-x-2 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-5 h-5" />
            <span>Get Started</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MedicalInterfaceCard;
