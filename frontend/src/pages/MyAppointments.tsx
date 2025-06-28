import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { appointmentService } from '@/services/api';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Filter,
  Search
} from 'lucide-react';

interface Appointment {
  _id: string;
  doctor: string;
  date: string;
  time: string;
  service: string;
  status: string;
}

const MyAppointments: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.email) return;
      setLoading(true);
      setError(null);
      try {
        const res = await appointmentService.getAppointmentsByEmail(user.email);
        if (res.success) {
          setAppointments(res.data);
        } else {
          setError('Failed to fetch appointments.');
        }
      } catch (err) {
        setError('Error fetching appointments.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    }
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: undefined
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section with Medical Theme */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-400/5 dark:to-indigo-400/5"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                My Appointments
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                View and manage your upcoming and past appointments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-10">
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Book New Appointment
            </Button>
          </div>

          {/* Appointments List */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Stethoscope className="w-6 h-6 text-blue-600" />
                Your Appointments
                {appointments.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {authLoading || loading ? 'Loading your appointments...' : 
                 error ? 'Unable to load appointments' :
                 appointments.length === 0 ? 'No appointments found. Book your first appointment to get started.' :
                 'Manage your healthcare schedule and track your appointments'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {authLoading || loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span>Loading appointments...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Please try again later</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No appointments yet</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Book your first appointment to see it here</p>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appt) => (
                    <Card key={appt._id} className="border-0 shadow-lg bg-gradient-to-r from-white to-blue-50/50 dark:from-gray-800 dark:to-gray-700 hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Service and Doctor Info */}
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                  {appt.service}
                                </h3>
                                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>{/^Dr\.?/i.test(appt.doctor) ? appt.doctor : `Dr. ${appt.doctor}`}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(appt.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{appt.time}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status and Actions */}
                          <div className="flex flex-col items-end gap-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(appt.status)}
                              <Badge className={`${getStatusColor(appt.status)} border`}>
                                {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {appointments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {appointments.filter(a => a.status === 'scheduled').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {appointments.filter(a => a.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {appointments.filter(a => a.status === 'cancelled').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments; 