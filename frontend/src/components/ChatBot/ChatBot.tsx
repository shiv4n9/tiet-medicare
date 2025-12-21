
import React, { useState, useEffect } from 'react';
import ChatButton from './ChatButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ChatInterface from './ChatInterface';
import { Bot, X, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Store the chat state in local storage
  const [guestMessagesCount, setGuestMessagesCount] = useState(() => {
    const saved = localStorage.getItem('guestMessagesCount');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Maximum number of messages allowed for guest users
  const maxGuestMessages = 5;

  useEffect(() => {
    localStorage.setItem('guestMessagesCount', guestMessagesCount.toString());
  }, [guestMessagesCount]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleLogin = () => {
    setIsOpen(false);
    navigate('/auth');
  };

  // Function to increment guest message count
  const incrementGuestMessageCount = () => {
    setGuestMessagesCount(prev => prev + 1);
  };

  return (
    <>
      <ChatButton onClick={toggleChat} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[480px] h-[650px] flex flex-col p-0 overflow-hidden gap-0 border-2 border-medical-blue-200 shadow-2xl rounded-2xl">
          <DialogHeader className="p-5 border-b border-medical-blue-200/30 bg-gradient-to-r from-medical-blue-500 via-medical-blue-600 to-medical-green-500 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 right-8 w-16 h-16 bg-white rounded-full blur-xl"></div>
              <div className="absolute bottom-2 left-12 w-12 h-12 bg-white rounded-full blur-lg"></div>
              <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full blur-md animate-pulse"></div>
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 shadow-lg border border-white/20"
                  initial={{ rotate: 0, scale: 0.8 }}
                  animate={{ rotate: [0, 10, 0, -10, 0], scale: 1 }}
                  transition={{ duration: 3, delay: 0.5, repeat: Infinity, repeatType: "loop" }}
                >
                  <Bot className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white drop-shadow-sm flex items-center gap-2">
                    TIET Medi-Care Assistant
                    <motion.span 
                      className="inline-block w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </DialogTitle>
                  <DialogDescription className="text-sm text-white/90 font-medium">
                    {isAuthenticated 
                      ? `Hi ${user?.name?.split(' ')[0] || 'there'}! How can I help you today?` 
                      : `Guest mode • ${maxGuestMessages - guestMessagesCount} messages left`}
                  </DialogDescription>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/80 hover:text-white transition-colors focus:outline-none bg-white/10 hover:bg-white/20 rounded-full p-2 backdrop-blur-sm"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>
          
          <ChatInterface 
            isOpen={isOpen} 
            isAuthenticated={isAuthenticated} 
            guestMessagesCount={guestMessagesCount}
            incrementGuestMessageCount={incrementGuestMessageCount}
            onLoginRequest={handleLogin}
            maxGuestMessages={maxGuestMessages}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatBot;
