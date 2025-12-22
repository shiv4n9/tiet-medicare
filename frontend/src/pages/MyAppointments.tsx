import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { appointmentService } from '@/services/api';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Search,
  X,
  RefreshCw,
  Loader2,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';

interface Appointment {
  _id: string;
  doctor: string;
  doctorId?: string;
  date: string;
  time: string;
  service: string;
  status: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const MyAppointments: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Reschedule states
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Check if appointment time has passed (for missed status)
  const isAppointmentPassed = (dateString: string, timeString: string): boolean => {
    const now = new Date();
    const aptDate = new Date(dateString);
    const [hours, minutes] = timeString.split(':').map(Number);
    aptDate.setHours(hours, minutes, 0, 0);
    // Add 30 minutes buffer (appointment duration)
    aptDate.setMinutes(aptDate.getMinutes() + 30);
    return now > aptDate;
  };

  // Get effective status (auto-detect missed, handle legacy statuses)
  const getEffectiveStatus = (apt: Appointment): string => {
    // Handle completed and cancelled - these are final states
    if (apt.status === 'completed' || apt.status === 'cancelled') {
      return apt.status;
    }
    
    // Handle missed status
    if (apt.status === 'missed') {
      return 'missed';
    }
    
    // Convert legacy statuses to new system
    // in_progress, pending, confirmed, no-show -> check if passed
    const legacyActiveStatuses = ['in_progress', 'pending', 'confirmed', 'scheduled'];
    const isActiveStatus = legacyActiveStatuses.includes(apt.status);
    
    if (isActiveStatus) {
      // If time has passed, it's missed
      if (isAppointmentPassed(apt.date, apt.time)) {
        return 'missed';
      }
      return 'scheduled';
    }
    
    // no-show is essentially missed
    if (apt.status === 'no-show') {
      return 'missed';
    }
    
    // Default fallback
    return apt.status;
  };

  const fetchAppointments = async () => {
    if (!user?.email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await appointmentService.getAppointmentsByEmail(user.email);
      if (res.success) {
        setAppointments(res.data);
        setFilteredAppointments(res.data);
      } else {
        setError('Failed to fetch appointments.');
      }
    } catch (err) {
      setError('Error fetching appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Filter appointments based on search and status
  useEffect(() => {
    let filtered = [...appointments];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.doctor.toLowerCase().includes(query) ||
        apt.service.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => getEffectiveStatus(apt) === statusFilter);
    }
    
    setFilteredAppointments(filtered);
  }, [searchQuery, statusFilter, appointments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'missed':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'missed':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isUpcoming = (dateString: string, timeString: string, status: string) => {
    if (status === 'completed' || status === 'cancelled' || status === 'missed') return false;
    return !isAppointmentPassed(dateString, timeString);
  };

  // Generate available time slots for a date (12 slots: 30-min intervals)
  const generateTimeSlots = (date: string, doctorName: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const baseSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
    
    const now = new Date();
    const selectedDateObj = new Date(date);
    const isToday = selectedDateObj.toDateString() === now.toDateString();
    
    // Get booked slots for this doctor on this date
    const bookedSlots = appointments
      .filter(apt => 
        apt.doctor === doctorName && 
        new Date(apt.date).toISOString().split('T')[0] === date &&
        apt.status !== 'cancelled'
      )
      .map(apt => apt.time);
    
    baseSlots.forEach(time => {
      let available = !bookedSlots.includes(time);
      
      // If it's today, also check if the time has passed
      if (available && isToday) {
        const [hours, minutes] = time.split(':').map(Number);
        const slotTime = new Date(selectedDateObj);
        slotTime.setHours(hours, minutes, 0, 0);
        if (slotTime <= now) {
          available = false;
        }
      }
      
      slots.push({
        time,
        available
      });
    });
    
    return slots;
  };

  // Format time for display (e.g., "09:00" -> "9:00 AM")
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleBookNew = () => {
    navigate('/#appointments');
    setTimeout(() => {
      const appointmentsSection = document.getElementById('appointments');
      if (appointmentsSection) {
        appointmentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelModalOpen(true);
  };

  const handleRescheduleClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
    setRescheduleModalOpen(true);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (selectedAppointment && date) {
      setLoadingSlots(true);
      setTimeout(() => {
        const slots = generateTimeSlots(date, selectedAppointment.doctor);
        setAvailableSlots(slots);
        setLoadingSlots(false);
      }, 500);
    }
  };

  const confirmCancel = async () => {
    if (!selectedAppointment) return;
    
    setActionLoading(true);
    try {
      await appointmentService.updateAppointment(selectedAppointment._id, {
        status: 'cancelled'
      });
      
      toast.success('Appointment cancelled successfully');
      setCancelModalOpen(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReschedule = async () => {
    if (!selectedAppointment || !selectedDate || !selectedTime) return;
    
    setActionLoading(true);
    try {
      await appointmentService.updateAppointment(selectedAppointment._id, {
        date: selectedDate,
        time: selectedTime,
        status: 'scheduled'
      });
      
      toast.success('Appointment rescheduled successfully');
      setRescheduleModalOpen(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to reschedule appointment';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getMinDate = () => {
    // Allow booking for today (past time slots are already filtered out)
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Calculate stats with effective status
  const getStats = () => {
    const upcoming = appointments.filter(a => isUpcoming(a.date, a.time, getEffectiveStatus(a))).length;
    const scheduled = appointments.filter(a => getEffectiveStatus(a) === 'scheduled' && !isAppointmentPassed(a.date, a.time)).length;
    const completed = appointments.filter(a => getEffectiveStatus(a) === 'completed').length;
    const cancelled = appointments.filter(a => getEffectiveStatus(a) === 'cancelled').length;
    const missed = appointments.filter(a => getEffectiveStatus(a) === 'missed').length;
    return { upcoming, scheduled, completed, cancelled, missed };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
              <Calendar className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
            <p className="text-gray-600">View and manage your upcoming and past appointments</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-16 sm:px-6 lg:px-8 -mt-4">
        <div className="mx-auto max-w-6xl space-y-6">
          
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search doctor or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 pr-8 rounded-md border border-gray-200 text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="missed">Missed</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchAppointments}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <Button 
              onClick={handleBookNew}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book New Appointment
            </Button>
          </div>

          {/* Quick Stats */}
          {appointments.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-blue-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Scheduled</p>
                    <p className="text-xl font-bold text-gray-900">{stats.scheduled}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-green-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-orange-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Missed</p>
                    <p className="text-xl font-bold text-gray-900">{stats.missed}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-red-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cancelled</p>
                    <p className="text-xl font-bold text-gray-900">{stats.cancelled}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Appointments List */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Your Appointments
                {filteredAppointments.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filteredAppointments.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {authLoading || loading ? 'Loading...' : 
                 error ? 'Unable to load appointments' :
                 filteredAppointments.length === 0 ? 
                   (appointments.length === 0 ? 'No appointments yet' : 'No matching appointments') :
                 'Manage your healthcare schedule'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authLoading || loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-gray-600">Loading appointments...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-600 font-medium">{error}</p>
                  <Button variant="outline" className="mt-4" onClick={fetchAppointments}>
                    Try Again
                  </Button>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {appointments.length === 0 ? 'No appointments yet' : 'No matching appointments'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {appointments.length === 0 
                      ? 'Book your first appointment to get started'
                      : 'Try adjusting your search or filters'}
                  </p>
                  {appointments.length === 0 && (
                    <Button onClick={handleBookNew}>
                      <Plus className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((appt) => {
                    const effectiveStatus = getEffectiveStatus(appt);
                    const upcoming = isUpcoming(appt.date, appt.time, effectiveStatus);
                    
                    return (
                      <div 
                        key={appt._id} 
                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                          upcoming ? 'bg-white border-blue-100' : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2.5 rounded-full ${
                              upcoming ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <Stethoscope className={`w-5 h-5 ${
                                upcoming ? 'text-blue-600' : 'text-gray-400'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900">{appt.service}</h3>
                              <div className="mt-1 space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5" />
                                  <span>{/^Dr\.?/i.test(appt.doctor) ? appt.doctor : `Dr. ${appt.doctor}`}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(appt.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {appt.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                            <Badge className={`${getStatusColor(effectiveStatus)} border flex items-center gap-1`}>
                              {getStatusIcon(effectiveStatus)}
                              {formatStatus(effectiveStatus)}
                            </Badge>
                            
                            {upcoming && effectiveStatus === 'scheduled' && (
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleRescheduleClick(appt)}
                                  className="text-xs h-8"
                                >
                                  Reschedule
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCancelClick(appt)}
                                  className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Appointment</h3>
              <button 
                onClick={() => setCancelModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this appointment?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <p><span className="font-medium">Service:</span> {selectedAppointment.service}</p>
                <p><span className="font-medium">Doctor:</span> {selectedAppointment.doctor}</p>
                <p><span className="font-medium">Date:</span> {formatDate(selectedAppointment.date)}</p>
                <p><span className="font-medium">Time:</span> {selectedAppointment.time}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setCancelModalOpen(false)}
                disabled={actionLoading}
              >
                Keep Appointment
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmCancel}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reschedule Appointment</h3>
              <button 
                onClick={() => setRescheduleModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm">
                <p className="font-medium text-blue-900">{selectedAppointment.service}</p>
                <p className="text-blue-700">with {selectedAppointment.doctor}</p>
                <p className="text-blue-600 mt-1">
                  Current: {formatDate(selectedAppointment.date)} at {selectedAppointment.time}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Date
                </label>
                <Input
                  type="date"
                  min={getMinDate()}
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-600 text-sm">Loading slots...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4 text-center">
                      No slots available for this date
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            selectedTime === slot.time
                              ? 'bg-blue-600 text-white'
                              : slot.available
                                ? 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                : 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                          }`}
                        >
                          {formatTime(slot.time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setRescheduleModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={confirmReschedule}
                disabled={actionLoading || !selectedDate || !selectedTime}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  'Confirm Reschedule'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
