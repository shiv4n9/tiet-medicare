import { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import socketService from '@/services/socketService';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  _id: string;
  message: string;
  senderName: string;
  senderId: string;
  createdAt: string;
}

interface ChatWindowProps {
  conversationId: string;
  receiverId: string;
  receiverName: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
  onClose: () => void;
  onVideoCall: () => void;
}

export const ChatWindow = ({
  conversationId,
  receiverId,
  receiverName,
  currentUserId,
  currentUserName,
  currentUserRole,
  onClose,
  onVideoCall
}: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Connect to Socket.IO
    const socket = socketService.connect(currentUserId);
    
    loadMessages();

    if (socket) {
      // Join conversation room
      socket.emit('conversation:join', conversationId);
      console.log('Joined conversation:', conversationId);

      // Define handler function so we can remove only this specific listener
      const handleMessageReceive = (message: Message) => {
        console.log('ChatWindow received message:', message);
        setMessages(prev => {
          // Avoid duplicates by checking if message already exists
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      };

      const handleTypingUser = () => {
        setIsTyping(true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      };

      const handleTypingStop = () => {
        setIsTyping(false);
      };

      const handleMessageError = (error: any) => {
        console.error('Message error:', error);
        alert('Failed to send message: ' + error.error);
      };

      const handleDisconnect = (reason: string) => {
        console.warn('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          socket.connect();
        }
      };

      const handleReconnect = () => {
        console.log('Socket reconnected, rejoining conversation');
        socket.emit('conversation:join', conversationId);
      };

      // Listen for events
      socket.on('message:receive', handleMessageReceive);
      socket.on('typing:user', handleTypingUser);
      socket.on('typing:stop', handleTypingStop);
      socket.on('message:error', handleMessageError);
      socket.on('disconnect', handleDisconnect);
      socket.on('reconnect', handleReconnect);

      // Cleanup - remove only our specific handlers
      return () => {
        socket.off('message:receive', handleMessageReceive);
        socket.off('typing:user', handleTypingUser);
        socket.off('typing:stop', handleTypingStop);
        socket.off('message:error', handleMessageError);
        socket.off('disconnect', handleDisconnect);
        socket.off('reconnect', handleReconnect);
      };
    }
  }, [conversationId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/messages/conversation/${conversationId}`,
        { 
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) {
      console.log('Message is empty, not sending');
      return;
    }

    const socket = socketService.getSocket();
    console.log('Attempting to send message:', {
      message: newMessage,
      conversationId,
      receiverId,
      socketConnected: socket?.connected
    });

    if (socket && socket.connected) {
      socket.emit('message:send', {
        conversationId,
        senderId: currentUserId,
        receiverId,
        receiverName,
        message: newMessage,
        senderName: currentUserName,
        senderRole: currentUserRole
      });

      console.log('Message sent via Socket.IO');
      setNewMessage('');
    } else {
      console.error('Socket not connected');
      alert('Chat is not connected. Please refresh the page.');
    }
  };

  const handleTyping = () => {
    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit('typing:start', { conversationId, userName: currentUserName });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { conversationId });
      }, 1000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-4 right-24 w-[90vw] sm:w-96 h-[80vh] sm:h-[600px] max-h-[calc(100vh-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-[9999] border-2 border-gray-200 dark:border-gray-700"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-medical-blue-600 to-medical-green-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{receiverName}</h3>
            <p className="text-xs opacity-90 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-full w-9 h-9 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-medical-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 ${
                      msg.senderId === currentUserId
                        ? 'bg-gradient-to-r from-medical-blue-600 to-medical-blue-500 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.senderId === currentUserId ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2 rounded-bl-sm">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-white dark:bg-gray-800"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-medical-blue-600 to-medical-green-600 hover:from-medical-blue-700 hover:to-medical-green-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatWindow;
