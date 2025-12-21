
import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  const { isAuthenticated } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Show tooltip after 3 seconds if user hasn't interacted
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setShowTooltip(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  // Hide tooltip after 5 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const handleClick = () => {
    setHasInteracted(true);
    setShowTooltip(false);
    onClick();
  };
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 100 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 1 
      }}
      className="fixed bottom-6 right-28 z-45"
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="relative">
        {/* Pulsing background rings */}
        <motion.div 
          className="absolute -inset-2 rounded-full bg-gradient-to-r from-medical-blue-400 to-medical-green-400 opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.1, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
        <motion.div 
          className="absolute -inset-1 rounded-full bg-gradient-to-r from-medical-blue-500 to-medical-green-500 opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.15, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            delay: 0.5
          }}
        />
        
        <Button
          className="rounded-full w-16 h-16 shadow-2xl flex items-center justify-center bg-gradient-to-br from-medical-blue-500 via-medical-blue-600 to-medical-green-500 hover:from-medical-blue-600 hover:via-medical-blue-700 hover:to-medical-green-600 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm"
          onClick={handleClick}
          aria-label="Open AI Health Assistant"
        >
          <MessageSquare className="w-7 h-7 text-white drop-shadow-sm" />
          
          {/* Status indicator */}
          <motion.span 
            className={`absolute -top-1 -right-1 w-4 h-4 ${isAuthenticated ? 'bg-green-400' : 'bg-amber-400'} rounded-full border-2 border-white shadow-lg`}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
          
          {/* Sparkle effect */}
          <motion.div
            className="absolute -top-2 -left-2"
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </motion.div>
        </Button>
        
        {/* Animated tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              className="absolute -left-48 top-1/2 transform -translate-y-1/2 bg-white px-4 py-3 rounded-2xl shadow-xl border border-medical-blue-100 w-44"
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">👋</span>
                <span className="font-semibold text-medical-blue-700 text-sm">Need help?</span>
              </div>
              <p className="text-xs text-gray-600">
                Ask me about health, wellness, or book appointments!
              </p>
              {/* Arrow */}
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-t border-medical-blue-100"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static label */}
        {!showTooltip && (
          <motion.div
            className="absolute -left-36 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-medical-blue-200 text-xs font-medium text-medical-blue-700 flex items-center gap-1.5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Health Assistant
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatButton;
