import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '@/services/doctorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  UserPlus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  Calendar,
  User,
  FileText,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Referral {
  _id: string;
  patientId: string;
  patientName: string;
  specialistId: string;
  specialistName: string;
  specialistSpecialty: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'sent' | 'accepted' | 'completed' | 'cancelled';
  referralDate: string;
  appointmentDate?: string;
  notes?: string;
  feedback?: string;
}

interface Specialist {
  _id: string;
  name: string;
  specialty: string;
  hospital: string;
  contactNumber: string;
  email: string;
  availability: string;
  rating: number;
  totalReferrals: number;
  isActive: boolean;
}

const ReferralManagement: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'referrals' | 'specialists' | 'feedback'>('referrals');
  const queryClient = useQueryClient();

  const { data: referrals, isLoading: referralsLoading } = useQuery<Referral[]>({
    queryKey: ['referrals'],
    queryFn: () => doctorService.getReferrals?.() || Promise.resolve([]),
  });

  const { data: specialists, isLoading: specialistsLoading } = useQuery<Specialist[]>({
    queryKey: ['specialists'],
    queryFn: () => doctorService.getSpecialists?.() || Promise.resolve([]),
  });

  const { data: feedback, isLoading: feedbackLoading } = useQuery<any[]>({
    queryKey: ['referralFeedback'],
    queryFn: () => doctorService.getReferralFeedback?.() || Promise.resolve([]),
  });

  const createReferralMutation = useMutation({
    mutationFn: (referralData: any) => doctorService.createReferral?.(referralData) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });

  const updateReferralStatusMutation = useMutation({
    mutationFn: (data: { referralId: string; status: string }) => 
      doctorService.updateReferralStatus?.(data) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });

  if (referralsLoading || specialistsLoading || feedbackLoading) return <div>Loading referral data...</div>;

  const allReferrals = referrals || [];
  const allSpecialists = specialists || [];
  const allFeedback = feedback || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'sent':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'routine':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleCreateReferral = (specialist: Specialist) => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    
    createReferralMutation.mutate({
      patientId: selectedPatient,
      specialistId: specialist._id,
      reason: 'General consultation',
      urgency: 'routine',
      notes: ''
    });
  };

  const handleUpdateStatus = (referralId: string, status: string) => {
    updateReferralStatusMutation.mutate({ referralId, status });
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
                <UserPlus className="w-5 h-5 text-medical-blue-600" />
                Referral Management
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  View All
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-1">
              <Button
                variant={activeTab === 'referrals' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('referrals')}
                className="flex-1"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Referrals ({allReferrals.length})
              </Button>
              <Button
                variant={activeTab === 'specialists' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('specialists')}
                className="flex-1"
              >
                <User className="w-4 h-4 mr-1" />
                Specialists ({allSpecialists.length})
              </Button>
              <Button
                variant={activeTab === 'feedback' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('feedback')}
                className="flex-1"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Feedback ({allFeedback.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search referrals, specialists, or patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content based on active tab */}
      {activeTab === 'referrals' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-medical-green-600" />
                Patient Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allReferrals.map((referral) => (
                    <div key={referral._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                            {referral.patientName?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{referral.patientName}</h4>
                            <Badge className={getStatusColor(referral.status)}>
                              {referral.status}
                            </Badge>
                            <Badge className={getUrgencyColor(referral.urgency)}>
                              {referral.urgency}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            To: Dr. {referral.specialistName} ({referral.specialistSpecialty})
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Reason: {referral.reason}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Referred: {new Date(referral.referralDate).toLocaleDateString()}
                            {referral.appointmentDate && ` • Appointment: ${new Date(referral.appointmentDate).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {referral.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateStatus(referral._id, 'sent')}
                            disabled={updateReferralStatusMutation.isPending}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Send
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'specialists' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-medical-purple-600" />
                Specialist Directory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allSpecialists.map((specialist) => (
                    <div key={specialist._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">Dr. {specialist.name}</h4>
                            <Badge variant={specialist.isActive ? 'outline' : 'secondary'}>
                              {specialist.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{specialist.specialty}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{specialist.hospital}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Rating:</span>
                              <span className="text-sm font-medium">{specialist.rating}/5</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Referrals:</span>
                              <span className="text-sm font-medium">{specialist.totalReferrals}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Availability: {specialist.availability}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleCreateReferral(specialist)}
                            disabled={!selectedPatient}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Refer
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Contact
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
      )}

      {activeTab === 'feedback' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-medical-orange-600" />
                Referral Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allFeedback.map((item) => (
                    <div key={item._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{item.patientName}</h4>
                            <Badge variant="outline">
                              {item.specialistName}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.feedback}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Received: {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Reply
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
      )}

      {/* Quick Referral Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-medical-orange-600" />
              Quick Referral Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
                <Input placeholder="Select patient..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Specialist</label>
                <Input placeholder="Search specialist..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Specialty</label>
                <select className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                  <option value="">Select specialty...</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="neurology">Neurology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="psychiatry">Psychiatry</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Urgency</label>
                <select className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Referral</label>
                <Textarea placeholder="Describe the reason for referral..." className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes</label>
                <Textarea placeholder="Any additional information..." className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Button className="w-full">
                  <Send className="w-4 h-4 mr-1" />
                  Create Referral
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReferralManagement; 