import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Video, 
  MessageSquare,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Appointment {
  _id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  time: string;
  duration: number;
  service: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no-show';
  contactNumber: string;
  email: string;
  notes: string;
  type: 'in-person' | 'telemedicine' | 'follow-up';
  location?: string;
}

const TodaySchedule: React.FC = () => {
  const { data: appointments, isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['todaySchedule'],
    queryFn: doctorService.getTodaySchedule,
  });

  if (isLoading) return <div>Loading today's schedule...</div>;
  if (error) return <div>Error loading schedule</div>;

  const confirmedAppointments = appointments?.filter(apt => apt.status === 'confirmed') || [];
  const pendingAppointments = appointments?.filter(apt => apt.status === 'pending') || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'no-show':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'telemedicine':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'in-person':
        return <User className="w-4 h-4 text-green-500" />;
      case 'follow-up':
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'telemedicine':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-person':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'follow-up':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleStartConsultation = (appointment: Appointment) => {
    console.log('Starting consultation for:', appointment.patientName);
  };

  const handleReschedule = (appointment: Appointment) => {
    console.log('Rescheduling appointment for:', appointment.patientName);
  };

  const handleCancel = (appointment: Appointment) => {
    console.log('Cancelling appointment for:', appointment.patientName);
  };

  return (
    <div className="space-y-6">
      {/* Schedule Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-medical-blue-600" />
                Today's Schedule
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-medical-blue-50 text-medical-blue-700 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                  {confirmedAppointments.length} Confirmed
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
                  {pendingAppointments.length} Pending
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Agenda View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 p-6">
                {appointments?.map((appointment, index) => (
                  <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Time Column */}
                    <div className="flex flex-col items-center space-y-2 min-w-[80px]">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 dark:text-white">{appointment.time}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{appointment.duration || 30} min</p>
                      </div>
                      <div className="w-2 h-2 bg-medical-blue-500 rounded-full"></div>
                    </div>

                    {/* Appointment Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                              {appointment.patientName?.charAt(0) || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{appointment.patientName}</h3>
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                              <Badge className={getTypeColor(appointment.type)}>
                                {getTypeIcon(appointment.type)}
                                <span className="ml-1">{appointment.type}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {appointment.patientAge} years • {appointment.patientGender} • {appointment.service}
                            </p>
                            {appointment.location && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {appointment.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {appointment.notes && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{appointment.notes}</p>
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {appointment.contactNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {appointment.email}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          {appointment.status === 'confirmed' && (
                            <>
                              {appointment.type === 'telemedicine' ? (
                                <Button size="sm" onClick={() => handleStartConsultation(appointment)}>
                                  <Video className="w-4 h-4 mr-1" />
                                  Start Video Call
                                </Button>
                              ) : (
                                <Button size="sm" onClick={() => handleStartConsultation(appointment)}>
                                  <User className="w-4 h-4 mr-1" />
                                  Start Consultation
                                </Button>
                              )}
                            </>
                          )}
                          
                          <Button size="sm" variant="outline" onClick={() => handleReschedule(appointment)}>
                            Reschedule
                          </Button>
                          
                          <Button size="sm" variant="outline" onClick={() => handleCancel(appointment)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                          
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Add Appointment</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                <Video className="w-6 h-6" />
                <span className="text-sm">Telemedicine</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm">Send Reminders</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                <AlertCircle className="w-6 h-6" />
                <span className="text-sm">Emergency</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TodaySchedule; 