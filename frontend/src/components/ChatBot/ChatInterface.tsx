
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Clock, Calendar, AlertCircle, Heart, HelpCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  guestMessagesCount: number;
  incrementGuestMessageCount: () => void;
  onLoginRequest: () => void;
  maxGuestMessages: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  isOpen, 
  isAuthenticated, 
  guestMessagesCount, 
  incrementGuestMessageCount,
  onLoginRequest,
  maxGuestMessages
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [
      {
        id: '1',
        text: 'Hello! I\'m your TIET Medi-Care assistant. How can I help you today?',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);
  
  const getTimeString = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() === '') return;
    
    // Check if non-authenticated user has reached the message limit
    if (!isAuthenticated && guestMessagesCount >= maxGuestMessages) {
      return;
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: getTimeString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // Increment guest message count if user is not authenticated
    if (!isAuthenticated) {
      incrementGuestMessageCount();
    }
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      setIsTyping(false);
      
      // If this was the last allowed message for guest users
      if (!isAuthenticated && guestMessagesCount + 1 >= maxGuestMessages) {
        const limitMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "You've reached the limit for guest access. Sign in to continue our conversation and access all features.",
          isUser: false,
          timestamp: getTimeString(),
        };
        setMessages(prev => [...prev, limitMessage]);
      } else {
        // Regular response
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getBotResponse(input),
          isUser: false,
          timestamp: getTimeString(),
        };
        setMessages(prev => [...prev, responseMessage]);
      }
    }, 1500);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('appointment') || input.includes('book') || input.includes('doctor')) {
      return 'You can book an appointment through our appointment section. Would you like me to help you schedule one now? Our next available slot is tomorrow at 10:30 AM.';
    } else if (input.includes('emergency')) {
      return 'For emergencies, please use our emergency tracking feature or call our helpline at +91-175-239-3000 immediately. Our medical team is available 24/7.';
    } else if (input.includes('mental health') || input.includes('stress') || input.includes('anxiety')) {
      return 'We offer various mental health resources and counseling services. Our counselors are available Monday-Friday from 9 AM to 5 PM. Would you like me to connect you with a counselor?';
    } else if (input.includes('hello') || input.includes('hi')) {
      return 'Hello! How can I assist you with TIET Medi-Care services today? You can ask about appointments, emergency services, or mental health support.';
    } else if (input.includes('contact') || input.includes('phone') || input.includes('call')) {
      return 'You can reach TIET Medi-Care at +91-175-239-3000 or email us at medicare@thapar.edu. Our office hours are Monday to Friday, 8 AM to 6 PM.';
    } else if (input.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with today?';
    } else {
      return 'I\'m here to help with appointments, emergencies, mental health support, and general information about TIET Medi-Care. Could you please provide more details about your query?';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default action which might cause page reload
    
    // Check if non-authenticated user has reached the message limit
    if (!isAuthenticated && guestMessagesCount >= maxGuestMessages) {
      return;
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: suggestion,
      isUser: true,
      timestamp: getTimeString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Increment guest message count if user is not authenticated
    if (!isAuthenticated) {
      incrementGuestMessageCount();
    }
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      setIsTyping(false);
      
      // If this was the last allowed message for guest users
      if (!isAuthenticated && guestMessagesCount + 1 >= maxGuestMessages) {
        const limitMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "You've reached the limit for guest access. Sign in to continue our conversation and access all features.",
          isUser: false,
          timestamp: getTimeString(),
        };
        setMessages(prev => [...prev, limitMessage]);
      } else {
        // Regular response
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getBotResponse(suggestion),
          isUser: false,
          timestamp: getTimeString(),
        };
        setMessages(prev => [...prev, responseMessage]);
      }
    }, 1500);
  };

  const clearChat = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any navigation
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your TIET Medi-Care assistant. How can I help you today?',
        isUser: false,
        timestamp: getTimeString(),
      },
    ]);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md">
      {/* Chat messages area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <div
                className={`flex max-w-[80%] items-start ${
                  message.isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className={`w-8 h-8 ${message.isUser ? 'ml-2' : 'mr-2'} transition-all duration-300 hover:scale-110`}>
                  <AvatarFallback className={`${message.isUser 
                    ? 'bg-gradient-to-r from-medical-blue-100 to-medical-blue-200 text-medical-blue-600' 
                    : 'bg-gradient-to-r from-medical-green-100 to-medical-green-200 text-medical-green-600'}`}
                  >
                    {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <motion.div
                    className={`rounded-2xl p-3 shadow-sm ${
                      message.isUser
                        ? 'bg-gradient-to-r from-medical-blue-500 to-medical-blue-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {message.text}
                  </motion.div>
                  <div className={`text-xs mt-1 text-gray-500 ${message.isUser ? 'text-right' : 'text-left'}`}>
                    {message.timestamp}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start">
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarFallback className="bg-gradient-to-r from-medical-green-100 to-medical-green-200 text-medical-green-600">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl p-3 shadow-sm bg-white text-gray-800 border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-medical-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-medical-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-2 h-2 bg-medical-blue-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Message limit alert for non-authenticated users */}
        {!isAuthenticated && (
          <div className="px-3 py-2 mb-2">
            <Alert className="bg-blue-50 border-blue-100">
              <Lock className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-sm font-semibold text-blue-700">Limited access mode</AlertTitle>
              <AlertDescription className="text-xs text-blue-600">
                You have {maxGuestMessages - guestMessagesCount} message{maxGuestMessages - guestMessagesCount !== 1 ? 's' : ''} remaining. 
                <Button 
                  variant="link" 
                  className="text-xs p-0 h-auto text-medical-blue-600 hover:text-medical-blue-700 font-semibold" 
                  onClick={(e) => {
                    e.preventDefault();
                    onLoginRequest();
                  }}
                >
                  Sign in for unlimited access
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick actions above input */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-500 flex items-center">
            <HelpCircle className="w-3 h-3 mr-1" /> 
            <span>Ask about services or type a question</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearChat} 
            className="text-xs text-gray-500 hover:text-red-500"
          >
            Clear chat
          </Button>
        </div>
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-md">
        {/* Show input only if user has remaining messages or is authenticated */}
        {(isAuthenticated || guestMessagesCount < maxGuestMessages) ? (
          <>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-grow bg-gray-50 border-gray-200 focus:ring-medical-blue-400 rounded-full px-4 shadow-sm transition-all duration-300 focus:shadow-md"
              />
              <Button 
                type="submit"
                size="icon"
                className="rounded-full bg-medical-blue-600 hover:bg-medical-blue-700 transition-all transform hover:scale-105 shadow-sm"
                disabled={input.trim() === ''}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex justify-center mt-3">
              <div className="flex flex-wrap justify-center gap-2 w-full">
                <motion.button 
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center text-xs text-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleSuggestionClick("Book an appointment", e)}
                >
                  <Calendar className="w-3 h-3 mr-1" /> Appointments
                </motion.button>
                <motion.button 
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center text-xs text-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleSuggestionClick("Emergency services", e)}
                >
                  <AlertCircle className="w-3 h-3 mr-1" /> Emergency
                </motion.button>
                <motion.button 
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center text-xs text-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleSuggestionClick("Office hours", e)}
                >
                  <Clock className="w-3 h-3 mr-1" /> Hours
                </motion.button>
                <motion.button 
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center text-xs text-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleSuggestionClick("Mental health support", e)}
                >
                  <Heart className="w-3 h-3 mr-1" /> Mental Health
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-3">You've reached the message limit for guest access</p>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                onLoginRequest();
              }} 
              className="bg-medical-blue-600 hover:bg-medical-blue-700"
            >
              Sign in for unlimited access
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
