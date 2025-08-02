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
  Pill, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Prescription {
  _id: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: 'active' | 'completed' | 'discontinued' | 'refill_requested';
  prescribedDate: string;
  refillDate?: string;
  refillCount: number;
  maxRefills: number;
  notes?: string;
  hasInteractions: boolean;
  interactions?: string[];
}

interface Medication {
  _id: string;
  name: string;
  genericName: string;
  category: string;
  dosageForms: string[];
  commonDosages: string[];
  interactions: string[];
  sideEffects: string[];
  contraindications: string[];
}

const PrescriptionManagement: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'refills' | 'completed' | 'medications'>('active');
  const queryClient = useQueryClient();

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery<Prescription[]>({
    queryKey: ['prescriptions'],
    queryFn: () => doctorService.getPrescriptions?.() || Promise.resolve([]),
  });

  const { data: medications, isLoading: medicationsLoading } = useQuery<Medication[]>({
    queryKey: ['medications'],
    queryFn: () => doctorService.getMedications?.() || Promise.resolve([]),
  });

  const { data: refillRequests, isLoading: refillsLoading } = useQuery<any[]>({
    queryKey: ['refillRequests'],
    queryFn: () => doctorService.getRefillRequests?.() || Promise.resolve([]),
  });

  const approveRefillMutation = useMutation({
    mutationFn: (prescriptionId: string) => doctorService.approveRefill?.(prescriptionId) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['refillRequests'] });
    },
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: (prescriptionData: any) => doctorService.createPrescription?.(prescriptionData) || Promise.resolve({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });

  if (prescriptionsLoading || medicationsLoading || refillsLoading) return <div>Loading prescription data...</div>;

  const allPrescriptions = prescriptions || [];
  const allMedications = medications || [];
  const allRefillRequests = refillRequests || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'discontinued':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refill_requested':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleApproveRefill = (prescriptionId: string) => {
    approveRefillMutation.mutate(prescriptionId);
  };

  const handleCreatePrescription = (medication: Medication) => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    
    createPrescriptionMutation.mutate({
      patientId: selectedPatient,
      medicationName: medication.name,
      dosage: medication.commonDosages[0] || 'As prescribed',
      frequency: 'Once daily',
      duration: '30 days',
      notes: ''
    });
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
                <Pill className="w-5 h-5 text-medical-blue-600" />
                Prescription Management
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
                variant={activeTab === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('active')}
                className="flex-1"
              >
                <Pill className="w-4 h-4 mr-1" />
                Active ({allPrescriptions.filter(p => p.status === 'active').length})
              </Button>
              <Button
                variant={activeTab === 'refills' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('refills')}
                className="flex-1"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Refills ({allRefillRequests.length})
              </Button>
              <Button
                variant={activeTab === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('completed')}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Completed ({allPrescriptions.filter(p => p.status === 'completed').length})
              </Button>
              <Button
                variant={activeTab === 'medications' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('medications')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-1" />
                Medications ({allMedications.length})
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
                  placeholder="Search prescriptions, medications, or patients..."
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
      {activeTab === 'active' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-medical-green-600" />
                Active Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allPrescriptions.filter(p => p.status === 'active').map((prescription) => (
                    <div key={prescription._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200">
                            {prescription.patientName?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{prescription.medicationName}</h4>
                            <Badge className={getStatusColor(prescription.status)}>
                              {prescription.status}
                            </Badge>
                            {prescription.hasInteractions && (
                              <Badge variant="destructive" className="text-xs">
                                ⚠️ Interactions
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Patient: {prescription.patientName} • Prescribed: {new Date(prescription.prescribedDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Refills: {prescription.refillCount}/{prescription.maxRefills}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Send className="w-4 h-4 mr-1" />
                          E-Prescribe
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

      {activeTab === 'refills' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-medical-orange-600" />
                Refill Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allRefillRequests.map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            {request.patientName?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{request.medicationName}</h4>
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Refill Requested
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Patient: {request.patientName} • Requested: {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Current refills: {request.currentRefills}/{request.maxRefills}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveRefill(request.prescriptionId)}
                          disabled={approveRefillMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
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

      {activeTab === 'medications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-medical-purple-600" />
                Medication Directory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allMedications.map((medication) => (
                    <div key={medication._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{medication.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{medication.genericName}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {medication.category}
                            </Badge>
                            {medication.interactions.length > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                ⚠️ {medication.interactions.length} interactions
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Common dosages: {medication.commonDosages.join(', ')}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Forms: {medication.dosageForms.join(', ')}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleCreatePrescription(medication)}
                          disabled={!selectedPatient}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Prescribe
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

      {/* Quick Prescription Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-medical-orange-600" />
              Quick Prescription Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
                <Input placeholder="Select patient..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Medication</label>
                <Input placeholder="Search medication..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dosage</label>
                <Input placeholder="e.g., 500mg" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
                <select className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                  <option value="once_daily">Once daily</option>
                  <option value="twice_daily">Twice daily</option>
                  <option value="three_times_daily">Three times daily</option>
                  <option value="as_needed">As needed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                <Input placeholder="e.g., 30 days" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Refills</label>
                <Input type="number" placeholder="0" className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <Textarea placeholder="Additional instructions..." className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Button className="w-full">
                  <Send className="w-4 h-4 mr-1" />
                  Create Prescription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PrescriptionManagement; 