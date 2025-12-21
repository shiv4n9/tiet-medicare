import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '@/services/patientService';
import socketService from '@/services/socketService';
import jsPDF from 'jspdf';
import {
  Calendar,
  Clock,
  FileText,
  Pill,
  Activity,
  Heart,
  User,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Download,
  Eye,
  AlertTriangle,
  MessageSquare,
  Bell,
  RefreshCw,
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Breadcrumb from '@/components/Breadcrumb';
import ChatWindow from '@/components/Chat/ChatWindow';

interface Appointment {
  _id: string;
  doctorName: string;
  doctorId?: string;
  department: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  type: 'consultation' | 'follow-up' | 'check-up';
  cancellationReason?: string;
}

interface MedicalRecord {
  _id: string;
  doctorName: string;
  doctorSpecialization?: string;
  doctorDepartment?: string;
  date: string;
  time: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  chiefComplaint?: string;
  prescriptions?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  labOrders?: Array<{
    testName: string;
    status: string;
  }>;
  referrals?: Array<{
    specialist: string;
    reason: string;
  }>;
  vitalSigns?: {
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
  };
  followUp?: {
    required: boolean;
    date?: string;
    reason?: string;
  };
  consultationType?: string;
  createdAt?: string;
}

interface Prescription {
  _id: string;
  doctorName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  date: string;
  status: 'active' | 'completed' | 'discontinued';
}

interface LabResult {
  _id: string;
  testName: string;
  result: string;
  normalRange: string;
  date: string;
  status: 'normal' | 'abnormal' | 'pending';
}

interface Referral {
  _id: string;
  doctorName: string;
  specialistName: string;
  reason: string;
  priority: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  date: string;
  facility: string;
}

const PatientDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; name: string; appointmentId?: string } | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Track unread messages per appointment
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
      appointmentId: selectedDoctor?.appointmentId,
    };
  }, [showChat, selectedDoctor?.appointmentId]);

  // Fetch patient dashboard data with auto-refresh
  const { data: dashboardData, refetch: refetchDashboard } = useQuery({
    queryKey: ['patientDashboard'],
    queryFn: patientService.getDashboardOverview,
    enabled: isAuthenticated && user?.role === 'patient',
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: appointments, refetch: refetchAppointments } = useQuery({
    queryKey: ['patientAppointments'],
    queryFn: patientService.getAppointments,
    enabled: isAuthenticated && user?.role === 'patient',
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { data: medicalRecords, refetch: refetchRecords } = useQuery({
    queryKey: ['patientMedicalRecords'],
    queryFn: patientService.getMedicalRecords,
    enabled: isAuthenticated && user?.role === 'patient'
  });

  const { data: prescriptions, refetch: refetchPrescriptions } = useQuery({
    queryKey: ['patientPrescriptions'],
    queryFn: patientService.getPrescriptions,
    enabled: isAuthenticated && user?.role === 'patient'
  });

  const { data: labResults, refetch: refetchLabResults } = useQuery({
    queryKey: ['patientLabResults'],
    queryFn: patientService.getLabResults,
    enabled: isAuthenticated && user?.role === 'patient'
  });

  const { data: referrals, refetch: refetchReferrals } = useQuery({
    queryKey: ['patientReferrals'],
    queryFn: patientService.getReferrals,
    enabled: isAuthenticated && user?.role === 'patient'
  });

  // Socket.IO listener for real-time updates
  useEffect(() => {
    const socket = (window as any).socket;
    if (typeof window !== 'undefined' && socket && user?._id) {
      // Listen for consultation completed event
      socket.on('dashboard:consultation-completed', (data: any) => {
        console.log('Consultation completed, refreshing dashboard:', data);
        // Refresh all data
        refetchDashboard();
        refetchAppointments();
        refetchRecords();
        refetchPrescriptions();
        refetchLabResults();
        refetchReferrals();
      });

      // Listen for medical record updates
      socket.on('dashboard:medical-record-update', (data: any) => {
        console.log('Medical record updated:', data);
        refetchRecords();
        refetchReferrals();
      });

      // Cleanup
      return () => {
        if (socket) {
          socket.off('dashboard:consultation-completed');
          socket.off('dashboard:medical-record-update');
        }
      };
    }
  }, [user, refetchDashboard, refetchAppointments, refetchRecords, refetchPrescriptions, refetchLabResults, refetchReferrals]);

  // Connect to socket and join conversation rooms for all appointments
  useEffect(() => {
    if (user?._id && appointments?.length) {
      const socket = socketService.connect(user._id);
      
      if (socket) {
        // Join all appointment conversation rooms
        appointments.forEach((apt: Appointment) => {
          const conversationId = `appointment-${apt._id}`;
          socket.emit('conversation:join', conversationId);
          console.log('Patient joined conversation room:', conversationId);
        });
      }
    }
  }, [user, appointments]);

  // Listen for incoming chat messages via Socket.IO
  useEffect(() => {
    if (!user?._id) return;
    
    const socket = socketService.connect(user._id);
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      console.log('Patient received message:', data);
      const conversationId = data.conversationId || '';
      const appointmentId = conversationId.replace('appointment-', '');
      
      // Only process if it's an appointment conversation and message is from someone else
      if (appointmentId && appointmentId !== conversationId && data.senderId !== user._id) {
        const { showChat: isShowingChat, appointmentId: currentAppointmentId } = currentChatRef.current;
        
        // Add to unread if chat is not open for this appointment
        if (!isShowingChat || currentAppointmentId !== appointmentId) {
          console.log('Adding unread message for appointment:', appointmentId);
          setUnreadMessages((prev) => ({ ...prev, [appointmentId]: true }));
        }
      }
    };

    socket.on('message:receive', handleNewMessage);
    socket.on('notification:new-message', handleNewMessage);

    return () => {
      socket.off('message:receive', handleNewMessage);
      socket.off('notification:new-message', handleNewMessage);
    };
  }, [user?._id]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchDashboard(),
      refetchAppointments(),
      refetchRecords(),
      refetchPrescriptions(),
      refetchLabResults(),
      refetchReferrals()
    ]);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Generate PDF for medical record
  const handleDownloadPDF = (record: MedicalRecord) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    const lineHeight = 7;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number): number => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + lines.length * lineHeight;
    };

    // Header
    doc.setFillColor(37, 99, 235); // Blue header
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('TIET Medicare', margin, 18);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Medical Record', margin, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 35);

    yPos = 55;
    doc.setTextColor(0, 0, 0);

    // Patient & Doctor Info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Consultation Details', margin, yPos);
    yPos += lineHeight + 3;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Doctor: ${record.doctorName}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Specialization: ${record.doctorSpecialization || 'General Medicine'}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Department: ${record.doctorDepartment || 'General'}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Date: ${new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Time: ${record.time}`, margin, yPos);
    yPos += lineHeight + 5;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Chief Complaint
    if (record.chiefComplaint || record.consultationType) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Chief Complaint', margin, yPos);
      yPos += lineHeight;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(record.chiefComplaint || record.consultationType || 'General Consultation', margin, yPos, contentWidth);
      yPos += 5;
    }

    // Vital Signs
    if (record.vitalSigns && (record.vitalSigns.bloodPressure?.systolic || record.vitalSigns.heartRate || record.vitalSigns.temperature)) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Vital Signs', margin, yPos);
      yPos += lineHeight;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const vitals: string[] = [];
      if (record.vitalSigns.bloodPressure?.systolic && record.vitalSigns.bloodPressure?.diastolic) {
        vitals.push(`Blood Pressure: ${record.vitalSigns.bloodPressure.systolic}/${record.vitalSigns.bloodPressure.diastolic} mmHg`);
      }
      if (record.vitalSigns.heartRate) vitals.push(`Heart Rate: ${record.vitalSigns.heartRate} bpm`);
      if (record.vitalSigns.temperature) vitals.push(`Temperature: ${record.vitalSigns.temperature}°F`);
      if (record.vitalSigns.oxygenSaturation) vitals.push(`O2 Saturation: ${record.vitalSigns.oxygenSaturation}%`);
      if (record.vitalSigns.weight) vitals.push(`Weight: ${record.vitalSigns.weight} kg`);
      if (record.vitalSigns.height) vitals.push(`Height: ${record.vitalSigns.height} cm`);
      
      vitals.forEach(vital => {
        doc.text(`• ${vital}`, margin + 5, yPos);
        yPos += lineHeight;
      });
      yPos += 5;
    }

    // Diagnosis
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addWrappedText(record.diagnosis || 'No diagnosis recorded', margin, yPos, contentWidth);
    yPos += 5;

    // Treatment Plan
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Treatment Plan', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addWrappedText(record.treatment || 'No treatment plan recorded', margin, yPos, contentWidth);
    yPos += 5;

    // Prescriptions
    if (record.prescriptions && record.prescriptions.length > 0) {
      // Check if we need a new page
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Prescriptions', margin, yPos);
      yPos += lineHeight;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      record.prescriptions.forEach((rx, idx) => {
        doc.text(`${idx + 1}. ${rx.medication}`, margin + 5, yPos);
        yPos += lineHeight;
        doc.text(`   Dosage: ${rx.dosage || 'N/A'} | Frequency: ${rx.frequency || 'N/A'} | Duration: ${rx.duration || 'N/A'}`, margin + 5, yPos);
        yPos += lineHeight;
      });
      yPos += 5;
    }

    // Follow-up
    if (record.followUp?.required) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Follow-up Required', margin, yPos);
      yPos += lineHeight;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (record.followUp.date) {
        doc.text(`Date: ${new Date(record.followUp.date).toLocaleDateString()}`, margin + 5, yPos);
        yPos += lineHeight;
      }
      if (record.followUp.reason) {
        doc.text(`Reason: ${record.followUp.reason}`, margin + 5, yPos);
        yPos += lineHeight;
      }
      yPos += 5;
    }

    // Doctor's Notes
    if (record.notes) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("Doctor's Notes", margin, yPos);
      yPos += lineHeight;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      yPos = addWrappedText(record.notes, margin, yPos, contentWidth);
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
      doc.text('TIET Medicare - Confidential Medical Record', pageWidth / 2, 295, { align: 'center' });
    }

    // Save the PDF
    const fileName = `Medical_Record_${record.doctorName.replace(/\s+/g, '_')}_${new Date(record.date).toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Generate combined PDF for all medical records
  const handleDownloadAllPDFs = () => {
    if (!medicalRecords || medicalRecords.length === 0) {
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    const lineHeight = 7;

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number): number => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + lines.length * lineHeight;
    };

    // Cover page
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 60, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('TIET Medicare', margin, 30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Complete Medical Records', margin, 45);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    let yPos = 80;
    doc.text(`Patient: ${user?.name || 'Patient'}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Total Records: ${medicalRecords.length}`, margin, yPos);
    yPos += lineHeight * 2;

    // Table of contents
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Table of Contents', margin, yPos);
    yPos += lineHeight + 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    medicalRecords.forEach((record: MedicalRecord, index: number) => {
      doc.text(`${index + 1}. ${record.doctorName} - ${new Date(record.date).toLocaleDateString()} - ${record.diagnosis || 'Consultation'}`, margin + 5, yPos);
      yPos += lineHeight;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    // Add each record
    medicalRecords.forEach((record: MedicalRecord, index: number) => {
      doc.addPage();
      yPos = 20;

      // Record header
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Record ${index + 1} of ${medicalRecords.length}`, margin, 18);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`${record.doctorName} • ${new Date(record.date).toLocaleDateString()}`, margin, 30);

      yPos = 55;
      doc.setTextColor(0, 0, 0);

      // Doctor Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Consultation Details', margin, yPos);
      yPos += lineHeight + 3;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Doctor: ${record.doctorName}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Specialization: ${record.doctorSpecialization || 'General Medicine'}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Date: ${new Date(record.date).toLocaleDateString()} at ${record.time}`, margin, yPos);
      yPos += lineHeight + 5;

      // Diagnosis
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Diagnosis', margin, yPos);
      yPos += lineHeight;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(record.diagnosis || 'No diagnosis recorded', margin, yPos, contentWidth);
      yPos += 5;

      // Treatment
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Treatment Plan', margin, yPos);
      yPos += lineHeight;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(record.treatment || 'No treatment plan recorded', margin, yPos, contentWidth);
      yPos += 5;

      // Prescriptions
      if (record.prescriptions && record.prescriptions.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Prescriptions', margin, yPos);
        yPos += lineHeight;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        record.prescriptions.forEach((rx) => {
          doc.text(`• ${rx.medication} - ${rx.dosage || ''} ${rx.frequency || ''} ${rx.duration || ''}`, margin + 5, yPos);
          yPos += lineHeight;
        });
        yPos += 5;
      }

      // Notes
      if (record.notes) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Doctor's Notes", margin, yPos);
        yPos += lineHeight;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        yPos = addWrappedText(record.notes, margin, yPos, contentWidth);
      }
    });

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
      doc.text('TIET Medicare - Confidential Medical Records', pageWidth / 2, 295, { align: 'center' });
    }

    // Save
    const fileName = `All_Medical_Records_${user?.name?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Handle chat with doctor - using appointment ID for persistent conversations
  const handleChatWithDoctor = (doctorId: string | undefined, doctorName: string, appointmentId?: string) => {
    // Use doctorId if available, otherwise use doctorName as fallback
    const id = doctorId || `doctor-${doctorName.replace(/\s+/g, '-').toLowerCase()}`;
    setSelectedDoctor({
      id,
      name: doctorName,
      appointmentId: appointmentId // Store appointment ID for conversation
    });
    setShowChat(true);
    // Clear unread indicator for this appointment
    if (appointmentId) {
      setUnreadMessages((prev) => {
        const newState = { ...prev };
        delete newState[appointmentId];
        return newState;
      });
    }
  };

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'patient')) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'patient') {
    return null;
  }

  const upcomingAppointments = appointments?.filter((apt: Appointment) => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day
    aptDate.setHours(0, 0, 0, 0); // Reset to start of day
    
    // Show appointments that are today or in the future, and not cancelled/completed
    return (aptDate >= today) && (apt.status !== 'cancelled' && apt.status !== 'completed');
  }) || [];

  const recentRecords = medicalRecords?.slice(0, 5) || [];
  const activePrescriptions = prescriptions?.filter((p: Prescription) => p.status === 'active') || [];
  const pendingLabResults = labResults?.filter((l: LabResult) => l.status === 'pending') || [];
  const activeReferrals = referrals?.filter((r: Referral) => r.status === 'pending' || r.status === 'accepted') || [];
  const todayAppointments = upcomingAppointments.filter((apt: Appointment) => {
    const today = new Date();
    const aptDate = new Date(apt.date);
    return aptDate.toDateString() === today.toDateString();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'active':
      case 'normal':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
      case 'discontinued':
      case 'abnormal':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'active':
      case 'normal':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
      case 'discontinued':
      case 'abnormal':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <div className="w-8 h-8 bg-medical-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
              </Button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Patient Portal
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/profile')}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                    {user?.name?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-l-4 border-l-medical-blue-500 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Appointments</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {upcomingAppointments.length}
                    </p>
                  </div>
                  <div className="p-3 bg-medical-blue-100 dark:bg-medical-blue-900/30 rounded-xl">
                    <Calendar className="w-7 h-7 text-medical-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-medical-orange-500 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Medical Records</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {medicalRecords?.length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <FileText className="w-7 h-7 text-medical-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-medical-blue-100 dark:bg-medical-blue-900/30 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-medical-blue-600" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => navigate('/#appointments')}
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-medical-blue-500 to-medical-blue-600 hover:from-medical-blue-600 hover:to-medical-blue-700 rounded-xl"
                >
                  <Calendar className="w-6 h-6" />
                  <span className="font-medium">Book Appointment</span>
                </Button>

                {upcomingAppointments.length > 0 ? (
                  <Button
                    onClick={() => {
                      const firstAppointment = upcomingAppointments[0];
                      handleChatWithDoctor(firstAppointment.doctorId, firstAppointment.doctorName, firstAppointment._id);
                    }}
                    className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-medical-green-500 to-medical-green-600 hover:from-medical-green-600 hover:to-medical-green-700 rounded-xl"
                  >
                    <MessageSquare className="w-6 h-6" />
                    <span className="font-medium">Chat with Doctor</span>
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="h-auto py-4 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed rounded-xl"
                  >
                    <MessageSquare className="w-6 h-6" />
                    <span className="font-medium">Chat with Doctor</span>
                    <span className="text-xs opacity-75">(Book appointment first)</span>
                  </Button>
                )}

                <Button
                  onClick={() => navigate('/#emergency')}
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl"
                >
                  <AlertTriangle className="w-6 h-6" />
                  <span className="font-medium">Emergency SOS</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5 mt-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <TabsTrigger value="overview" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Activity className="w-4 h-4" />
              <span className="font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Records</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            {/* Today's Appointments Alert */}
            {todayAppointments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-medical-blue-50 to-medical-blue-100 dark:from-medical-blue-900/20 dark:to-medical-blue-800/20 border-l-4 border-medical-blue-600 p-4 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-medical-blue-200 dark:bg-medical-blue-800 rounded-lg">
                    <Bell className="w-5 h-5 text-medical-blue-700 dark:text-medical-blue-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      You have {todayAppointments.length} appointment{todayAppointments.length > 1 ? 's' : ''} today
                    </h3>
                    <div className="space-y-2">
                      {todayAppointments.map((apt: Appointment) => (
                        <div key={apt._id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{apt.doctorName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{apt.time} - {apt.department}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleChatWithDoctor(apt.doctorId, apt.doctorName, apt._id)}
                            className="bg-medical-blue-600 hover:bg-medical-blue-700 relative rounded-lg"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Chat
                            {unreadMessages[apt._id] && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Upcoming Appointments */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-medical-blue-100 dark:bg-medical-blue-900/30 rounded-lg">
                        <Calendar className="w-5 h-5 text-medical-blue-600" />
                      </div>
                      Upcoming Appointments
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-72">
                    <div className="space-y-3 pr-2">
                      {upcomingAppointments.map((appointment: Appointment) => (
                        <motion.div
                          key={appointment._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">{appointment.doctorName}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.department}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(appointment.status)} rounded-lg`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(appointment.status)}
                                <span className="text-xs">{appointment.status}</span>
                              </div>
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChatWithDoctor(appointment.doctorId, appointment.doctorName, appointment._id)}
                            className="w-full text-xs relative rounded-lg"
                          >
                            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                            Chat with Doctor
                            {unreadMessages[appointment._id] && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            )}
                          </Button>
                        </motion.div>
                      ))}
                      {upcomingAppointments.length === 0 && (
                        <div className="text-center py-8">
                          <Stethoscope className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400">No upcoming appointments</p>
                          <Button
                            size="sm"
                            onClick={() => navigate('/#appointments')}
                            className="mt-3 bg-medical-blue-600 hover:bg-medical-blue-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Book Appointment
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recent Medical Records */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <FileText className="w-5 h-5 text-medical-green-600" />
                    </div>
                    Recent Medical Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-72">
                    <div className="space-y-3 pr-2">
                      {recentRecords.map((record: MedicalRecord) => (
                        <motion.div
                          key={record._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{record.doctorName}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {record.doctorSpecialization || 'General Medicine'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {new Date(record.date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {record.time}
                              </p>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-gray-700 dark:text-gray-300 font-medium">{record.diagnosis}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs mt-3 rounded-lg"
                            onClick={() => setSelectedRecord(record)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            View Details
                          </Button>
                        </motion.div>
                      ))}
                      {recentRecords.length === 0 && (
                        <div className="text-center py-10">
                          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">No medical records available</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Records will appear after consultations</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Daily Health Tips */}
              <Card className="bg-gradient-to-br from-white to-red-50/30 dark:from-gray-800 dark:to-red-900/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                    Daily Health Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 gap-3">
                    {(() => {
                      const allTips = [
                        { icon: '💧', title: 'Stay Hydrated', text: 'Drink at least 8 glasses of water daily to keep your body functioning optimally.', color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800' },
                        { icon: '🏃', title: 'Move Your Body', text: '30 minutes of moderate exercise daily can boost your mood and energy levels.', color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' },
                        { icon: '😴', title: 'Quality Sleep', text: 'Aim for 7-8 hours of sleep. Good rest improves memory and immune function.', color: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800' },
                        { icon: '🥗', title: 'Eat Balanced', text: 'Include colorful fruits and vegetables in every meal for essential nutrients.', color: 'from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800' },
                        { icon: '🧘', title: 'Manage Stress', text: 'Practice deep breathing or meditation for 5-10 minutes daily.', color: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-800' },
                        { icon: '☀️', title: 'Get Sunlight', text: '15-20 minutes of morning sunlight helps regulate your sleep cycle.', color: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800' },
                        { icon: '🚶', title: 'Take Breaks', text: 'Stand up and stretch every hour if you have a desk job.', color: 'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border-sky-200 dark:border-sky-800' },
                        { icon: '🍎', title: 'Healthy Snacking', text: 'Choose nuts, fruits, or yogurt over processed snacks.', color: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800' },
                        { icon: '💪', title: 'Stay Active', text: 'Take stairs instead of elevators when possible.', color: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800' },
                        { icon: '🧠', title: 'Mental Health', text: 'Connect with friends and family regularly for emotional wellbeing.', color: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-800' },
                        { icon: '🦷', title: 'Oral Health', text: 'Brush twice daily and floss to prevent dental issues.', color: 'from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 border-cyan-200 dark:border-cyan-800' },
                        { icon: '👁️', title: 'Eye Care', text: 'Follow the 20-20-20 rule: every 20 mins, look 20 feet away for 20 seconds.', color: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200 dark:border-violet-800' }
                      ];
                      const today = new Date();
                      const seed = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
                      const shuffled = [...allTips].sort(() => (seed % 7) - 3);
                      return shuffled.slice(0, 4);
                    })().map((tip, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 bg-gradient-to-r ${tip.color} rounded-xl border hover:shadow-md transition-all duration-200 cursor-default`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-2xl">{tip.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{tip.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{tip.text}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Appointments</CardTitle>
                  <Button onClick={() => navigate('/#appointments')} className="bg-medical-blue-600 hover:bg-medical-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments?.map((appointment: Appointment) => (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg hover:shadow-lg transition-all ${
                        appointment.status === 'cancelled' 
                          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800">
                              {appointment.doctorName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{appointment.doctorName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.department}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </p>
                            <Badge className={`${getStatusColor(appointment.status)} mt-2`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(appointment.status)}
                                <span>{appointment.status}</span>
                              </div>
                            </Badge>
                            {/* Show cancellation reason if cancelled */}
                            {appointment.status === 'cancelled' && appointment.cancellationReason && (
                              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-sm">
                                <p className="text-red-800 dark:text-red-200 font-medium flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Cancellation Reason:
                                </p>
                                <p className="text-red-700 dark:text-red-300 mt-1">{appointment.cancellationReason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {appointment.status !== 'cancelled' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleChatWithDoctor(appointment.doctorId, appointment.doctorName, appointment._id)}
                                className="bg-medical-blue-600 hover:bg-medical-blue-700 relative"
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Chat with Doctor
                                {unreadMessages[appointment._id] && (
                                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                )}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setSelectedAppointment(appointment)}>
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                            </>
                          )}
                          {appointment.status === 'cancelled' && (
                            <Button
                              size="sm"
                              onClick={() => navigate('/#appointments')}
                              className="bg-medical-blue-600 hover:bg-medical-blue-700"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Rebook
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )) || (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No appointments found</p>
                        <Button onClick={() => navigate('/#appointments')} className="bg-medical-blue-600 hover:bg-medical-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Book Your First Appointment
                        </Button>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Medical Records</CardTitle>
                  <Button 
                    variant="outline"
                    onClick={handleDownloadAllPDFs}
                    disabled={!medicalRecords || medicalRecords.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalRecords?.map((record: MedicalRecord) => (
                    <motion.div
                      key={record._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all"
                    >
                      {/* Header with Doctor Info and Date/Time */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-medical-green-100 to-medical-blue-100 dark:from-medical-green-900/20 dark:to-medical-blue-900/20 rounded-lg flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-medical-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{record.doctorName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {record.doctorSpecialization || 'General Medicine'} • {record.doctorDepartment || 'General'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{record.time}</span>
                          </div>
                          {record.consultationType && (
                            <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {record.consultationType}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Consultation Details */}
                      <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                        {/* Chief Complaint */}
                        {record.chiefComplaint && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                              Chief Complaint
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">{record.chiefComplaint}</p>
                          </div>
                        )}

                        {/* Diagnosis */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            Diagnosis
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">{record.diagnosis || 'No diagnosis recorded'}</p>
                        </div>

                        {/* Treatment Plan */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            Treatment Plan
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">{record.treatment || 'No treatment plan recorded'}</p>
                        </div>

                        {/* Vital Signs */}
                        {record.vitalSigns && (
                          (record.vitalSigns.bloodPressure?.systolic && record.vitalSigns.bloodPressure?.diastolic) || 
                          record.vitalSigns.heartRate || 
                          record.vitalSigns.temperature ||
                          record.vitalSigns.oxygenSaturation ||
                          record.vitalSigns.weight
                        ) && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-green-500" />
                              Vital Signs
                            </p>
                            <div className="flex flex-wrap gap-3 ml-6 mt-1">
                              {record.vitalSigns.bloodPressure?.systolic && record.vitalSigns.bloodPressure?.diastolic && (
                                <span className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded">
                                  BP: {record.vitalSigns.bloodPressure.systolic}/{record.vitalSigns.bloodPressure.diastolic} mmHg
                                </span>
                              )}
                              {record.vitalSigns.heartRate && (
                                <span className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded">
                                  HR: {record.vitalSigns.heartRate} bpm
                                </span>
                              )}
                              {record.vitalSigns.temperature && (
                                <span className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded">
                                  Temp: {record.vitalSigns.temperature}°F
                                </span>
                              )}
                              {record.vitalSigns.oxygenSaturation && (
                                <span className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded">
                                  O2: {record.vitalSigns.oxygenSaturation}%
                                </span>
                              )}
                              {record.vitalSigns.weight && (
                                <span className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded">
                                  Weight: {record.vitalSigns.weight} kg
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Prescriptions Summary */}
                        {record.prescriptions && record.prescriptions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Pill className="w-4 h-4 text-purple-500" />
                              Prescriptions ({record.prescriptions.length})
                            </p>
                            <div className="ml-6 mt-1 space-y-1">
                              {record.prescriptions.slice(0, 3).map((rx, idx) => (
                                <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                  • {rx.medication} - {rx.dosage}, {rx.frequency}
                                </p>
                              ))}
                              {record.prescriptions.length > 3 && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  +{record.prescriptions.length - 3} more
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Lab Orders Summary */}
                        {record.labOrders && record.labOrders.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-cyan-500" />
                              Lab Orders ({record.labOrders.length})
                            </p>
                            <div className="ml-6 mt-1 space-y-1">
                              {record.labOrders.slice(0, 3).map((lab, idx) => (
                                <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                  • {lab.testName} - <span className={lab.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>{lab.status}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow-up */}
                        {record.followUp?.required && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                              <Bell className="w-4 h-4" />
                              Follow-up Required
                            </p>
                            {record.followUp.date && (
                              <p className="text-xs text-yellow-700 dark:text-yellow-300 ml-6">
                                Scheduled: {new Date(record.followUp.date).toLocaleDateString()}
                              </p>
                            )}
                            {record.followUp.reason && (
                              <p className="text-xs text-yellow-700 dark:text-yellow-300 ml-6">
                                Reason: {record.followUp.reason}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {record.notes && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Doctor's Notes:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">{record.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Full Record
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(record)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )) || (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No medical records available</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          Medical records will appear here after your consultations
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Medical Record Detail Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Medical Record</h2>
                    <p className="text-blue-100">
                      {selectedRecord.doctorName} • {new Date(selectedRecord.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRecord(null)}
                    className="text-white hover:bg-white/20"
                  >
                    <XCircle className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {/* Doctor & Visit Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{selectedRecord.doctorName}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{selectedRecord.doctorSpecialization} • {selectedRecord.doctorDepartment}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedRecord.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="text-gray-600 dark:text-gray-400">{selectedRecord.time}</p>
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      Chief Complaint
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">{selectedRecord.chiefComplaint || selectedRecord.consultationType || 'General Consultation'}</p>
                  </div>

                  {/* Vital Signs */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                      <Activity className="w-5 h-5 text-green-500" />
                      Vital Signs
                    </h4>
                    {selectedRecord.vitalSigns && (
                      selectedRecord.vitalSigns.bloodPressure?.systolic ||
                      selectedRecord.vitalSigns.heartRate ||
                      selectedRecord.vitalSigns.temperature ||
                      selectedRecord.vitalSigns.oxygenSaturation ||
                      selectedRecord.vitalSigns.weight
                    ) ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedRecord.vitalSigns.bloodPressure?.systolic && selectedRecord.vitalSigns.bloodPressure?.diastolic && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                            <p className="text-2xl font-bold text-red-600">{selectedRecord.vitalSigns.bloodPressure.systolic}/{selectedRecord.vitalSigns.bloodPressure.diastolic}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Blood Pressure (mmHg)</p>
                          </div>
                        )}
                        {selectedRecord.vitalSigns.heartRate && (
                          <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-center">
                            <p className="text-2xl font-bold text-pink-600">{selectedRecord.vitalSigns.heartRate}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Heart Rate (bpm)</p>
                          </div>
                        )}
                        {selectedRecord.vitalSigns.temperature && (
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                            <p className="text-2xl font-bold text-orange-600">{selectedRecord.vitalSigns.temperature}°F</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
                          </div>
                        )}
                        {selectedRecord.vitalSigns.oxygenSaturation && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">{selectedRecord.vitalSigns.oxygenSaturation}%</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">O2 Saturation</p>
                          </div>
                        )}
                        {selectedRecord.vitalSigns.weight && (
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                            <p className="text-2xl font-bold text-purple-600">{selectedRecord.vitalSigns.weight} kg</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
                          </div>
                        )}
                        {selectedRecord.vitalSigns.height && (
                          <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-center">
                            <p className="text-2xl font-bold text-teal-600">{selectedRecord.vitalSigns.height} cm</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Height</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">No vital signs recorded</p>
                    )}
                  </div>

                  {/* Diagnosis */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      Diagnosis
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">{selectedRecord.diagnosis || 'No diagnosis recorded'}</p>
                  </div>

                  {/* Treatment Plan */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Treatment Plan
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">{selectedRecord.treatment || 'No treatment plan recorded'}</p>
                  </div>

                  {/* Prescriptions */}
                  {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                        <Pill className="w-5 h-5 text-purple-500" />
                        Prescriptions ({selectedRecord.prescriptions.length})
                      </h4>
                      <div className="space-y-3">
                        {selectedRecord.prescriptions.map((rx, idx) => (
                          <div key={idx} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <p className="font-medium text-gray-900 dark:text-white">{rx.medication}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {rx.dosage && `${rx.dosage} • `}{rx.frequency && `${rx.frequency} • `}{rx.duration}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up */}
                  {selectedRecord.followUp?.required && (
                    <div className="p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 flex items-center gap-2 mb-2">
                        <Bell className="w-5 h-5" />
                        Follow-up Required
                      </h4>
                      {selectedRecord.followUp.date && (
                        <p className="text-yellow-700 dark:text-yellow-300">Date: {new Date(selectedRecord.followUp.date).toLocaleDateString()}</p>
                      )}
                      {selectedRecord.followUp.reason && (
                        <p className="text-yellow-700 dark:text-yellow-300">Reason: {selectedRecord.followUp.reason}</p>
                      )}
                    </div>
                  )}

                  {/* Doctor's Notes */}
                  {selectedRecord.notes && (
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                        <Stethoscope className="w-5 h-5 text-gray-500" />
                        Doctor's Notes
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 italic">{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-gray-800">
                <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleDownloadPDF(selectedRecord)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAppointment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`p-6 text-white flex-shrink-0 rounded-t-2xl ${
                selectedAppointment.status === 'completed' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                selectedAppointment.status === 'cancelled' ? 'bg-gradient-to-r from-red-600 to-rose-600' :
                selectedAppointment.status === 'scheduled' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
                'bg-gradient-to-r from-yellow-600 to-orange-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Appointment Details</h2>
                    <p className="text-white/80">
                      {new Date(selectedAppointment.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAppointment(null)}
                    className="text-white hover:bg-white/20"
                  >
                    <XCircle className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 text-xl">
                        {selectedAppointment.doctorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{selectedAppointment.doctorName}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{selectedAppointment.department}</p>
                    </div>
                  </div>

                  {/* Appointment Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Date</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedAppointment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Time</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAppointment.time}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status</span>
                      <Badge className={getStatusColor(selectedAppointment.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedAppointment.status)}
                          <span className="capitalize">{selectedAppointment.status}</span>
                        </div>
                      </Badge>
                    </div>
                  </div>

                  {/* Appointment Type */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {selectedAppointment.type || 'Consultation'}
                      </span>
                    </div>
                  </div>

                  {/* Cancellation Reason if cancelled */}
                  {selectedAppointment.status === 'cancelled' && selectedAppointment.cancellationReason && (
                    <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium">Cancellation Reason</span>
                      </div>
                      <p className="text-red-700 dark:text-red-300">{selectedAppointment.cancellationReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 flex justify-end gap-3 flex-shrink-0 bg-white dark:bg-gray-800">
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                  Close
                </Button>
                {selectedAppointment.status !== 'cancelled' && (
                  <Button
                    className="bg-medical-blue-600 hover:bg-medical-blue-700"
                    onClick={() => {
                      handleChatWithDoctor(selectedAppointment.doctorId, selectedAppointment.doctorName, selectedAppointment._id);
                      setSelectedAppointment(null);
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with Doctor
                  </Button>
                )}
                {selectedAppointment.status === 'cancelled' && (
                  <Button
                    className="bg-medical-blue-600 hover:bg-medical-blue-700"
                    onClick={() => {
                      navigate('/#appointments');
                      setSelectedAppointment(null);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Rebook Appointment
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && selectedDoctor && user && (
          <ChatWindow
            conversationId={selectedDoctor.appointmentId ? `appointment-${selectedDoctor.appointmentId}` : `patient-${user._id}-doctor-${selectedDoctor.id}`}
            receiverId={selectedDoctor.id}
            receiverName={selectedDoctor.name}
            currentUserId={user._id}
            currentUserName={user.name}
            currentUserRole={user.role}
            onClose={() => setShowChat(false)}
            onVideoCall={() => {
              // Video call functionality removed - chat only
              console.log('Video call feature disabled');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDashboard;