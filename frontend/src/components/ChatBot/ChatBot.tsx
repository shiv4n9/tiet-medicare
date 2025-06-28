
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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Store the chat state in local storage
  const [guestMessagesCount, setGuestMessagesCount] = useState(() => {
    const saved = localStorage.getItem('guestMessagesCount');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Maximum number of messages allowed for guest users
  const maxGuestMessages = 3;

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
        <DialogContent className="sm:max-w-[450px] h-[600px] flex flex-col p-0 overflow-hidden gap-0 border-medical-blue-200">
          <DialogHeader className="p-4 border-b bg-gradient-to-r from-medical-blue-50 to-medical-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-r from-medical-blue-100 to-medical-blue-200 rounded-full flex items-center justify-center mr-3"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 15, 0, -15, 0] }}
                  transition={{ duration: 1.5, delay: 0.5, repeat: 0, repeatType: "loop" }}
                >
                  <Bot className="h-5 w-5 text-medical-blue-600" />
                </motion.div>
                <div>
                  <DialogTitle className="text-xl font-bold">TIET Medi-Care Assistant</DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">
                    {isAuthenticated 
                      ? "Ask me anything about healthcare services" 
                      : `Guest access: ${maxGuestMessages - guestMessagesCount} messages remaining`}
                  </DialogDescription>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
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
