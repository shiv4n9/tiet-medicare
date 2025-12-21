import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Thermometer,
  Heart,
  Brain,
  Zap,
  Eye,
  Ear,
  Stethoscope,
  Activity
} from 'lucide-react';

interface Symptom {
  id: string;
  name: string;
  category: string;
  severity: 'mild' | 'moderate' | 'severe';
  icon: React.ComponentType<any>;
  color: string;
}

interface SymptomCheckerProps {
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

const SymptomChecker: React.FC<SymptomCheckerProps> = ({ onClose, onSendMessage }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

  const symptomCategories = {
    'General': [
      { id: 'fever', name: 'Fever/Chills', severity: 'moderate', icon: Thermometer, color: 'text-red-500' },
      { id: 'fatigue', name: 'Fatigue/Weakness', severity: 'mild', icon: Zap, color: 'text-orange-500' },
      { id: 'pain', name: 'Body Aches/Pain', severity: 'mild', icon: Activity, color: 'text-yellow-500' },
      { id: 'appetite', name: 'Loss of Appetite', severity: 'mild', icon: Heart, color: 'text-pink-500' }
    ],
    'Respiratory': [
      { id: 'cough', name: 'Cough', severity: 'mild', icon: Stethoscope, color: 'text-blue-500' },
      { id: 'breathing', name: 'Difficulty Breathing', severity: 'severe', icon: Activity, color: 'text-red-600' },
      { id: 'throat', name: 'Sore Throat', severity: 'mild', icon: Stethoscope, color: 'text-green-500' },
      { id: 'congestion', name: 'Nasal Congestion', severity: 'mild', icon: Stethoscope, color: 'text-blue-400' }
    ],
    'Digestive': [
      { id: 'nausea', name: 'Nausea/Vomiting', severity: 'moderate', icon: Activity, color: 'text-green-600' },
      { id: 'diarrhea', name: 'Diarrhea', severity: 'moderate', icon: Activity, color: 'text-brown-500' },
      { id: 'stomach', name: 'Stomach Pain', severity: 'moderate', icon: Activity, color: 'text-orange-600' },
      { id: 'constipation', name: 'Constipation', severity: 'mild', icon: Activity, color: 'text-gray-500' }
    ],
    'Neurological': [
      { id: 'headache', name: 'Headache', severity: 'mild', icon: Brain, color: 'text-purple-500' },
      { id: 'dizziness', name: 'Dizziness', severity: 'moderate', icon: Brain, color: 'text-indigo-500' },
      { id: 'confusion', name: 'Confusion/Memory Issues', severity: 'severe', icon: Brain, color: 'text-red-500' },
      { id: 'seizure', name: 'Seizures', severity: 'severe', icon: Brain, color: 'text-red-700' }
    ],
    'Sensory': [
      { id: 'vision', name: 'Vision Problems', severity: 'moderate', icon: Eye, color: 'text-blue-600' },
      { id: 'hearing', name: 'Hearing Issues', severity: 'moderate', icon: Ear, color: 'text-green-600' },
      { id: 'taste', name: 'Loss of Taste/Smell', severity: 'mild', icon: Activity, color: 'text-yellow-600' }
    ]
  };

  const durations = [
    { value: 'hours', label: 'A few hours' },
    { value: 'day', label: '1 day' },
    { value: 'days', label: '2-3 days' },
    { value: 'week', label: 'About a week' },
    { value: 'weeks', label: 'Several weeks' },
    { value: 'chronic', label: 'Ongoing/Chronic' }
  ];

  const severityLevels = [
    { value: 'mild', label: 'Mild - Doesn\'t interfere with daily activities', color: 'text-green-600' },
    { value: 'moderate', label: 'Moderate - Some interference with activities', color: 'text-yellow-600' },
    { value: 'severe', label: 'Severe - Significantly impacts daily life', color: 'text-red-600' }
  ];

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) return;

    const allSymptoms = Object.entries(symptomCategories).flatMap(([category, symptoms]) => 
      symptoms.map(symptom => ({ ...symptom, category }))
    );
    const selected = allSymptoms.filter(s => selectedSymptoms.includes(s.id));
    
    // Check for emergency symptoms
    const emergencySymptoms = selected.filter(s => s.severity === 'severe');
    const hasEmergencySymptoms = emergencySymptoms.length > 0;
    
    // Check for respiratory distress
    const hasBreathingIssues = selectedSymptoms.includes('breathing');
    
    // Check for neurological concerns
    const hasNeurologicalSymptoms = selectedSymptoms.some(id => 
      ['confusion', 'seizure'].includes(id)
    );

    let recommendation = '';
    let urgency = 'routine';

    if (hasBreathingIssues || hasNeurologicalSymptoms || hasEmergencySymptoms) {
      urgency = 'emergency';
      recommendation = `🚨 SEEK IMMEDIATE MEDICAL ATTENTION\n\nYour symptoms indicate a potentially serious condition that requires immediate evaluation:\n\n`;
      
      if (hasBreathingIssues) {
        recommendation += '• Difficulty breathing requires immediate assessment\n';
      }
      if (hasNeurologicalSymptoms) {
        recommendation += '• Neurological symptoms need urgent evaluation\n';
      }
      
      recommendation += '\n📞 Emergency Actions:\n• Call 112 for emergency services\n• Visit the nearest emergency room\n• Contact campus health center: +91-175-239-3000\n\nDo not delay seeking medical care.';
      
    } else if (selected.some(s => s.severity === 'moderate') || selectedSymptoms.length >= 4) {
      urgency = 'urgent';
      recommendation = `⚠️ SCHEDULE MEDICAL APPOINTMENT SOON\n\nYour symptoms suggest you should see a healthcare provider within 24-48 hours:\n\n`;
      
      const categories = [...new Set(selected.map(s => s.category))];
      recommendation += `Affected areas: ${categories.join(', ')}\n\n`;
      
      if (duration === 'weeks' || duration === 'chronic') {
        recommendation += '• Persistent symptoms need professional evaluation\n';
      }
      if (severity === 'severe') {
        recommendation += '• Severe symptoms affecting daily life\n';
      }
      
      recommendation += '\n📅 Recommended Actions:\n• Book appointment with campus health center\n• Monitor symptoms and note any changes\n• Consider telehealth consultation if available\n• Keep a symptom diary';
      
    } else {
      urgency = 'routine';
      recommendation = `💡 SELF-CARE AND MONITORING\n\nYour symptoms appear mild but should be monitored:\n\n`;
      
      // Provide specific self-care advice
      if (selectedSymptoms.includes('headache')) {
        recommendation += '• For headaches: Stay hydrated, rest in dark room, consider over-the-counter pain relief\n';
      }
      if (selectedSymptoms.includes('cough') || selectedSymptoms.includes('throat')) {
        recommendation += '• For respiratory symptoms: Stay hydrated, use throat lozenges, avoid irritants\n';
      }
      if (selectedSymptoms.includes('fatigue')) {
        recommendation += '• For fatigue: Ensure adequate sleep, maintain nutrition, avoid overexertion\n';
      }
      if (selectedSymptoms.includes('nausea') || selectedSymptoms.includes('stomach')) {
        recommendation += '• For digestive issues: Eat bland foods, stay hydrated, avoid dairy/spicy foods\n';
      }
      
      recommendation += '\n🏥 When to Seek Care:\n• Symptoms worsen or persist beyond 3-5 days\n• New concerning symptoms develop\n• You feel unsure about your condition\n• Symptoms interfere with daily activities';
    }

    // Add general advice
    recommendation += '\n\n💊 General Care:\n• Stay hydrated and get adequate rest\n• Monitor your temperature if you have fever\n• Avoid contact with others if you might be contagious\n• Follow up if symptoms change or worsen';

    setShowResults(true);
    onSendMessage(`Symptom Analysis Complete:\n\n${recommendation}`);
  };

  if (showResults) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Symptom Analysis Complete</h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Analysis Sent</h4>
              <p className="text-gray-600 mb-4">
                Your symptom analysis and recommendations have been added to the chat.
              </p>
              <p className="text-sm text-gray-500">
                Remember: This is not a substitute for professional medical advice. 
                Always consult healthcare providers for proper diagnosis and treatment.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setSelectedSymptoms([]);
              setDuration('');
              setSeverity('');
              setShowResults(false);
            }}
            className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            Check More Symptoms
          </Button>
          <Button 
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Symptom Checker</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Important:</strong> This tool provides general guidance only. 
              For emergencies, call 112 immediately. Always consult healthcare professionals for proper diagnosis.
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Symptom Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select your symptoms:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(symptomCategories).map(([category, symptoms]) => (
              <div key={category}>
                <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {symptoms.map((symptom) => {
                    const Icon = symptom.icon;
                    const isSelected = selectedSymptoms.includes(symptom.id);
                    return (
                      <motion.button
                        key={symptom.id}
                        onClick={() => toggleSymptom(symptom.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center">
                          <Icon className={`w-5 h-5 mr-3 ${symptom.color}`} />
                          <div className="flex-1">
                            <div className="font-medium">{symptom.name}</div>
                            <div className={`text-xs ${
                              symptom.severity === 'severe' ? 'text-red-500' :
                              symptom.severity === 'moderate' ? 'text-yellow-500' :
                              'text-green-500'
                            }`}>
                              {symptom.severity.charAt(0).toUpperCase() + symptom.severity.slice(1)}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Duration */}
        {selectedSymptoms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                How long have you had these symptoms?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {durations.map((dur) => (
                  <button
                    key={dur.value}
                    onClick={() => setDuration(dur.value)}
                    className={`w-full p-3 text-left rounded-lg border transition-all ${
                      duration === dur.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Severity */}
        {selectedSymptoms.length > 0 && duration && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Activity className="w-5 h-5 mr-2 text-orange-500" />
                How severe are your symptoms?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {severityLevels.map((sev) => (
                  <button
                    key={sev.value}
                    onClick={() => setSeverity(sev.value)}
                    className={`w-full p-3 text-left rounded-lg border transition-all ${
                      severity === sev.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`font-medium ${sev.color}`}>
                      {sev.label}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <Button 
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </Button>
        <Button 
          onClick={analyzeSymptoms}
          disabled={selectedSymptoms.length === 0 || !duration || !severity}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          Analyze Symptoms
        </Button>
      </div>
    </div>
  );
};

export default SymptomChecker;