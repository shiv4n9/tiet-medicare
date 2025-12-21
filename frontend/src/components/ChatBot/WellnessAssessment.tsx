import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Heart, 
  Moon, 
  Utensils, 
  Dumbbell, 
  Users, 
  BookOpen,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

interface WellnessAssessmentProps {
  onComplete: (results: WellnessResults) => void;
  onClose: () => void;
}

interface WellnessResults {
  overallScore: number;
  mentalHealth: number;
  physicalHealth: number;
  socialWellbeing: number;
  academicStress: number;
  recommendations: string[];
  riskLevel: 'low' | 'moderate' | 'high';
}

const WellnessAssessment: React.FC<WellnessAssessmentProps> = ({ onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const questions = [
    {
      category: 'Mental Health',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      question: 'How often have you felt down, depressed, or hopeless in the past 2 weeks?',
      options: [
        { text: 'Not at all', score: 4 },
        { text: 'Several days', score: 3 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 1 }
      ]
    },
    {
      category: 'Anxiety',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      question: 'How often have you felt nervous, anxious, or on edge?',
      options: [
        { text: 'Not at all', score: 4 },
        { text: 'Several days', score: 3 },
        { text: 'More than half the days', score: 2 },
        { text: 'Nearly every day', score: 1 }
      ]
    },
    {
      category: 'Sleep Quality',
      icon: Moon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      question: 'How would you rate your sleep quality over the past week?',
      options: [
        { text: 'Excellent - 7-9 hours, restful', score: 4 },
        { text: 'Good - mostly adequate sleep', score: 3 },
        { text: 'Fair - some sleep issues', score: 2 },
        { text: 'Poor - significant sleep problems', score: 1 }
      ]
    },
    {
      category: 'Physical Activity',
      icon: Dumbbell,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      question: 'How often do you engage in physical exercise or activity?',
      options: [
        { text: 'Daily or almost daily', score: 4 },
        { text: '3-4 times per week', score: 3 },
        { text: '1-2 times per week', score: 2 },
        { text: 'Rarely or never', score: 1 }
      ]
    },
    {
      category: 'Nutrition',
      icon: Utensils,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      question: 'How would you describe your eating habits?',
      options: [
        { text: 'Very healthy - balanced meals, regular timing', score: 4 },
        { text: 'Mostly healthy with occasional lapses', score: 3 },
        { text: 'Somewhat unhealthy - irregular or poor choices', score: 2 },
        { text: 'Very poor - frequent skipping meals or junk food', score: 1 }
      ]
    },
    {
      category: 'Social Connections',
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      question: 'How satisfied are you with your social relationships and support system?',
      options: [
        { text: 'Very satisfied - strong support network', score: 4 },
        { text: 'Mostly satisfied - good relationships', score: 3 },
        { text: 'Somewhat dissatisfied - limited support', score: 2 },
        { text: 'Very dissatisfied - feeling isolated', score: 1 }
      ]
    },
    {
      category: 'Academic Stress',
      icon: BookOpen,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      question: 'How manageable is your academic workload and stress level?',
      options: [
        { text: 'Very manageable - good balance', score: 4 },
        { text: 'Mostly manageable - occasional stress', score: 3 },
        { text: 'Somewhat overwhelming - frequent stress', score: 2 },
        { text: 'Very overwhelming - constant high stress', score: 1 }
      ]
    }
  ];

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate results
      const results = calculateResults(newAnswers);
      onComplete(results);
    }
  };

  const calculateResults = (scores: number[]): WellnessResults => {
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const maxScore = questions.length * 4;
    const overallScore = Math.round((totalScore / maxScore) * 100);

    // Calculate category scores
    const mentalHealth = Math.round(((scores[0] + scores[1]) / 8) * 100);
    const physicalHealth = Math.round(((scores[2] + scores[3] + scores[4]) / 12) * 100);
    const socialWellbeing = Math.round((scores[5] / 4) * 100);
    const academicStress = Math.round((scores[6] / 4) * 100);

    // Determine risk level
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (overallScore < 40) riskLevel = 'high';
    else if (overallScore < 70) riskLevel = 'moderate';

    // Generate recommendations
    const recommendations = generateRecommendations(scores, {
      mentalHealth,
      physicalHealth,
      socialWellbeing,
      academicStress
    });

    return {
      overallScore,
      mentalHealth,
      physicalHealth,
      socialWellbeing,
      academicStress,
      recommendations,
      riskLevel
    };
  };

  const generateRecommendations = (scores: number[], categoryScores: any): string[] => {
    const recommendations: string[] = [];

    // Mental health recommendations
    if (categoryScores.mentalHealth < 60) {
      recommendations.push('Visit TICC Counseling at G-Block 104-105');
      recommendations.push('Contact Dr. Sonam Dullat: sonam.dullat@thapar.edu');
      recommendations.push('Practice daily mindfulness or meditation (10-15 minutes)');
    }

    // Physical health recommendations
    if (categoryScores.physicalHealth < 60) {
      recommendations.push('Visit TIET Health Centre: 1800 202 4100');
      recommendations.push('Aim for 150 minutes of moderate exercise per week');
      recommendations.push('Establish a consistent sleep schedule (7-9 hours)');
    }

    // Social wellbeing recommendations
    if (categoryScores.socialWellbeing < 60) {
      recommendations.push('Join TIET campus clubs or activities');
      recommendations.push('Schedule regular check-ins with friends or family');
      recommendations.push('Consider TICC group counseling sessions');
    }

    // Academic stress recommendations
    if (categoryScores.academicStress < 60) {
      recommendations.push('Break large tasks into smaller, manageable steps');
      recommendations.push('Use time management techniques like the Pomodoro method');
      recommendations.push('Seek academic support from department tutors');
    }

    // General recommendations
    recommendations.push('Schedule regular health check-ups at TIET Health Centre');
    recommendations.push('Practice stress-reduction techniques daily');

    return recommendations.slice(0, 6); // Limit to top 6 recommendations
  };

  const currentQ = questions[currentQuestion];
  const Icon = currentQ.icon;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Wellness Assessment</h3>
          <span className="text-sm text-gray-500">
            {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className={`flex-1 ${currentQ.bgColor} border-none`}>
        <CardHeader className="text-center pb-4">
          <div className={`w-16 h-16 rounded-full ${currentQ.bgColor} flex items-center justify-center mx-auto mb-3`}>
            <Icon className={`w-8 h-8 ${currentQ.color}`} />
          </div>
          <CardTitle className="text-lg text-gray-800">{currentQ.category}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-700 mb-6 font-medium">
            {currentQ.question}
          </p>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswer(option.score)}
                className="w-full p-4 text-left bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-medium">{option.text}</span>
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    option.score >= 3 ? 'border-green-500' : 
                    option.score === 2 ? 'border-yellow-500' : 'border-red-500'
                  }`} />
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-4">
        <Button 
          onClick={onClose}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </Button>
        {currentQuestion > 0 && (
          <Button 
            onClick={() => {
              setCurrentQuestion(currentQuestion - 1);
              setAnswers(answers.slice(0, -1));
            }}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Previous
          </Button>
        )}
      </div>
    </div>
  );
};

export default WellnessAssessment;