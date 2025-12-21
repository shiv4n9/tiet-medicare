import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctorService';
import socketService from '@/services/socketService';
import {
  Calendar,
  Stethoscope,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
  UserCheck,
  XCircle,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import ConsultationPanel from '@/components/doctor/ConsultationPanel';
import ChatWindow from '@/components/Chat/ChatWindow';

interface Appointment {
  _id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientId?: string;
  patientEmail?: string;
  doctorId?: string;
  time: string;
  service: string;
  status: string;
  contactNumber: string;
  date: string;
  cancellationReason?: string;
}

interface DashboardStats {
  todayCount: number;
  todayCompleted: number;
  todayPending: number;
  weekCount: number;
  weekCompleted: number;
  totalPatients: number;
  totalCompleted: number;
  totalPending: number;
}

const DoctorDashboardSimplified = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedConsultation, setSelectedConsultation] = useState<Appointment | null>(null);
  const [cancelModal, setCancelModal] = useState<{ open: boolean; appointment: Appointment | null }>({
    open: false,
    appointment: null,
  });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    name: string;
    appointmentId?: string;
  } | null>(null);

  // Track unread messages per appointment - use object for better React reactivity
  const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>({});
  
  // Use ref to track current chat state for socket handlers
  const currentChatRef = useRef<{ showChat: boolean; appointmentId?: string }>({
    showChat: false,
    appointmentId: undefined,
  });

  // Keep ref in sync with state
  useEffect(() => {
    currentChatRef.current = {
      showChat,
      appointmentId: selectedPatient?.appointmentId,
    };
  }, [showChat, selectedPatient?.appointmentId]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, refetch } = useQuery({
    queryKey: ['doctorDashboard'],
    queryFn: doctorService.getDashboardOverview,
    refetchInterval: 30000,
    enabled: isAuthenticated && user?.role === 'doctor',
  });

  // Debug: Log dashboard data
  useEffect(() => {
    if (dashboardData) {
      console.log('Dashboard data received:', dashboardData);
      console.log('Stats:', dashboardData.stats);
      console.log('Today appointments:', dashboardData.todayAppointments?.length);
    }
  }, [dashboardData]);

  // Connect to socket and join conversation rooms for all appointments
  useEffect(() => {
    if (user?._id && dashboardData?.todayAppointments) {
      // Connect socket if not already connected
      const socket = socketService.connect(user._id);
      
      if (socket) {
        // Join all appointment conversation rooms
        dashboardData.todayAppointments.forEach((apt: Appointment) => {
          const conversationId = `appointment-${apt._id}`;
          socket.emit('conversation:join', conversationId);
          console.log('Doctor joined conversation room:', conversationId);
        });
      }
    }
  }, [user, dashboardData?.todayAppointments]);

  // Listen for incoming chat messages via Socket.IO
  useEffect(() => {
    if (!user?._id) return;
    
    // Connect socket if not already connected
    const socket = socketService.connect(user._id);
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      console.log('Doctor Dashboard received message:', data);
      // Extract appointment ID from conversation ID
      const conversationId = data.conversationId || '';
      const appointmentId = conversationId.replace('appointment-', '');
      
      // Only process if it's an appointment conversation and message is from someone else
      if (appointmentId && appointmentId !== conversationId && data.senderId !== user._id) {
        // Use ref to check current chat state (avoids stale closure)
        const { showChat: isShowingChat, appointmentId: currentAppointmentId } = currentChatRef.current;
        
        // Add to unread if chat is not open for this appointment
        if (!isShowingChat || currentAppointmentId !== appointmentId) {
          console.log('Adding unread message for appointment:', appointmentId);
          setUnreadMessages((prev) => ({ ...prev, [appointmentId]: true }));
        }
      }
    };

    // Use a named function reference for proper cleanup
    socket.on('message:receive', handleNewMessage);
    socket.on('notification:new-message', handleNewMessage);

    // Cleanup function
    return () => {
      socket.off('message:receive', handleNewMessage);
      socket.off('notification:new-message', handleNewMessage);
    };
  }, [user?._id]); // Only depend on user._id, not the whole user object

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'doctor')) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  // Handle cancel appointment
  const handleCancelAppointment = async () => {
    if (!cancelModal.appointment || !cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/doctor/appointments/${cancelModal.appointment._id}/cancel`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: cancelReason }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      toast.success('Appointment cancelled successfully');
      setCancelModal({ open: false, appointment: null });
      setCancelReason('');
      refetch();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  // Handle chat with patient
  const handleChatWithPatient = (appointment: Appointment) => {
    const patientId =
      appointment.patientId ||
      `patient-${appointment.patientEmail?.replace(/[^a-zA-Z0-9]/g, '-') || appointment.patientName.replace(/\s+/g, '-').toLowerCase()}`;
    setSelectedPatient({
      id: patientId,
      name: appointment.patientName,
      appointmentId: appointment._id,
    });
    setShowChat(true);
    // Clear unread indicator for this appointment
    setUnreadMessages((prev) => {
      const newState = { ...prev };
      delete newState[appointment._id];
      return newState;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in as a doctor to access the dashboard.</p>
          <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const appointments = dashboardData?.todayAppointments || [];
  const stats: DashboardStats = dashboardData?.stats || {
    todayCount: 0,
    todayCompleted: 0,
    todayPending: 0,
    weekCount: 0,
    weekCompleted: 0,
    totalPatients: 0,
    totalCompleted: 0,
    totalPending: 0,
  };

  const upcomingAppointments = appointments.filter((apt: Appointment) =>
    ['confirmed', 'pending', 'scheduled'].includes(apt.status)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {getGreeting()}, Dr. {user?.name?.split(' ')[0] || 'Doctor'}
                </h1>
                <p className="text-sm text-gray-500">Doctor Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardLoading ? '...' : stats.todayCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.todayPending} pending</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardLoading ? '...' : stats.todayCompleted}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.todayCount > 0
                      ? Math.round((stats.todayCompleted / stats.todayCount) * 100)
                      : 0}
                    % completion
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardLoading ? '...' : stats.weekCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.weekCompleted} completed</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardLoading ? '...' : stats.totalPatients}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.totalCompleted} consultations</p>
                </div>
                <UserCheck className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Appointments
              </div>
              {upcomingAppointments.length > 0 && (
                <Badge className="bg-blue-100 text-blue-800">
                  {upcomingAppointments.length} pending
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading appointments...</p>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment: Appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-lg">
                          {appointment.patientName?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{appointment.time}</span>
                          <span>•</span>
                          <span>{appointment.service}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {appointment.patientAge ? `${appointment.patientAge} years` : ''}
                          {appointment.patientAge && appointment.patientGender ? ' • ' : ''}
                          {appointment.patientGender || ''}
                          {!appointment.patientAge && !appointment.patientGender && 'Patient details pending'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      <Button
                        onClick={() => handleChatWithPatient(appointment)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50 relative"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chat
                        {unreadMessages[appointment._id] && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </Button>
                      <Button
                        onClick={() => setCancelModal({ open: true, appointment })}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        onClick={() => setSelectedConsultation(appointment)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Start Consultation
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Today</h3>
                <p className="text-gray-500">Your schedule is clear for today.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Completed Appointments */}
        {dashboardData?.recentlyCompleted && dashboardData.recentlyCompleted.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Recently Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentlyCompleted.slice(0, 5).map((apt: any) => (
                  <div
                    key={apt._id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-green-100 text-green-800">
                          {apt.patientName?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-900">{apt.patientName}</h4>
                        <p className="text-sm text-gray-500">{apt.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(apt.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">{apt.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancel Appointment Modal */}
      {cancelModal.open && cancelModal.appointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cancel Appointment</h3>
                <p className="text-sm text-gray-500">
                  {cancelModal.appointment.patientName} - {cancelModal.appointment.time}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason (e.g., Emergency, Not available, etc.)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be visible to the patient.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setCancelModal({ open: false, appointment: null });
                  setCancelReason('');
                }}
                variant="outline"
                className="flex-1"
                disabled={cancelling}
              >
                Keep Appointment
              </Button>
              <Button
                onClick={handleCancelAppointment}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={cancelling || !cancelReason.trim()}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Panel */}
      {selectedConsultation && (
        <ConsultationPanel
          appointment={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          onComplete={() => {
            refetch();
            setSelectedConsultation(null);
          }}
        />
      )}

      {/* Chat Window */}
      {showChat && selectedPatient && user && (
        <ChatWindow
          conversationId={selectedPatient.appointmentId ? `appointment-${selectedPatient.appointmentId}` : `doctor-${user._id}-patient-${selectedPatient.id}`}
          receiverId={selectedPatient.id}
          receiverName={selectedPatient.name}
          currentUserId={user._id}
          currentUserName={user.name}
          currentUserRole={user.role}
          onClose={() => setShowChat(false)}
          onVideoCall={() => {
            console.log('Video call feature disabled');
          }}
        />
      )}
    </div>
  );
};

export default DoctorDashboardSimplified;