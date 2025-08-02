import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/services/doctorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Heart, 
  Pill, 
  AlertTriangle, 
  Shield,
  Activity,
  Calendar,
  Download,
  Eye,
  Plus,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';

interface VitalSigns {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  bmi: number;
  oxygenSaturation: number;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'discontinued' | 'completed';
}

interface Allergy {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
}

interface Immunization {
  name: string;
  date: string;
  nextDue?: string;
  status: 'completed' | 'due' | 'overdue';
}

interface MedicalRecord {
  _id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  visitDate: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentPlan: string;
  vitalSigns: VitalSigns;
  medications: Medication[];
  allergies: Allergy[];
  immunizations: Immunization[];
  chronicConditions: string[];
  notes: string;
}

const EHRSummary: React.FC = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const { data: medicalRecord, isLoading, error } = useQuery<MedicalRecord>({
    queryKey: ['patientRecords', selectedPatientId],
    queryFn: () => doctorService.getPatientRecords(selectedPatientId),
    enabled: !!selectedPatientId,
  });

  if (!selectedPatientId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Patient Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Select a patient from the patient list to view their medical records
            </p>
            <Button variant="outline">
              Select Patient
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) return <div>Loading patient records...</div>;
  if (error) return <div>Error loading patient records</div>;

  const record = medicalRecord || {
    _id: '',
    patientId: '',
    patientName: 'Sample Patient',
    patientAge: 35,
    patientGender: 'Male',
    visitDate: new Date().toISOString(),
    chiefComplaint: 'Sample complaint',
    diagnosis: 'Sample diagnosis',
    treatmentPlan: 'Sample treatment',
    vitalSigns: {
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 98.6,
      weight: 70,
      height: 175,
      bmi: 22.9,
      oxygenSaturation: 98
    },
    medications: [],
    allergies: [],
    immunizations: [],
    chronicConditions: [],
    notes: ''
  };

  const getVitalStatus = (value: number, normalRange: [number, number], unit: string) => {
    const [min, max] = normalRange;
    if (value < min) return { status: 'low', color: 'text-blue-600', icon: <TrendingDown className="w-4 h-4" /> };
    if (value > max) return { status: 'high', color: 'text-red-600', icon: <TrendingUp className="w-4 h-4" /> };
    return { status: 'normal', color: 'text-green-600', icon: <Activity className="w-4 h-4" /> };
  };

  const getMedicationStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'discontinued':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getImmunizationStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'due':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-medical-blue-100 text-medical-blue-800 dark:bg-medical-blue-900 dark:text-medical-blue-200 text-lg">
                    {record.patientName?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{record.patientName}</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {record.patientAge} years • {record.patientGender} • ID: {record.patientId}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(record.visitDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Full
                </Button>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Record
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Vital Signs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-medical-green-600" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  {getVitalStatus(record.vitalSigns.heartRate, [60, 100], 'bpm').icon}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{record.vitalSigns.heartRate}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Heart Rate (bpm)</p>
                <p className={`text-xs ${getVitalStatus(record.vitalSigns.heartRate, [60, 100], 'bpm').color}`}>
                  {getVitalStatus(record.vitalSigns.heartRate, [60, 100], 'bpm').status}
                </p>
              </div>

              <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  {getVitalStatus(record.vitalSigns.bloodPressure.split('/')[0] as any, [90, 140], 'mmHg').icon}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{record.vitalSigns.bloodPressure}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Blood Pressure</p>
                <p className="text-xs text-green-600">Normal</p>
              </div>

              <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  {getVitalStatus(record.vitalSigns.temperature, [97, 99], '°F').icon}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{record.vitalSigns.temperature}°F</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
                <p className={`text-xs ${getVitalStatus(record.vitalSigns.temperature, [97, 99], '°F').color}`}>
                  {getVitalStatus(record.vitalSigns.temperature, [97, 99], '°F').status}
                </p>
              </div>

              <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  {getVitalStatus(record.vitalSigns.oxygenSaturation, [95, 100], '%').icon}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{record.vitalSigns.oxygenSaturation}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">O2 Saturation</p>
                <p className={`text-xs ${getVitalStatus(record.vitalSigns.oxygenSaturation, [95, 100], '%').color}`}>
                  {getVitalStatus(record.vitalSigns.oxygenSaturation, [95, 100], '%').status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chronic Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Chronic Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {record.chronicConditions.length > 0 ? (
                  record.chronicConditions.map((condition, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-gray-900 dark:text-white">{condition}</span>
                      </div>
                      <Badge variant="destructive">Active</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No chronic conditions recorded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Medications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-medical-blue-600" />
                Active Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {record.medications.filter(med => med.status === 'active').length > 0 ? (
                    record.medications.filter(med => med.status === 'active').map((medication, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{medication.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {medication.dosage} • {medication.frequency}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Started: {new Date(medication.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getMedicationStatusColor(medication.status)}>
                          {medication.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No active medications
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Allergies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {record.allergies.length > 0 ? (
                  record.allergies.map((allergy, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{allergy.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{allergy.reaction}</p>
                      </div>
                      <Badge variant={allergy.severity === 'severe' ? 'destructive' : 'outline'}>
                        {allergy.severity}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No allergies recorded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Immunizations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-medical-green-600" />
                Immunizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {record.immunizations.length > 0 ? (
                    record.immunizations.map((immunization, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{immunization.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Date: {new Date(immunization.date).toLocaleDateString()}
                          </p>
                          {immunization.nextDue && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Next due: {new Date(immunization.nextDue).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge className={getImmunizationStatusColor(immunization.status)}>
                          {immunization.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No immunizations recorded
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Latest Diagnosis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-medical-purple-600" />
              Latest Diagnosis & Treatment Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Chief Complaint</h4>
                <p className="text-gray-700 dark:text-gray-300">{record.chiefComplaint}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Diagnosis</h4>
                <p className="text-gray-700 dark:text-gray-300">{record.diagnosis}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Treatment Plan</h4>
                <p className="text-gray-700 dark:text-gray-300">{record.treatmentPlan}</p>
              </div>
              {record.notes && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h4>
                  <p className="text-gray-700 dark:text-gray-300">{record.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EHRSummary; 