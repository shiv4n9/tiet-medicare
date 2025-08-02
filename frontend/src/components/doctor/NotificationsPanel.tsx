import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '@/services/doctorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  TestTube,
  Pill,
  Shield,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Notification {
  _id: string;
  type: 'lab_result' | 'approval' | 'message' | 'vaccination' | 'critical' | 'reminder';
  title: string;
  message: string;
  patientName?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
}

const NotificationsPanel: React.FC = () => {
  const [showRead, setShowRead] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'critical'>('all');
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => doctorService.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => doctorService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (isLoading) return <div>Loading notifications...</div>;
  if (error) return <div>Error loading notifications</div>;

  const allNotifications = notifications || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lab_result':
        return <TestTube className="w-4 h-4 text-blue-500" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'vaccination':
        return <Shield className="w-4 h-4 text-orange-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800';
    }
  };

  const filteredNotifications = allNotifications.filter(notification => {
    if (filterType === 'unread') return !notification.isRead;
    if (filterType === 'critical') return notification.priority === 'critical';
    return true;
  }).filter(notification => showRead || !notification.isRead);

  const unreadCount = allNotifications.filter(n => !n.isRead).length;
  const criticalCount = allNotifications.filter(n => n.priority === 'critical' && !n.isRead).length;

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-medical-blue-600" />
          Notifications & Reminders
        </CardTitle>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalCount} Critical
            </Badge>
          )}
          <Badge variant="secondary" className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
            {unreadCount} Unread
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('unread')}
            >
              Unread
            </Button>
            <Button
              variant={filterType === 'critical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('critical')}
            >
              Critical
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRead(!showRead)}
          >
            {showRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showRead ? 'Hide Read' : 'Show Read'}
          </Button>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 border rounded-lg transition-colors ${
                  notification.isRead 
                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                } ${
                  notification.priority === 'critical' 
                    ? 'border-l-4 border-l-red-500' 
                    : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-medium ${
                          notification.isRead 
                            ? 'text-gray-600 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </h4>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {notification.actionRequired && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Action Required
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {notification.timestamp}
                        </span>
                        <Button size="sm" variant="ghost" className="w-6 h-6 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className={`text-sm mt-1 ${
                      notification.isRead 
                        ? 'text-gray-500 dark:text-gray-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {notification.message}
                    </p>
                    
                    {notification.patientName && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                            {notification.patientName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {notification.patientName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {notification.actionRequired && (
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleMarkRead(notification._id)}
                    disabled={markReadMutation.isPending}
                  >
                    {notification.isRead ? 'Mark Unread' : 'Mark Read'}
                  </Button>
                  <Button size="sm" variant="outline">
                    Dismiss
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                Mark All Read
              </Button>
              <Button size="sm" variant="outline">
                Clear All
              </Button>
            </div>
            <Button size="sm" variant="outline">
              View All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel; 