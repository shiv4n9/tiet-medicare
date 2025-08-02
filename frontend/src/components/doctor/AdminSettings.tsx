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
  Settings, 
  Calendar, 
  Clock, 
  Star,
  Plus,
  Edit,
  Save,
  User,
  FileText,
  Bell,
  Shield,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DoctorProfile {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  department: string;
  experience: number;
  education: string[];
  certifications: string[];
  consultationFee: number;
  rating: number;
  totalRatings: number;
  totalPatients: number;
  totalConsultations: number;
}

interface Availability {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxPatients: number;
}

interface LeaveRequest {
  _id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'vacation' | 'sick' | 'personal' | 'conference';
}

interface PatientFeedback {
  _id: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  isAnonymous: boolean;
}

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'availability' | 'leave' | 'feedback'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery<DoctorProfile>({
    queryKey: ['doctorProfile'],
    queryFn: () => doctorService.getDoctorProfile?.() || Promise.resolve({} as DoctorProfile),
  });

  const { data: availability, isLoading: availabilityLoading } = useQuery<Availability[]>({
    queryKey: ['doctorAvailability'],
    queryFn: () => doctorService.getDoctorAvailability?.() || Promise.resolve([]),
  });

  const { data: leaveRequests, isLoading: leaveLoading } = useQuery<LeaveRequest[]>({
    queryKey: ['leaveRequests'],
    queryFn: () => doctorService.getLeaveRequests?.() || Promise.resolve([]),
  });

  const { data: feedback, isLoading: feedbackLoading } = useQuery<PatientFeedback[]>({
    queryKey: ['patientFeedback'],
    queryFn: () => doctorService.getPatientFeedback?.() || Promise.resolve([]),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: any) => doctorService.updateDoctorProfile?.(profileData) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorProfile'] });
      setIsEditing(false);
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: (availabilityData: any) => doctorService.updateAvailability?.(availabilityData) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAvailability'] });
    },
  });

  const createLeaveRequestMutation = useMutation({
    mutationFn: (leaveData: any) => doctorService.createLeaveRequest?.(leaveData) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
  });

  if (profileLoading || availabilityLoading || leaveLoading || feedbackLoading) return <div>Loading settings data...</div>;

  const doctorProfile = profile || {} as DoctorProfile;
  const allAvailability = availability || [];
  const allLeaveRequests = leaveRequests || [];
  const allFeedback = feedback || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'sick':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'personal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'conference':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleSaveProfile = (profileData: any) => {
    updateProfileMutation.mutate(profileData);
  };

  const handleUpdateAvailability = (availabilityData: any) => {
    updateAvailabilityMutation.mutate(availabilityData);
  };

  const handleCreateLeaveRequest = (leaveData: any) => {
    createLeaveRequestMutation.mutate(leaveData);
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
                <Settings className="w-5 h-5 text-medical-blue-600" />
                Admin & Settings
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Shield className="w-4 h-4 mr-1" />
                  Security
                </Button>
                <Button size="sm" variant="outline">
                  <Bell className="w-4 h-4 mr-1" />
                  Notifications
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
                variant={activeTab === 'profile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('profile')}
                className="flex-1"
              >
                <User className="w-4 h-4 mr-1" />
                Profile
              </Button>
              <Button
                variant={activeTab === 'availability' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('availability')}
                className="flex-1"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Availability
              </Button>
              <Button
                variant={activeTab === 'leave' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('leave')}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-1" />
                Leave ({allLeaveRequests.filter(l => l.status === 'pending').length})
              </Button>
              <Button
                variant={activeTab === 'feedback' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('feedback')}
                className="flex-1"
              >
                <Star className="w-4 h-4 mr-1" />
                Feedback ({allFeedback.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content based on active tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-medical-green-600" />
                  Doctor Profile
                </CardTitle>
                <Button 
                  size="sm" 
                  variant={isEditing ? 'default' : 'outline'}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <Save className="w-4 h-4 mr-1" /> : <Edit className="w-4 h-4 mr-1" />}
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <Input 
                      value={doctorProfile.name || ''} 
                      disabled={!isEditing}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <Input 
                      value={doctorProfile.email || ''} 
                      disabled={!isEditing}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Specialization</label>
                    <Input 
                      value={doctorProfile.specialization || ''} 
                      disabled={!isEditing}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">License Number</label>
                    <Input 
                      value={doctorProfile.licenseNumber || ''} 
                      disabled={!isEditing}
                      className="mt-1" 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                    <Input 
                      value={doctorProfile.department || ''} 
                      disabled={!isEditing}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Years of Experience</label>
                    <Input 
                      value={doctorProfile.experience || ''} 
                      disabled={!isEditing}
                      type="number"
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Consultation Fee</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input 
                        value={doctorProfile.consultationFee || ''} 
                        disabled={!isEditing}
                        type="number"
                        className="pl-8" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{doctorProfile.rating || 0}/5</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{doctorProfile.totalPatients || 0} patients</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'availability' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-medical-blue-600" />
                Availability Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allAvailability.map((slot) => (
                  <div key={slot._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-20">
                        <span className="font-medium text-gray-900 dark:text-white">{slot.day}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input 
                          value={slot.startTime} 
                          type="time"
                          className="w-24" 
                        />
                        <span className="text-gray-500">to</span>
                        <Input 
                          value={slot.endTime} 
                          type="time"
                          className="w-24" 
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Max patients:</span>
                        <Input 
                          value={slot.maxPatients} 
                          type="number"
                          className="w-16" 
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant={slot.isAvailable ? 'default' : 'outline'}
                      >
                        {slot.isAvailable ? 'Available' : 'Unavailable'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'leave' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-medical-orange-600" />
                Leave Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allLeaveRequests.map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={getLeaveTypeColor(request.type)}>
                              {request.type}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.reason}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              Cancel
                            </Button>
                          </>
                        )}
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
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-medical-purple-600" />
                Patient Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allFeedback.map((item) => (
                    <div key={item._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {item.isAnonymous ? 'Anonymous' : item.patientName}
                            </h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < item.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {item.comment}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(item.date).toLocaleDateString()}
                          </p>
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-medical-orange-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Request Leave</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                <Clock className="w-6 h-6" />
                <span className="text-sm">Update Hours</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                <CreditCard className="w-6 h-6" />
                <span className="text-sm">Billing</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
                <Shield className="w-6 h-6" />
                <span className="text-sm">Security</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminSettings; 