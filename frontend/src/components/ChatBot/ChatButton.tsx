
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 1 
      }}
      className="fixed bottom-6 right-6 z-50"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        className="rounded-full w-16 h-16 shadow-lg flex items-center justify-center bg-gradient-to-r from-medical-blue-500 to-medical-blue-700 hover:from-medical-blue-600 hover:to-medical-blue-800 transition-all duration-300"
        onClick={onClick}
        aria-label="Open AI assistant"
      >
        <MessageSquare className="w-7 h-7 text-white" />
        <span className={`absolute top-0 right-0 w-3 h-3 ${isAuthenticated ? 'bg-green-500' : 'bg-yellow-500'} rounded-full border-2 border-white`}></span>
        
        <motion.div 
          className="absolute -inset-1 rounded-full bg-medical-blue-400 opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      </Button>
    </motion.div>
  );
};

export default ChatButton;
