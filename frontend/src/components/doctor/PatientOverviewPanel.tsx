import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  Phone,
  Video
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Appointment {
  _id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  time: string;
  service: string;
  status: string;
  contactNumber: string;
}
interface Patient {
  _id: string;
  name: string;
  lastVisit: string;
  nextAppointment?: string;
}
interface Alert {
  _id: string;
  type: string;
  patientName: string;
  message: string;
  timestamp: string;
}
interface DashboardData {
  todayAppointments: Appointment[];
  recentPatients: Patient[];
  criticalAlerts: Alert[];
  weeklyStats?: any;
  monthlyStats?: any;
}

const PatientOverviewPanel: React.FC = () => {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['doctorDashboardOverview'],
    queryFn: doctorService.getDashboardOverview,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading dashboard data</div>;

  const { todayAppointments = [], recentPatients = [], criticalAlerts = [], weeklyStats = {}, monthlyStats = {} } = data || {};

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
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-medical-blue-600" />
              Upcoming Appointments
            </CardTitle>
            <Badge variant="secondary" className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
              {todayAppointments.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                          {appointment.patientName?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{appointment.patientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {appointment.patientAge} years • {appointment.patientGender} • {appointment.service}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </p>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                          <Video className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Visits & New Registrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-medical-green-600" />
                Recent Visits
              </CardTitle>
              <Badge variant="secondary" className="bg-medical-green-100 text-medical-green-800 dark:bg-medical-green-900 dark:text-medical-green-200">
                {recentPatients.length}
              </Badge>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {recentPatients.map((patient) => (
                    <div key={patient._id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-medical-green-100 text-medical-green-800 dark:bg-medical-green-900 dark:text-medical-green-200 text-sm">
                            {patient.name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Last visit: {patient.lastVisit}
                          </p>
                        </div>
                      </div>
                      {patient.nextAppointment && (
                        <Badge variant="outline" className="text-xs">
                          Next: {patient.nextAppointment}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* New Registrations: You can fetch or compute this from API if available */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-medical-orange-600" />
                New Registrations
              </CardTitle>
              <Badge variant="secondary" className="bg-medical-orange-100 text-medical-orange-800 dark:bg-medical-orange-900 dark:text-medical-orange-200">
                {/* You may want to fetch this from API */}
                0
              </Badge>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {/* Map new registrations if available */}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Critical Alerts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Critical Alerts
            </CardTitle>
            <Badge variant="destructive">
              {criticalAlerts.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
              <div className="space-y-3">
                {criticalAlerts.map((alert) => (
                  <div key={alert._id} className="flex items-start space-x-3 p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{alert.patientName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.timestamp}</p>
                    </div>
                    <Button size="sm" variant="destructive">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PatientOverviewPanel; 