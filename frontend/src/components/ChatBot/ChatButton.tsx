import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);

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
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.5,
      }}
      className="fixed bottom-6 right-6 z-40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip - positioned to the left of button */}
      <AnimatePresence>
        {(showTooltip || isHovered) && (
          <motion.div
            className="absolute right-16 top-1/2 -translate-y-1/2 mr-2"
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2 whitespace-nowrap">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">
                {showTooltip ? '👋 Need help?' : 'Health Assistant'}
              </span>
            </div>
            {/* Arrow pointing right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-white border-r border-t border-gray-100 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          className="relative rounded-full w-14 h-14 shadow-lg flex items-center justify-center bg-gradient-to-br from-medical-blue-500 to-medical-blue-600 hover:from-medical-blue-600 hover:to-medical-blue-700 transition-all duration-200 border-0"
          onClick={handleClick}
          aria-label="Open Health Assistant"
        >
          <MessageSquare className="w-6 h-6 text-white" />

          {/* Online status dot */}
          <span
            className={`absolute top-0 right-0 w-3.5 h-3.5 ${
              isAuthenticated ? 'bg-green-500' : 'bg-amber-500'
            } rounded-full border-2 border-white`}
          />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ChatButton;
