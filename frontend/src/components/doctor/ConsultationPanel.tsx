import { useState } from 'react';
import { X, Stethoscope, Activity, FileText, Pill, Heart, Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/services/api';

interface ConsultationPanelProps {
  appointment: {
    _id: string;
    patientName: string;
    patientAge: number;
    patientGender: string;
    time: string;
    service: string;
    status: string;
  };
  onClose: () => void;
  onComplete: () => void;
}

interface VitalSigns {
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  temperature: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
}

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Diagnosis {
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  isChronic: boolean;
}

const ConsultationPanel: React.FC<ConsultationPanelProps> = ({ appointment, onClose, onComplete }) => {
  const [isStarted, setIsStarted] = useState(appointment.status === 'in_progress');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [chiefComplaint, setChiefComplaint] = useState(appointment.service || '');
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: ''
  });
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([
    { condition: '', severity: 'moderate', isChronic: false }
  ]);
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpReason, setFollowUpReason] = useState('');

  const steps = [
    { id: 1, name: 'Vitals', icon: Activity },
    { id: 2, name: 'Diagnosis', icon: FileText },
    { id: 3, name: 'Treatment', icon: Heart },
    { id: 4, name: 'Prescription', icon: Pill },
    { id: 5, name: 'Notes', icon: Stethoscope }
  ];

  const handleStartConsultation = async () => {
    try {
      const response = await api.patch(`/appointments/${appointment._id}`, {
        status: 'in_progress',
        startedAt: new Date().toISOString()
      });
      setIsStarted(true);
      toast.success('Consultation started!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start consultation');
    }
  };

  const addDiagnosis = () => {
    setDiagnoses([...diagnoses, { condition: '', severity: 'moderate', isChronic: false }]);
  };

  const removeDiagnosis = (index: number) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index));
  };

  const updateDiagnosis = (index: number, field: keyof Diagnosis, value: any) => {
    const updated = [...diagnoses];
    updated[index] = { ...updated[index], [field]: value };
    setDiagnoses(updated);
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, {
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
    const updated = [...prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptions(updated);
  };

  const handleCompleteConsultation = async () => {
    if (!diagnoses.some(d => d.condition.trim())) {
      toast.error('Please add at least one diagnosis');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare consultation data
      const consultationData = {
        status: 'completed',
        completedAt: new Date().toISOString(),
        chiefComplaint,
        vitalSigns: {
          bloodPressure: {
            systolic: parseInt(vitalSigns.bloodPressureSystolic) || null,
            diastolic: parseInt(vitalSigns.bloodPressureDiastolic) || null
          },
          heartRate: parseInt(vitalSigns.heartRate) || null,
          temperature: parseFloat(vitalSigns.temperature) || null,
          respiratoryRate: parseInt(vitalSigns.respiratoryRate) || null,
          oxygenSaturation: parseInt(vitalSigns.oxygenSaturation) || null,
          weight: parseFloat(vitalSigns.weight) || null,
          height: parseFloat(vitalSigns.height) || null
        },
        diagnosis: diagnoses.filter(d => d.condition.trim()),
        treatmentPlan,
        prescriptions: prescriptions.filter(p => p.medication.trim()),
        notes: doctorNotes,
        followUp: {
          required: followUpRequired,
          date: followUpDate || null,
          reason: followUpReason || null
        }
      };

      await api.patch(`/appointments/${appointment._id}`, consultationData);
      
      toast.success('Consultation completed successfully!');
      onComplete();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete consultation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Vitals
        return (
          <div className="space-y-4">
            <div>
              <Label>Chief Complaint</Label>
              <Input
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Primary reason for visit"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Blood Pressure (Systolic)</Label>
                <Input
                  type="number"
                  value={vitalSigns.bloodPressureSystolic}
                  onChange={(e) => setVitalSigns({...vitalSigns, bloodPressureSystolic: e.target.value})}
                  placeholder="120"
                />
              </div>
              <div>
                <Label>Blood Pressure (Diastolic)</Label>
                <Input
                  type="number"
                  value={vitalSigns.bloodPressureDiastolic}
                  onChange={(e) => setVitalSigns({...vitalSigns, bloodPressureDiastolic: e.target.value})}
                  placeholder="80"
                />
              </div>
              <div>
                <Label>Heart Rate (bpm)</Label>
                <Input
                  type="number"
                  value={vitalSigns.heartRate}
                  onChange={(e) => setVitalSigns({...vitalSigns, heartRate: e.target.value})}
                  placeholder="72"
                />
              </div>
              <div>
                <Label>Temperature (°F)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitalSigns.temperature}
                  onChange={(e) => setVitalSigns({...vitalSigns, temperature: e.target.value})}
                  placeholder="98.6"
                />
              </div>
              <div>
                <Label>Respiratory Rate</Label>
                <Input
                  type="number"
                  value={vitalSigns.respiratoryRate}
                  onChange={(e) => setVitalSigns({...vitalSigns, respiratoryRate: e.target.value})}
                  placeholder="16"
                />
              </div>
              <div>
                <Label>O2 Saturation (%)</Label>
                <Input
                  type="number"
                  value={vitalSigns.oxygenSaturation}
                  onChange={(e) => setVitalSigns({...vitalSigns, oxygenSaturation: e.target.value})}
                  placeholder="98"
                />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitalSigns.weight}
                  onChange={(e) => setVitalSigns({...vitalSigns, weight: e.target.value})}
                  placeholder="70"
                />
              </div>
              <div>
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  value={vitalSigns.height}
                  onChange={(e) => setVitalSigns({...vitalSigns, height: e.target.value})}
                  placeholder="170"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Diagnosis
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Diagnosis</Label>
              <Button size="sm" variant="outline" onClick={addDiagnosis}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {diagnoses.map((diagnosis, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Diagnosis #{index + 1}</span>
                  {diagnoses.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => removeDiagnosis(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <Input
                  value={diagnosis.condition}
                  onChange={(e) => updateDiagnosis(index, 'condition', e.target.value)}
                  placeholder="Condition / Disease"
                />
                <div className="flex gap-4">
                  <select
                    value={diagnosis.severity}
                    onChange={(e) => updateDiagnosis(index, 'severity', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={diagnosis.isChronic}
                      onChange={(e) => updateDiagnosis(index, 'isChronic', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Chronic</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        );

      case 3: // Treatment Plan
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-lg font-semibold">Treatment Plan</Label>
              <textarea
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="Describe the treatment plan, recommendations, lifestyle changes..."
                className="w-full h-32 px-3 py-2 border rounded-lg resize-none mt-2"
              />
            </div>
            <div className="p-4 border rounded-lg bg-gray-50">
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={followUpRequired}
                  onChange={(e) => setFollowUpRequired(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="font-medium">Follow-up Required</span>
              </label>
              {followUpRequired && (
                <div className="space-y-3 ml-6">
                  <div>
                    <Label>Follow-up Date</Label>
                    <Input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Reason</Label>
                    <Input
                      value={followUpReason}
                      onChange={(e) => setFollowUpReason(e.target.value)}
                      placeholder="Reason for follow-up"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4: // Prescriptions
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Prescriptions</Label>
              <Button size="sm" variant="outline" onClick={addPrescription}>
                <Plus className="w-4 h-4 mr-1" /> Add Medication
              </Button>
            </div>
            {prescriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Pill className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No prescriptions added</p>
                <p className="text-sm">Click "Add Medication" to prescribe</p>
              </div>
            ) : (
              prescriptions.map((rx, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Medication #{index + 1}</span>
                    <Button size="sm" variant="ghost" onClick={() => removePrescription(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <Input
                    value={rx.medication}
                    onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                    placeholder="Medication name"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={rx.dosage}
                      onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                      placeholder="Dosage (e.g., 500mg)"
                    />
                    <Input
                      value={rx.frequency}
                      onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                      placeholder="Frequency (e.g., 2x daily)"
                    />
                    <Input
                      value={rx.duration}
                      onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                      placeholder="Duration (e.g., 7 days)"
                    />
                  </div>
                  <Input
                    value={rx.instructions}
                    onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                    placeholder="Special instructions (e.g., Take after meals)"
                  />
                </div>
              ))
            )}
          </div>
        );

      case 5: // Doctor's Notes
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-lg font-semibold">Doctor's Notes</Label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Additional observations, recommendations, or notes for the patient record..."
                className="w-full h-40 px-3 py-2 border rounded-lg resize-none mt-2"
              />
            </div>
            
            {/* Summary Preview */}
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-800 mb-2">Consultation Summary</h4>
              <div className="text-sm space-y-1 text-blue-700">
                <p>• Chief Complaint: {chiefComplaint || 'Not specified'}</p>
                <p>• Diagnoses: {diagnoses.filter(d => d.condition).map(d => d.condition).join(', ') || 'None'}</p>
                <p>• Prescriptions: {prescriptions.filter(p => p.medication).length} medication(s)</p>
                <p>• Follow-up: {followUpRequired ? `Required - ${followUpDate || 'Date TBD'}` : 'Not required'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{appointment.patientName}</h2>
              <p className="text-blue-100 text-sm">
                {appointment.patientAge} yrs • {appointment.patientGender} • {appointment.service}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!isStarted ? (
            <div className="text-center py-12">
              <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Start Consultation</h3>
              <p className="text-gray-500 mb-6">Click below to begin the medical consultation.</p>
              <Button onClick={handleStartConsultation} className="bg-blue-600 hover:bg-blue-700">
                Start Consultation
              </Button>
            </div>
          ) : (
            <>
              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-6 px-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex flex-col items-center ${currentStep === step.id ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                        currentStep === step.id ? 'bg-blue-600 text-white' : 
                        currentStep > step.id ? 'bg-green-500 text-white' : 'bg-gray-200'
                      }`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium">{step.name}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-1 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {(() => {
                      const StepIcon = steps[currentStep - 1].icon;
                      return StepIcon ? <StepIcon className="w-5 h-5" /> : null;
                    })()}
                    {steps[currentStep - 1].name}
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderStepContent()}</CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Footer Navigation */}
        {isStarted && (
          <div className="border-t p-4 flex justify-between flex-shrink-0 bg-gray-50">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            
            {currentStep < 5 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleCompleteConsultation}
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting || !diagnoses.some(d => d.condition.trim())}
              >
                {isSubmitting ? 'Saving...' : 'Complete Consultation'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationPanel;