import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Phone, 
  Video, 
  Send, 
  MoreHorizontal,
  User,
  Users,
  Bell,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  _id: string;
  sender: string;
  senderType: 'patient' | 'doctor' | 'system';
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'file' | 'lab_result';
}

interface Conversation {
  _id: string;
  participant: string;
  participantType: 'patient' | 'doctor';
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

interface Notification {
  _id: string;
  type: 'lab_result' | 'consultation' | 'emergency';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const CommunicationHub: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'patients' | 'doctors' | 'notifications'>('patients');

  // Fetch conversations and notifications from API
  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: () => doctorService.getConversations?.() || Promise.resolve([]),
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ['communicationNotifications'],
    queryFn: () => doctorService.getNotifications(),
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['messages', selectedConversation],
    queryFn: () => doctorService.getMessages?.(selectedConversation!) || Promise.resolve([]),
    enabled: !!selectedConversation,
  });

  if (conversationsLoading || notificationsLoading) return <div>Loading communication data...</div>;

  const allConversations = conversations || [];
  const allNotifications = notifications || [];
  const allMessages = messages || [];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lab_result':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'consultation':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'emergency':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-medical-blue-600" />
                Communication Hub
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline">
                  <Video className="w-4 h-4 mr-1" />
                  Video
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1 mt-4">
                <Button
                  variant={activeTab === 'patients' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('patients')}
                  className="flex-1"
                >
                  <User className="w-4 h-4 mr-1" />
                  Patients
                </Button>
                <Button
                  variant={activeTab === 'doctors' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('doctors')}
                  className="flex-1"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Doctors
                </Button>
                <Button
                  variant={activeTab === 'notifications' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('notifications')}
                  className="flex-1"
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Alerts
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-1">
                  {activeTab === 'patients' && allConversations.filter(c => c.participantType === 'patient').map((conversation) => (
                    <div
                      key={conversation._id}
                      onClick={() => setSelectedConversation(conversation._id)}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedConversation === conversation._id
                          ? 'bg-medical-blue-50 dark:bg-medical-blue-900/20 border-l-4 border-l-medical-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                              {conversation.participant?.charAt(0) || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {conversation.participant}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {conversation.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {activeTab === 'doctors' && allConversations.filter(c => c.participantType === 'doctor').map((conversation) => (
                    <div
                      key={conversation._id}
                      onClick={() => setSelectedConversation(conversation._id)}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedConversation === conversation._id
                          ? 'bg-medical-green-50 dark:bg-medical-green-900/20 border-l-4 border-l-medical-green-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-medical-green-100 text-medical-green-800 dark:bg-medical-green-900 dark:text-medical-green-200">
                              {conversation.participant?.charAt(0) || 'D'}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {conversation.participant}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {conversation.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {activeTab === 'notifications' && allNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        !notification.isRead ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              {selectedConversation ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                        {allConversations.find(c => c._id === selectedConversation)?.participant?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {allConversations.find(c => c._id === selectedConversation)?.participant}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {allConversations.find(c => c._id === selectedConversation)?.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <CardTitle className="text-lg text-gray-500 dark:text-gray-400">
                  Select a conversation to start messaging
                </CardTitle>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {selectedConversation ? (
                <>
                  {/* Messages */}
                  <ScrollArea className="h-80 p-4">
                    <div className="space-y-4">
                      {allMessages.map((message, index) => (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className={`flex ${message.senderType === 'doctor' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                            message.senderType === 'doctor'
                              ? 'bg-medical-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">
                                {message.sender}
                              </span>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs opacity-70">
                                  {message.timestamp}
                                </span>
                                {message.isRead && message.senderType === 'doctor' && (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                              </div>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunicationHub; 