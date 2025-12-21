import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Phone, 
  MessageCircle, 
  Heart, 
  Shield,
  MapPin,
  User,
  AlertTriangle,
  Headphones,
  Users,
  Eye,
  CheckCircle
} from 'lucide-react';

interface CrisisSupportProps {
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

const CrisisSupport: React.FC<CrisisSupportProps> = ({ onClose, onSendMessage }) => {
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [breathingStep, setBreathingStep] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const stepRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  const crisisResources = [
    {
      id: 'suicide',
      title: 'Suicide Prevention',
      description: 'Thoughts of suicide or self-harm',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      primaryCall: '9152987821',
      primaryLabel: 'iCall (TISS) - 24/7',
      contacts: [
        { type: 'iCall (TISS)', number: '9152987821', isPhone: true },
        { type: 'Vandrevala Foundation', number: '18602662345', isPhone: true },
        { type: 'TICC Counseling', number: 'sonam.dullat@thapar.edu', isPhone: false }
      ]
    },
    {
      id: 'anxiety',
      title: 'Anxiety Crisis',
      description: 'Panic attacks or severe anxiety',
      icon: Heart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      primaryCall: '18002024100',
      primaryLabel: 'TIET Toll-Free - 24/7',
      contacts: [
        { type: 'TIET Toll-Free', number: '18002024100', isPhone: true },
        { type: 'Dr. Sonam Dullat', number: 'sonam.dullat@thapar.edu', isPhone: false },
        { type: 'Ms. Sukhpreet Kaur', number: 'sukhpreet.kaur@thapar.edu', isPhone: false }
      ]
    },
    {
      id: 'abuse',
      title: 'Abuse & Violence',
      description: 'Violence, assault, or harassment',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      primaryCall: '1091',
      primaryLabel: 'Women Helpline - 24/7',
      contacts: [
        { type: 'Women Helpline', number: '1091', isPhone: true },
        { type: 'Police', number: '100', isPhone: true },
        { type: 'TIET Registrar', number: 'registrar@thapar.edu', isPhone: false }
      ]
    },
    {
      id: 'medical',
      title: 'Medical Emergency',
      description: 'Urgent medical care needed',
      icon: Headphones,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      primaryCall: '8288008122',
      primaryLabel: 'TIET Ambulance - 24/7',
      contacts: [
        { type: 'TIET Ambulance', number: '8288008122', isPhone: true },
        { type: 'National Ambulance', number: '108', isPhone: true },
        { type: 'Emergency', number: '112', isPhone: true }
      ]
    },
    {
      id: 'general',
      title: 'General Crisis',
      description: 'Any mental health emergency',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      primaryCall: '18002024100',
      primaryLabel: 'TIET Toll-Free - 24/7',
      contacts: [
        { type: 'TIET Toll-Free', number: '18002024100', isPhone: true },
        { type: 'Emergency Services', number: '112', isPhone: true },
        { type: 'TICC', number: 'sonam.dullat@thapar.edu', isPhone: false }
      ]
    }
  ];

  const breathingSteps = [
    { instruction: 'Breathe in slowly through your nose', duration: 4, type: 'inhale' },
    { instruction: 'Hold your breath', duration: 7, type: 'hold' },
    { instruction: 'Exhale slowly through your mouth', duration: 8, type: 'exhale' },
    { instruction: 'Rest and prepare for next cycle', duration: 2, type: 'rest' }
  ];

  const copingStrategies = [
    {
      title: '5-4-3-2-1 Grounding',
      description: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste',
      icon: Eye
    },
    {
      title: 'Progressive Muscle Relaxation',
      description: 'Tense and release each muscle group from toes to head',
      icon: User
    },
    {
      title: 'Safe Place Visualization',
      description: 'Imagine a place where you feel completely safe and calm',
      icon: MapPin
    },
    {
      title: 'Cold Water Technique',
      description: 'Splash cold water on face or hold ice cubes to activate dive response',
      icon: Heart
    }
  ];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (stepRef.current) clearTimeout(stepRef.current);
    };
  }, []);

  const stopBreathingExercise = () => {
    isRunningRef.current = false;
    if (stepRef.current) clearTimeout(stepRef.current);
    setShowBreathingExercise(false);
    setBreathingStep(0);
    setCountdown(0);
  };

  const startBreathingExercise = () => {
    // Clear any existing timer
    if (stepRef.current) clearTimeout(stepRef.current);
    
    setShowBreathingExercise(true);
    setBreathingStep(0);
    isRunningRef.current = true;
    
    const runCountdown = (step: number, secondsLeft: number) => {
      if (!isRunningRef.current) return;
      
      if (step >= breathingSteps.length) {
        // Completed one cycle
        setCountdown(0);
        setBreathingStep(breathingSteps.length);
        return;
      }
      
      setBreathingStep(step);
      setCountdown(secondsLeft);
      
      if (secondsLeft > 0) {
        // Continue countdown for current step
        stepRef.current = setTimeout(() => {
          runCountdown(step, secondsLeft - 1);
        }, 1000);
      } else {
        // Move to next step
        const nextStep = step + 1;
        if (nextStep < breathingSteps.length) {
          stepRef.current = setTimeout(() => {
            runCountdown(nextStep, breathingSteps[nextStep].duration);
          }, 100);
        } else {
          // Cycle complete
          setBreathingStep(breathingSteps.length);
        }
      }
    };

    // Start with first step
    runCountdown(0, breathingSteps[0].duration);
  };

  const handleResourceSelect = (resourceId: string) => {
    setSelectedResource(resourceId);
  };

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}?subject=Crisis%20Support%20Request&body=Hi%2C%20I%20need%20immediate%20support.`, '_self');
  };

  // Show contact details for selected resource
  if (selectedResource) {
    const resource = crisisResources.find(r => r.id === selectedResource);
    if (resource) {
      const Icon = resource.icon;
      return (
        <div className="p-3 h-full flex flex-col overflow-hidden">
          <div className="mb-3 flex-shrink-0">
            <Button 
              onClick={() => setSelectedResource(null)}
              className="mb-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs"
            >
              ← Back
            </Button>
            <div className={`p-3 rounded-lg ${resource.bgColor} ${resource.borderColor} border-2`}>
              <div className="flex items-center mb-2">
                <Icon className={`w-6 h-6 mr-2 ${resource.color}`} />
                <h3 className={`text-lg font-semibold ${resource.color}`}>{resource.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{resource.description}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            <h4 className="text-sm font-semibold text-gray-700">Available Contacts:</h4>
            {resource.contacts.map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{contact.type}</p>
                  <p className="text-xs text-gray-500">{contact.number}</p>
                </div>
                {contact.isPhone ? (
                  <Button
                    onClick={() => handleCall(contact.number)}
                    className="bg-green-500 text-white hover:bg-green-600 text-xs px-3"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleEmail(contact.number)}
                    className="bg-blue-500 text-white hover:bg-blue-600 text-xs px-3"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 flex-shrink-0 border-t border-gray-100">
            <Button 
              onClick={() => handleCall(resource.primaryCall)}
              className="w-full bg-red-600 text-white hover:bg-red-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Now: {resource.primaryLabel}
            </Button>
          </div>
        </div>
      );
    }
  }

  if (showBreathingExercise) {
    const currentStep = breathingSteps[breathingStep];
    const isActive = breathingStep < breathingSteps.length;

    return (
      <div className="p-4 h-full flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">4-7-8 Breathing Exercise</CardTitle>
            <p className="text-sm text-gray-600">Follow the instructions to calm your nervous system</p>
          </CardHeader>
          <CardContent className="text-center">
            {isActive ? (
              <motion.div
                key={breathingStep}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6"
              >
                <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center relative ${
                  currentStep.type === 'inhale' ? 'border-blue-400 bg-blue-50' :
                  currentStep.type === 'hold' ? 'border-yellow-400 bg-yellow-50' :
                  currentStep.type === 'exhale' ? 'border-green-400 bg-green-50' :
                  'border-gray-400 bg-gray-50'
                }`}>
                  <motion.div
                    className={`w-20 h-20 rounded-full flex items-center justify-center ${
                      currentStep.type === 'inhale' ? 'bg-blue-400' :
                      currentStep.type === 'hold' ? 'bg-yellow-400' :
                      currentStep.type === 'exhale' ? 'bg-green-400' :
                      'bg-gray-400'
                    }`}
                    animate={{
                      scale: currentStep.type === 'inhale' ? [1, 1.3] :
                             currentStep.type === 'exhale' ? [1.3, 1] :
                             [1, 1]
                    }}
                    transition={{ duration: currentStep.duration, ease: "easeInOut" }}
                  >
                    <span className="text-3xl font-bold text-white">{countdown}</span>
                  </motion.div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">{currentStep.instruction}</h3>
                  <div className="text-sm text-gray-500">
                    {currentStep.type === 'inhale' && '🫁 Inhale'}
                    {currentStep.type === 'hold' && '⏸️ Hold'}
                    {currentStep.type === 'exhale' && '💨 Exhale'}
                    {currentStep.type === 'rest' && '😌 Rest'}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-lg font-semibold">Cycle Complete</h3>
                <p className="text-gray-600">How are you feeling? Continue with another cycle or try other coping strategies.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2 mt-6 w-full max-w-md">
          <Button 
            onClick={stopBreathingExercise}
            className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Back to Support
          </Button>
          {isActive ? (
            <Button 
              onClick={stopBreathingExercise}
              className="flex-1 bg-red-100 text-red-700 hover:bg-red-200"
            >
              Stop Exercise
            </Button>
          ) : (
            <Button 
              onClick={startBreathingExercise}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              Repeat Cycle
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 h-full flex flex-col overflow-hidden">
      <div className="mb-3 flex-shrink-0">
        <h3 className="text-base font-semibold mb-2 text-red-600">🆘 Crisis Support</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-800">
              <strong>Life-threatening emergency? Call 112 immediately.</strong>
              <span className="block">You are not alone. Help is available 24/7.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pb-2">
        {/* Immediate Actions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm text-blue-800">Immediate Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            <Button 
              onClick={startBreathingExercise}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center text-sm py-2"
            >
              <Heart className="w-4 h-4 mr-2" />
              Start Breathing Exercise (4-7-8)
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => window.open('tel:18002024100', '_self')}
                className="w-full bg-green-100 text-green-700 hover:bg-green-200 text-xs py-1"
              >
                <Phone className="w-3 h-3 mr-1" />
                Call Crisis Line
              </Button>
              <Button 
                onClick={() => window.open('mailto:sonam.dullat@thapar.edu?subject=Mental%20Health%20Support%20Request&body=Hi%2C%20I%20need%20to%20talk%20to%20someone%20about%20my%20mental%20health.', '_self')}
                className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs py-1"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Email Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Crisis Resources */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm">Select Your Situation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            {crisisResources.map((resource) => {
              const Icon = resource.icon;
              return (
                <motion.button
                  key={resource.id}
                  onClick={() => handleResourceSelect(resource.id)}
                  className={`w-full p-2 rounded-lg border-2 transition-all text-left ${resource.bgColor} ${resource.borderColor} hover:shadow-md`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-2 flex-shrink-0 ${resource.color}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm ${resource.color}`}>{resource.title}</h4>
                      <p className="text-xs text-gray-600 truncate">{resource.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Coping - Collapsed */}
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-sm">Quick Coping Strategies</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {copingStrategies.map((strategy, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-800 truncate">{strategy.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-3 flex-shrink-0 border-t border-gray-100">
        <Button 
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          ← Back to Chat
        </Button>
      </div>
    </div>
  );
};

export default CrisisSupport;