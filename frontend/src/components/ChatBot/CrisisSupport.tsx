import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Phone, 
  MessageCircle, 
  Heart, 
  Shield,
  Clock,
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
  const [selectedSupport, setSelectedSupport] = useState<string>('');
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [breathingStep, setBreathingStep] = useState(0);

  const crisisResources = [
    {
      id: 'suicide',
      title: 'Suicide Prevention',
      description: 'If you\'re having thoughts of suicide or self-harm',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      contacts: [
        { type: 'National Suicide Prevention Lifeline', number: '988', available: '24/7' },
        { type: 'Crisis Text Line', number: 'Text HOME to 741741', available: '24/7' },
        { type: 'Campus Crisis Line', number: '+91-175-239-3000', available: '24/7' }
      ]
    },
    {
      id: 'anxiety',
      title: 'Anxiety Crisis',
      description: 'Panic attacks, severe anxiety, or overwhelming worry',
      icon: Heart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      contacts: [
        { type: 'Anxiety & Depression Association', number: '240-485-1001', available: 'Mon-Fri 9-5' },
        { type: 'Campus Counseling', number: '+91-175-239-3001', available: '24/7' },
        { type: 'Crisis Text Line', number: 'Text ANXIETY to 741741', available: '24/7' }
      ]
    },
    {
      id: 'abuse',
      title: 'Abuse & Violence',
      description: 'Domestic violence, sexual assault, or abuse',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      contacts: [
        { type: 'National Domestic Violence Hotline', number: '1-800-799-7233', available: '24/7' },
        { type: 'RAINN Sexual Assault Hotline', number: '1-800-656-4673', available: '24/7' },
        { type: 'Campus Safety & Security', number: '+91-175-239-3002', available: '24/7' }
      ]
    },
    {
      id: 'substance',
      title: 'Substance Crisis',
      description: 'Substance abuse, addiction, or overdose concerns',
      icon: Headphones,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      contacts: [
        { type: 'SAMHSA National Helpline', number: '1-800-662-4357', available: '24/7' },
        { type: 'Poison Control', number: '1-800-222-1222', available: '24/7' },
        { type: 'Campus Health Services', number: '+91-175-239-3003', available: '24/7' }
      ]
    },
    {
      id: 'general',
      title: 'General Crisis Support',
      description: 'Any mental health emergency or crisis',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      contacts: [
        { type: 'National Crisis Text Line', number: 'Text HELLO to 741741', available: '24/7' },
        { type: 'Campus Counseling Center', number: '+91-175-239-3000', available: '24/7' },
        { type: 'Local Emergency Services', number: '112', available: '24/7' }
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

  const startBreathingExercise = () => {
    setShowBreathingExercise(true);
    setBreathingStep(0);
    
    const runBreathingCycle = (step: number) => {
      if (step >= breathingSteps.length) {
        // Completed one cycle, ask if they want to continue
        setTimeout(() => {
          setBreathingStep(0);
        }, 1000);
        return;
      }

      const currentStep = breathingSteps[step];
      setBreathingStep(step);

      setTimeout(() => {
        runBreathingCycle(step + 1);
      }, currentStep.duration * 1000);
    };

    runBreathingCycle(0);
  };

  const handleResourceSelect = (resourceId: string) => {
    setSelectedSupport(resourceId);
    const resource = crisisResources.find(r => r.id === resourceId);
    if (resource) {
      let message = `🆘 CRISIS SUPPORT - ${resource.title.toUpperCase()}\n\n`;
      message += `${resource.description}\n\n`;
      message += `📞 IMMEDIATE HELP AVAILABLE:\n\n`;
      
      resource.contacts.forEach(contact => {
        message += `• ${contact.type}\n`;
        message += `  📱 ${contact.number}\n`;
        message += `  🕐 Available: ${contact.available}\n\n`;
      });

      message += `🚨 REMEMBER:\n`;
      message += `• You are not alone\n`;
      message += `• Help is available 24/7\n`;
      message += `• Your life has value\n`;
      message += `• Crisis feelings are temporary\n\n`;
      
      message += `If this is a life-threatening emergency, call 112 immediately.`;

      onSendMessage(message);
    }
  };

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
                <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center ${
                  currentStep.type === 'inhale' ? 'border-blue-400 bg-blue-50' :
                  currentStep.type === 'hold' ? 'border-yellow-400 bg-yellow-50' :
                  currentStep.type === 'exhale' ? 'border-green-400 bg-green-50' :
                  'border-gray-400 bg-gray-50'
                }`}>
                  <motion.div
                    className={`w-20 h-20 rounded-full ${
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
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">{currentStep.instruction}</h3>
                  <div className="text-3xl font-bold text-gray-600">
                    {currentStep.duration}s
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
            onClick={() => setShowBreathingExercise(false)}
            className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Back to Support
          </Button>
          {isActive ? (
            <Button 
              onClick={() => setShowBreathingExercise(false)}
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
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-red-600">🆘 Crisis Support</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong>If this is a life-threatening emergency, call 112 immediately.</strong>
              <br />You are not alone. Help is available 24/7.
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Immediate Actions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base text-blue-800">Immediate Support Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={startBreathingExercise}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center"
            >
              <Heart className="w-4 h-4 mr-2" />
              Start Breathing Exercise (4-7-8)
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => handleResourceSelect('general')}
                className="bg-green-100 text-green-700 hover:bg-green-200 text-sm"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call Crisis Line
              </Button>
              <Button 
                onClick={() => handleResourceSelect('general')}
                className="bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Text Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Crisis Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Your Situation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {crisisResources.map((resource) => {
              const Icon = resource.icon;
              return (
                <motion.button
                  key={resource.id}
                  onClick={() => handleResourceSelect(resource.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${resource.bgColor} ${resource.borderColor} hover:shadow-md`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start">
                    <Icon className={`w-6 h-6 mr-3 mt-1 ${resource.color}`} />
                    <div className="flex-1">
                      <h4 className={`font-semibold ${resource.color}`}>{resource.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </CardContent>
        </Card>

        {/* Coping Strategies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Coping Strategies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {copingStrategies.map((strategy, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{strategy.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Safety Planning */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-base text-green-800">Create a Safety Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-green-700">
              <p>• Identify your warning signs</p>
              <p>• List coping strategies that help</p>
              <p>• Contact people who can support you</p>
              <p>• Remove or secure harmful items</p>
              <p>• Know who to call in crisis</p>
            </div>
            <Button 
              onClick={() => onSendMessage('I would like help creating a safety plan for managing crisis situations.')}
              className="w-full mt-3 bg-green-600 text-white hover:bg-green-700"
            >
              Get Help Creating Safety Plan
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mt-4">
        <Button 
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Close
        </Button>
        <Button 
          onClick={() => onSendMessage('I need ongoing support and would like to speak with a counselor about my mental health.')}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
        >
          Request Counselor
        </Button>
      </div>
    </div>
  );
};

export default CrisisSupport;