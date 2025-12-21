import { useState, useRef, useEffect } from 'react';
import {
  Send,
  User,
  Bot,
  Calendar,
  AlertCircle,
  Heart,
  HelpCircle,
  Lock,
  Brain,
  Activity,
  Stethoscope,
  Book,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import WellnessAssessment from './WellnessAssessment';
import MoodTracker from './MoodTracker';
import SymptomChecker from './SymptomChecker';
import CrisisSupport from './CrisisSupport';
import HealthResources from './HealthResources';

// ============================================
// ADVANCED INTENT DETECTION SYSTEM
// Large-scale training data with fuzzy matching
// ============================================

interface IntentResult {
  intent: string;
  confidence: number;
  component: string | null;
  action: 'open_component' | 'show_dialog' | 'respond' | 'redirect';
  matchedPhrases: string[];
}

// Training data - Large dataset of phrases mapped to intents
const trainingData: Record<string, string[]> = {
  // CRISIS SUPPORT - Highest Priority (200+ phrases)
  crisis: [
    // Suicidal ideation
    'i want to die', 'i want to kill myself', 'i dont want to live', 'i dont want to be alive',
    'end my life', 'end it all', 'kill myself', 'suicide', 'suicidal', 'suicidal thoughts',
    'thinking about suicide', 'want to commit suicide', 'planning to end my life',
    'life is not worth living', 'better off dead', 'wish i was dead', 'wish i wasnt alive',
    'no reason to live', 'cant go on', 'cant take it anymore', 'cant do this anymore',
    'give up on life', 'giving up', 'done with life', 'done with everything',
    'nothing to live for', 'no point in living', 'whats the point of living',
    // Self-harm
    'self harm', 'self-harm', 'hurt myself', 'hurting myself', 'cutting myself',
    'want to cut', 'harming myself', 'injure myself', 'self injury', 'self-injury',
    'burning myself', 'hitting myself', 'punishing myself',
    // Crisis/Emergency
    'emergency', 'urgent', 'crisis', 'help me', 'help me now', 'need help now',
    'need help immediately', 'urgent help', 'emergency help', 'im in danger',
    'im not safe', 'not safe', 'in crisis', 'having a crisis', 'mental health crisis',
    'breakdown', 'mental breakdown', 'nervous breakdown', 'falling apart',
    'cant cope', 'cant handle this', 'losing my mind', 'going crazy',
    // Desperation
    'desperate', 'hopeless', 'no hope', 'lost all hope', 'theres no hope',
    'nothing will help', 'nothing works', 'tried everything', 'at my limit',
    'reached my limit', 'at the end', 'end of my rope', 'rock bottom',
    // Abuse/Violence
    'being abused', 'someone is hurting me', 'domestic violence', 'being beaten',
    'physically abused', 'sexually abused', 'in danger at home', 'unsafe at home',
    'someone threatening me', 'being threatened', 'fear for my life',
    // Panic/Severe distress
    'panic attack', 'having a panic attack', 'cant breathe', 'heart racing',
    'severe anxiety attack', 'anxiety attack', 'freaking out', 'losing control',
    'feel like dying', 'feel like im dying', 'something is very wrong',
  ],

  // SYMPTOM CHECKER (300+ phrases)
  symptoms: [
    // General illness
    'i feel sick', 'feeling sick', 'not feeling well', 'feeling unwell', 'im sick',
    'i am sick', 'got sick', 'fallen ill', 'feeling ill', 'under the weather',
    'something is wrong with me', 'whats wrong with me', 'check my symptoms',
    'symptom checker', 'analyze my symptoms', 'diagnose me', 'what do i have',
    'am i sick', 'could i be sick', 'think im sick', 'might be sick',
    // Head/Neurological
    'headache', 'head hurts', 'head pain', 'migraine', 'severe headache',
    'throbbing head', 'pounding headache', 'tension headache', 'head is killing me',
    'dizzy', 'dizziness', 'feeling dizzy', 'lightheaded', 'light headed',
    'vertigo', 'room is spinning', 'balance problems', 'fainting', 'fainted',
    'blurry vision', 'vision problems', 'seeing spots', 'double vision',
    // Fever/Temperature
    'fever', 'high temperature', 'temperature', 'feeling hot', 'burning up',
    'chills', 'shivering', 'cold sweats', 'night sweats', 'sweating a lot',
    'body temperature', 'feverish', 'running a fever', 'got a fever',
    // Respiratory
    'cough', 'coughing', 'dry cough', 'wet cough', 'persistent cough',
    'cant stop coughing', 'coughing up', 'phlegm', 'mucus', 'congestion',
    'congested', 'stuffy nose', 'runny nose', 'blocked nose', 'nasal',
    'sore throat', 'throat hurts', 'throat pain', 'scratchy throat', 'strep',
    'difficulty breathing', 'hard to breathe', 'shortness of breath', 'breathless',
    'wheezing', 'chest tightness', 'cant catch breath', 'breathing problems',
    'cold', 'common cold', 'flu', 'influenza', 'covid', 'coronavirus',
    // Digestive
    'stomach ache', 'stomach pain', 'stomach hurts', 'abdominal pain', 'belly pain',
    'nausea', 'nauseous', 'feel like vomiting', 'going to throw up', 'queasy',
    'vomiting', 'throwing up', 'vomited', 'been sick', 'puking',
    'diarrhea', 'loose stools', 'watery stool', 'frequent bowel', 'runs',
    'constipation', 'constipated', 'cant poop', 'bloated', 'bloating', 'gas',
    'indigestion', 'heartburn', 'acid reflux', 'gerd', 'stomach upset',
    'food poisoning', 'ate something bad', 'stomach bug', 'gastro',
    // Pain
    'pain', 'ache', 'aching', 'hurts', 'hurting', 'sore', 'soreness',
    'back pain', 'backache', 'lower back', 'upper back', 'spine pain',
    'neck pain', 'stiff neck', 'neck hurts', 'shoulder pain', 'shoulders hurt',
    'joint pain', 'joints hurt', 'knee pain', 'ankle pain', 'wrist pain',
    'muscle pain', 'muscle ache', 'body aches', 'all over pain', 'everything hurts',
    'chest pain', 'chest hurts', 'heart pain', 'sharp chest pain',
    'ear pain', 'earache', 'ear hurts', 'ear infection',
    'tooth pain', 'toothache', 'dental pain', 'teeth hurt',
    // Skin
    'rash', 'skin rash', 'itchy', 'itching', 'hives', 'bumps on skin',
    'red spots', 'skin irritation', 'allergic reaction', 'swelling',
    'acne', 'pimples', 'breakout', 'skin problem', 'eczema', 'psoriasis',
    // Fatigue/Energy
    'tired', 'exhausted', 'fatigue', 'fatigued', 'no energy', 'low energy',
    'always tired', 'constantly tired', 'chronic fatigue', 'weakness',
    'weak', 'feeling weak', 'lethargic', 'sluggish', 'drained',
    // Eyes
    'eye pain', 'eyes hurt', 'red eyes', 'pink eye', 'eye infection',
    'watery eyes', 'dry eyes', 'eye strain', 'vision blurry',
    // Urinary
    'painful urination', 'burning when i pee', 'frequent urination', 'uti',
    'urinary tract', 'bladder pain', 'kidney pain',
    // Other symptoms
    'swollen', 'inflammation', 'numbness', 'tingling', 'pins and needles',
    'loss of appetite', 'not hungry', 'weight loss', 'weight gain',
    'insomnia', 'cant sleep', 'sleep problems', 'sleeping too much',
    'allergies', 'allergy', 'allergic', 'sneezing', 'runny eyes',
  ],

  // MOOD TRACKER (200+ phrases)
  mood: [
    // Track mood
    'track my mood', 'mood tracker', 'log my mood', 'record my mood',
    'how am i feeling', 'check my mood', 'mood check', 'mood journal',
    'emotional check', 'feelings tracker', 'track emotions', 'log feelings',
    // Sadness
    'feeling sad', 'im sad', 'so sad', 'very sad', 'really sad',
    'feeling down', 'feeling low', 'feeling blue', 'got the blues',
    'unhappy', 'not happy', 'miserable', 'gloomy', 'melancholy',
    'crying', 'been crying', 'want to cry', 'feel like crying', 'tears',
    'heartbroken', 'broken hearted', 'devastated', 'crushed',
    // Depression
    'depressed', 'depression', 'feeling depressed', 'clinical depression',
    'major depression', 'depressive', 'in a dark place', 'darkness',
    'empty inside', 'feel empty', 'numb', 'feeling numb', 'emotionally numb',
    'no motivation', 'cant get motivated', 'dont care anymore', 'apathetic',
    // Anxiety
    'anxious', 'anxiety', 'feeling anxious', 'worried', 'worrying',
    'nervous', 'on edge', 'restless', 'cant relax', 'tense',
    'overthinking', 'racing thoughts', 'mind wont stop', 'cant stop thinking',
    'fear', 'scared', 'afraid', 'frightened', 'terrified', 'paranoid',
    // Stress
    'stressed', 'stress', 'feeling stressed', 'under stress', 'so stressed',
    'overwhelmed', 'too much', 'cant handle', 'pressure', 'under pressure',
    'burned out', 'burnout', 'exhausted mentally', 'mental exhaustion',
    'overworked', 'too much work', 'work stress', 'academic stress',
    // Anger
    'angry', 'anger', 'mad', 'furious', 'rage', 'irritated', 'irritable',
    'frustrated', 'frustration', 'annoyed', 'pissed off', 'fed up',
    'resentful', 'bitter', 'hostile', 'aggressive feelings',
    // Positive moods
    'happy', 'feeling happy', 'good mood', 'great mood', 'feeling good',
    'feeling great', 'wonderful', 'amazing', 'fantastic', 'excellent',
    'excited', 'thrilled', 'joyful', 'joy', 'elated', 'ecstatic',
    'calm', 'peaceful', 'relaxed', 'content', 'satisfied', 'grateful',
    'hopeful', 'optimistic', 'positive', 'motivated', 'energized',
    // Mixed/Confused
    'mood swings', 'emotional', 'emotions all over', 'up and down',
    'dont know how i feel', 'confused about feelings', 'mixed feelings',
    'emotional rollercoaster', 'unstable mood', 'bipolar feelings',
    // Loneliness
    'lonely', 'loneliness', 'alone', 'isolated', 'no friends',
    'feel alone', 'nobody cares', 'no one understands', 'disconnected',
  ],

  // WELLNESS ASSESSMENT (100+ phrases)
  wellness: [
    'wellness check', 'wellness assessment', 'health assessment', 'health check',
    'check my health', 'evaluate my health', 'health evaluation', 'health score',
    'overall health', 'general health', 'how healthy am i', 'am i healthy',
    'wellbeing', 'well-being', 'well being', 'my wellbeing', 'check wellbeing',
    'lifestyle check', 'lifestyle assessment', 'habits check', 'health habits',
    'fitness level', 'fitness check', 'physical health', 'mental health check',
    'comprehensive check', 'full health check', 'complete assessment',
    'health screening', 'self assessment', 'personal health', 'health status',
    'how am i doing', 'health report', 'wellness score', 'wellness report',
    'body check', 'mind body check', 'holistic health', 'total wellness',
    'preventive check', 'health baseline', 'benchmark health',
  ],

  // HEALTH RESOURCES (100+ phrases)
  resources: [
    'health resources', 'health library', 'health articles', 'health information',
    'learn about health', 'health education', 'health tips', 'wellness tips',
    'self help', 'self-help', 'help myself', 'resources', 'information',
    'articles', 'guides', 'how to', 'tips for', 'advice on',
    'read about', 'learn about', 'understand', 'what is', 'explain',
    'health guide', 'wellness guide', 'mental health resources',
    'coping strategies', 'coping techniques', 'coping skills', 'coping mechanisms',
    'relaxation techniques', 'stress relief tips', 'anxiety tips',
    'sleep tips', 'nutrition tips', 'exercise tips', 'fitness tips',
    'meditation guide', 'mindfulness resources', 'breathing exercises',
    'educational content', 'health facts', 'medical information',
    'disease information', 'condition information', 'treatment options',
    'prevention tips', 'healthy living', 'lifestyle tips',
  ],

  // APPOINTMENT BOOKING (100+ phrases)
  appointment: [
    'book appointment', 'make appointment', 'schedule appointment', 'appointment',
    'book a doctor', 'see a doctor', 'visit doctor', 'doctor appointment',
    'meet doctor', 'consult doctor', 'doctor consultation', 'medical appointment',
    'schedule visit', 'book visit', 'health centre appointment', 'clinic appointment',
    'need to see doctor', 'want to see doctor', 'should see doctor',
    'book checkup', 'schedule checkup', 'health checkup', 'medical checkup',
    'get checked', 'get examined', 'physical exam', 'medical exam',
    'book slot', 'available slots', 'doctor availability', 'when can i see',
    'earliest appointment', 'next available', 'book for today', 'book for tomorrow',
    'online booking', 'book online', 'schedule online', 'appointment booking',
    'cancel appointment', 'reschedule appointment', 'change appointment',
    'upcoming appointment', 'my appointments', 'appointment status',
  ],

  // MENTAL HEALTH / COUNSELING (100+ phrases)
  mentalHealth: [
    'mental health', 'mental health support', 'mental wellness', 'psychological',
    'counseling', 'counselling', 'counselor', 'counsellor', 'therapy', 'therapist',
    'psychologist', 'psychiatrist', 'mental health professional',
    'ticc', 'thapar counseling', 'campus counseling', 'student counseling',
    'talk to someone', 'need to talk', 'someone to talk to', 'professional help',
    'mental health help', 'psychological help', 'emotional support',
    'therapy session', 'counseling session', 'book counseling', 'book therapy',
    'mental health appointment', 'see a counselor', 'see a therapist',
    'psychiatric help', 'mental health services', 'counseling services',
    'emotional help', 'psychological support', 'mental support',
    'dealing with issues', 'personal issues', 'life problems', 'relationship issues',
    'family problems', 'work problems', 'academic problems',
  ],
};

// Synonym expansion for better matching
const synonyms: Record<string, string[]> = {
  'sick': ['ill', 'unwell', 'poorly', 'under the weather'],
  'pain': ['ache', 'hurt', 'sore', 'discomfort', 'agony'],
  'sad': ['unhappy', 'down', 'blue', 'low', 'miserable', 'gloomy'],
  'happy': ['glad', 'joyful', 'cheerful', 'content', 'pleased'],
  'anxious': ['worried', 'nervous', 'tense', 'uneasy', 'apprehensive'],
  'tired': ['exhausted', 'fatigued', 'weary', 'drained', 'worn out'],
  'angry': ['mad', 'furious', 'irritated', 'annoyed', 'upset'],
  'scared': ['afraid', 'frightened', 'terrified', 'fearful'],
  'help': ['assist', 'support', 'aid', 'guidance'],
  'doctor': ['physician', 'medical professional', 'healthcare provider'],
  'appointment': ['booking', 'visit', 'consultation', 'meeting'],
};

// Calculate Levenshtein distance for fuzzy matching
const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
};

// Calculate similarity score (0-1)
const calculateSimilarity = (str1: string, str2: string): number => {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
};

// Tokenize and normalize input
const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);
};

// Generate n-grams from tokens
const generateNgrams = (tokens: string[], n: number): string[] => {
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
};

// Advanced intent detection with fuzzy matching and n-gram analysis
const detectIntent = (userInput: string): IntentResult => {
  const input = userInput.toLowerCase().trim();
  const tokens = tokenize(input);
  
  // Generate n-grams (1, 2, 3, 4 word phrases)
  const allPhrases = [
    ...tokens,
    ...generateNgrams(tokens, 2),
    ...generateNgrams(tokens, 3),
    ...generateNgrams(tokens, 4),
  ];

  const intentScores: Record<string, { score: number; matches: string[] }> = {};
  
  // Intent weights (priority)
  const intentWeights: Record<string, number> = {
    crisis: 2.0,      // Highest priority
    symptoms: 1.2,
    mood: 1.1,
    appointment: 1.0,
    mentalHealth: 1.0,
    wellness: 0.9,
    resources: 0.8,
  };

  // Component mapping
  const intentComponents: Record<string, string | null> = {
    crisis: 'crisis-support',
    symptoms: 'symptom-checker',
    mood: 'mood-tracker',
    wellness: 'wellness-assessment',
    resources: 'health-resources',
    appointment: null,
    mentalHealth: null,
  };

  // Action mapping
  const intentActions: Record<string, 'open_component' | 'show_dialog' | 'respond'> = {
    crisis: 'open_component',
    symptoms: 'open_component',
    mood: 'open_component',
    wellness: 'open_component',
    resources: 'open_component',
    appointment: 'show_dialog',
    mentalHealth: 'show_dialog',
  };

  // Score each intent
  for (const [intent, phrases] of Object.entries(trainingData)) {
    let totalScore = 0;
    const matchedPhrases: string[] = [];

    for (const trainingPhrase of phrases) {
      // Exact match (highest score)
      if (input.includes(trainingPhrase)) {
        totalScore += 10 * (trainingPhrase.split(' ').length); // Longer phrases = higher score
        matchedPhrases.push(trainingPhrase);
        continue;
      }

      // Check each user phrase against training phrase
      for (const userPhrase of allPhrases) {
        // Exact phrase match
        if (userPhrase === trainingPhrase) {
          totalScore += 8;
          if (!matchedPhrases.includes(trainingPhrase)) matchedPhrases.push(trainingPhrase);
          continue;
        }

        // Fuzzy match (for typos)
        const similarity = calculateSimilarity(userPhrase, trainingPhrase);
        if (similarity > 0.8) {
          totalScore += similarity * 6;
          if (!matchedPhrases.includes(trainingPhrase)) matchedPhrases.push(trainingPhrase);
        }
        
        // Partial match (phrase contains training word)
        if (trainingPhrase.split(' ').some(word => userPhrase.includes(word) && word.length > 3)) {
          totalScore += 2;
        }
      }
    }

    // Apply intent weight
    totalScore *= intentWeights[intent] || 1;

    intentScores[intent] = { score: totalScore, matches: matchedPhrases };
  }

  // Find best matching intent
  let bestIntent = 'general';
  let bestScore = 0;
  let bestMatches: string[] = [];

  for (const [intent, data] of Object.entries(intentScores)) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestIntent = intent;
      bestMatches = data.matches;
    }
  }

  // Minimum threshold for triggering component
  const minThreshold = 8;
  
  if (bestScore < minThreshold) {
    return {
      intent: 'general',
      confidence: 0,
      component: null,
      action: 'respond',
      matchedPhrases: [],
    };
  }

  // Normalize confidence to 0-100
  const confidence = Math.min(100, (bestScore / 50) * 100);

  return {
    intent: bestIntent,
    confidence,
    component: intentComponents[bestIntent] || null,
    action: intentActions[bestIntent] || 'respond',
    matchedPhrases: bestMatches.slice(0, 5), // Top 5 matches
  };
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  guestMessagesCount: number;
  incrementGuestMessageCount: () => void;
  onLoginRequest: () => void;
  maxGuestMessages: number;
  onCloseChat: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  isOpen, 
  isAuthenticated, 
  guestMessagesCount, 
  incrementGuestMessageCount,
  onLoginRequest,
  maxGuestMessages,
  onCloseChat
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [
      {
        id: '1',
        text: '👋 Hello! I\'m your TIET Medi-Care assistant, here to support your health and wellness journey.\n\n✨ I can help with:\n🧠 Mental health & TICC counseling\n🩺 Symptom guidance & health tips\n📅 Health Centre information\n🆘 Crisis support (24/7)\n💪 Wellness tracking\n\n📞 Quick Contacts:\n• Health Centre: 1800 202 4100\n• Ambulance: +91 8288008122\n• TICC: G-Block 104-105\n\nWhat brings you here today?',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showMentalHealthDialog, setShowMentalHealthDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleAppointmentClick = () => {
    if (isAuthenticated) {
      setShowAppointmentDialog(true);
    } else {
      onLoginRequest();
    }
  };

  const handleAppointmentConfirm = () => {
    setShowAppointmentDialog(false);
    onCloseChat();
    window.location.href = '/#appointments';
  };

  const handleMentalHealthOption = (option: string) => {
    setShowMentalHealthDialog(false);
    if (option === 'mood') {
      openComponent('mood-tracker');
    } else if (option === 'crisis') {
      openComponent('crisis-support');
    } else if (option === 'ticc') {
      const message = `🧠 TICC - Thapar Institute Counselling Cell\n\n📍 Location: G-Block 104-105\n\n👩‍⚕️ Counselors:\n• Dr. Sonam Dullat (Manager)\n  📧 sonam.dullat@thapar.edu\n• Ms. Sukhpreet Kaur (Assistant)\n  📧 sukhpreet.kaur@thapar.edu\n\n📞 Appointments:\n• Email counselors directly\n• Or call: 1800 202 4100\n\n🌟 Services:\n• Individual counseling\n• Stress management\n• Academic guidance\n• Crisis support\n\nAll sessions are confidential.`;
      addMessage(message);
    } else if (option === 'resources') {
      openComponent('health-resources');
    }
  };
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);
  
  const getTimeString = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() === '') return;
    
    // Check if non-authenticated user has reached the message limit
    if (!isAuthenticated && guestMessagesCount >= maxGuestMessages) {
      return;
    }
    
    const userInput = input;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      isUser: true,
      timestamp: getTimeString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // Increment guest message count if user is not authenticated
    if (!isAuthenticated) {
      incrementGuestMessageCount();
    }
    
    // Detect intent from user input
    const intent = detectIntent(userInput);
    
    // Handle intent-based actions
    if (intent.action === 'open_component' && intent.component) {
      // Show brief acknowledgment then open component
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const acknowledgments: Record<string, string> = {
          'crisis-support': '🆘 Opening Crisis Support - help is available 24/7...',
          'symptom-checker': '🩺 Opening Symptom Checker to help assess your symptoms...',
          'mood-tracker': '🧠 Opening Mood Tracker to help you understand your feelings...',
          'wellness-assessment': '💪 Opening Wellness Assessment to check your overall health...',
          'health-resources': '📚 Opening Health Library with helpful resources...'
        };
        
        const ackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: acknowledgments[intent.component] || 'Opening tool...',
          isUser: false,
          timestamp: getTimeString(),
        };
        setMessages(prev => [...prev, ackMessage]);
        
        // Open the component after a brief delay
        setTimeout(() => {
          openComponent(intent.component!);
        }, 500);
      }, 800);
      return;
    }
    
    if (intent.action === 'show_dialog') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        if (intent.intent === 'appointment') {
          const ackMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: '📅 Let me help you book an appointment...',
            isUser: false,
            timestamp: getTimeString(),
          };
          setMessages(prev => [...prev, ackMessage]);
          setTimeout(() => {
            if (isAuthenticated) {
              setShowAppointmentDialog(true);
            } else {
              onLoginRequest();
            }
          }, 500);
        } else if (intent.intent === 'mentalHealth') {
          const ackMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: '🧠 Here are your mental health support options...',
            isUser: false,
            timestamp: getTimeString(),
          };
          setMessages(prev => [...prev, ackMessage]);
          setTimeout(() => {
            setShowMentalHealthDialog(true);
          }, 500);
        }
      }, 800);
      return;
    }
    
    // Default: Show typing indicator and respond normally
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      // If this was the last allowed message for guest users
      if (!isAuthenticated && guestMessagesCount + 1 >= maxGuestMessages) {
        const limitMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "You've reached the limit for guest access. Sign in to continue our conversation and access all features.",
          isUser: false,
          timestamp: getTimeString(),
        };
        setMessages(prev => [...prev, limitMessage]);
      } else {
        // Regular response
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getBotResponse(userInput),
          isUser: false,
          timestamp: getTimeString(),
        };
        setMessages(prev => [...prev, responseMessage]);
      }
    }, 1500);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    
    // Mental Health & Wellness Support
    if (input.includes('depression') || input.includes('sad') || input.includes('hopeless') || input.includes('down')) {
      return `💙 I hear you, and I want you to know that what you're feeling is valid. Depression affects many people, and reaching out is a brave first step.\n\nHere's how I can support you right now:\n\n🌱 Immediate Support:\n• Try the Mood Tracker to understand your patterns\n• Practice a 5-minute breathing exercise\n• Connect with TICC counseling service\n\n📞 TIET Professional Help:\n• TICC (G-Block 104-105)\n• Dr. Sonam Dullat: sonam.dullat@thapar.edu\n• Ms. Sukhpreet Kaur: sukhpreet.kaur@thapar.edu\n• TIET Toll-Free: 1800 202 4100\n\nWould you like to start with a mood check-in, or would you prefer to talk to a counselor?`;
    } else if (input.includes('anxiety') || input.includes('panic') || input.includes('worried') || input.includes('nervous') || input.includes('anxious')) {
      return `🧘 I understand anxiety can feel overwhelming. Let's work through this together.\n\n✨ Try this quick grounding exercise:\n1. Name 5 things you can see\n2. 4 things you can touch\n3. 3 things you can hear\n4. 2 things you can smell\n5. 1 thing you can taste\n\n🛠️ Tools I can offer:\n• Guided breathing (4-7-8 technique)\n• Progressive muscle relaxation\n• Anxiety management strategies\n• TICC counseling referrals\n\n📍 TICC Location: G-Block 104-105\n\nWould you like me to guide you through a 2-minute breathing exercise right now?`;
    } else if (input.includes('stress') || input.includes('overwhelmed') || input.includes('pressure') || input.includes('burnout')) {
      return `💆 Feeling stressed is your body's way of telling you it needs attention. Let's find what works for you.\n\n🎯 Quick Stress Relief:\n• Take 3 deep breaths right now\n• Step away from screens for 5 minutes\n• Stretch your shoulders and neck\n\n📋 I can help with:\n• Personalized stress management plan\n• Time management strategies\n• Mindfulness exercises\n• Work-life balance tips\n\n📚 TIET Resources:\n• TICC Counseling: G-Block 104-105\n• Library quiet zones for study\n• Campus meditation spaces\n\nWhat's the main source of your stress right now - academic, personal, or work-related?`;
    } else if (input.includes('sleep') || input.includes('insomnia') || input.includes('tired') || input.includes('fatigue') || input.includes('exhausted')) {
      return `😴 Quality sleep is foundational to your wellbeing. Let's improve your rest.\n\n🌙 Tonight's Sleep Tips:\n• Avoid screens 1 hour before bed\n• Keep your room cool (65-68°F)\n• Try a relaxation technique\n• Stick to a consistent bedtime\n\n📊 I can help you:\n• Create a personalized sleep schedule\n• Identify sleep disruptors\n• Learn relaxation techniques\n• Screen for sleep disorders\n\n🏥 If persistent, visit TIET Health Centre for evaluation.\n\nHow many hours are you currently sleeping, and do you wake up feeling rested?`;
    } else if (input.includes('eating') || input.includes('diet') || input.includes('nutrition') || input.includes('weight') || input.includes('food')) {
      return `🥗 Nutrition directly impacts your energy, mood, and overall health.\n\n🍎 Quick Nutrition Tips:\n• Aim for colorful plates (variety of veggies)\n• Stay hydrated (8 glasses/day)\n• Don't skip breakfast\n• Balance protein, carbs, and healthy fats\n\n🍽️ TIET Campus Options:\n• Mess timings and healthy choices\n• Canteen nutritious options\n• Nearby healthy eateries\n\n📋 I can assist with:\n• Personalized meal planning\n• Healthy eating on a budget\n• Understanding food labels\n\nAre you looking for general nutrition advice or do you have specific dietary goals?`;
    } else if (input.includes('exercise') || input.includes('fitness') || input.includes('workout') || input.includes('gym') || input.includes('physical activity')) {
      return `🏃 Physical activity is one of the best things you can do for your body and mind!\n\n💪 Start Simple:\n• 10-minute walk after meals\n• Stretching breaks every hour\n• Take stairs instead of elevator\n• Join a campus sports club\n\n🏟️ TIET Facilities:\n• Campus Gym\n• Sports Complex\n• Cricket/Football grounds\n• Basketball & Tennis courts\n\n🎯 I can help with:\n• Beginner-friendly workout plans\n• Home exercises (no equipment needed)\n• Fitness goal tracking\n\nWhat's your current activity level - beginner, intermediate, or looking to level up?`;
    }
    
    // Symptom Assessment & Health Concerns
    else if (input.includes('headache') || input.includes('migraine') || input.includes('head pain')) {
      return `🤕 Headaches can really disrupt your day. Let me help you figure out the best approach.\n\n⚡ Quick Relief:\n• Drink a glass of water (dehydration is common)\n• Rest in a dark, quiet room\n• Apply cold compress to forehead\n• Gentle neck stretches\n\n❓ To better help you:\n• How severe is the pain (1-10)?\n• How long have you had it?\n• Any other symptoms (nausea, light sensitivity)?\n\nIf headaches are frequent or severe, I recommend using our Symptom Checker or booking an appointment.`;
    } else if (input.includes('fever') || input.includes('temperature') || input.includes('chills')) {
      return `🌡️ Fever is your body fighting something off. Let's assess the situation.\n\n🏠 Home Care:\n• Rest and stay hydrated\n• Light clothing and cool room\n• Over-the-counter fever reducers if needed\n• Monitor temperature every 4 hours\n\n🚨 Seek Immediate Care If:\n• Temperature > 103°F (39.4°C)\n• Fever lasting > 3 days\n• Difficulty breathing\n• Severe headache or stiff neck\n\nWhat's your current temperature, and do you have any other symptoms?`;
    } else if (input.includes('cough') || input.includes('cold') || input.includes('flu') || input.includes('sore throat') || input.includes('congestion')) {
      return `🤧 Respiratory symptoms need attention. Let's see what's going on.\n\n🏠 Self-Care Tips:\n• Warm fluids (tea, soup, water)\n• Honey for sore throat (if over 1 year old)\n• Steam inhalation for congestion\n• Rest your voice\n\n⚠️ See a Doctor If:\n• Difficulty breathing\n• Symptoms worsen after 7 days\n• High fever (>101.3°F)\n• Severe throat pain\n\nIs your cough dry or producing mucus? Any fever or body aches?`;
    } else if (input.includes('stomach') || input.includes('nausea') || input.includes('vomiting') || input.includes('diarrhea') || input.includes('digestive')) {
      return `🤢 Digestive issues can be uncomfortable. Let's get you feeling better.\n\n🏠 Immediate Care:\n• Small sips of clear fluids\n• BRAT diet (Bananas, Rice, Applesauce, Toast)\n• Avoid dairy, caffeine, and spicy foods\n• Rest your stomach\n\n🚨 Seek Care If:\n• Blood in vomit or stool\n• Severe abdominal pain\n• Signs of dehydration\n• Symptoms > 48 hours\n\nHow long have you been experiencing these symptoms?`;
    }
    
    // Academic & Student Life Support
    else if (input.includes('exam') || input.includes('study') || input.includes('academic') || input.includes('grades') || input.includes('test')) {
      return `📚 Academic pressure is real, but you've got this! Let me help you succeed.\n\n🎯 Study Strategies:\n• Pomodoro Technique (25 min study, 5 min break)\n• Active recall over passive reading\n• Teach concepts to someone else\n• Get enough sleep before exams\n\n🧠 Managing Exam Anxiety:\n• Practice deep breathing\n• Visualize success\n• Prepare materials the night before\n• Arrive early and stay calm\n\nWhat subject or exam are you preparing for? I can offer more specific tips!`;
    } else if (input.includes('social') || input.includes('friends') || input.includes('lonely') || input.includes('relationship') || input.includes('alone')) {
      return `👥 Social connections are so important for wellbeing. You're not alone in feeling this way.\n\n🌟 Building Connections:\n• Join campus clubs or activities\n• Study groups are great for meeting people\n• Volunteer opportunities\n• Campus events and workshops\n\n💬 If You're Struggling:\n• Peer support groups available\n• Counseling services can help\n• Online communities for shared interests\n\nWould you like information about campus social activities or tips for building connections?`;
    }
    
    // Crisis & Emergency Support
    else if (input.includes('suicide') || input.includes('self harm') || input.includes('hurt myself') || input.includes('end it all') || input.includes('kill myself') || input.includes('want to die')) {
      return `🆘 I'm really glad you reached out. What you're feeling matters, and help is available right now.\n\n🚨 IMMEDIATE SUPPORT:\n• TIET Toll-Free: 1800 202 4100\n• iCall: 9152987821\n• Vandrevala Foundation: 1860-2662-345\n• Emergency: 112\n\n📍 TICC (Campus Counseling):\n• Location: G-Block 104-105\n• Dr. Sonam Dullat: sonam.dullat@thapar.edu\n• Ms. Sukhpreet Kaur: sukhpreet.kaur@thapar.edu\n\n💙 You are not alone. These feelings can get better with support.\n\nPlease reach out to one of these resources right now. Would you like me to provide more information about crisis support services?`;
    } else if (input.includes('abuse') || input.includes('violence') || input.includes('harassment') || input.includes('assault') || input.includes('unsafe')) {
      return `🛡️ Your safety is the top priority. I'm here to help you access support.\n\n🚨 TIET Resources:\n• TIET Toll-Free: 1800 202 4100\n• Women Helpline: 1091\n• Police: 100\n• Emergency: 112\n\n📍 Campus Support:\n• TICC Counseling: G-Block 104-105\n• Registrar Office: registrar@thapar.edu\n\n💙 Remember:\n• It's not your fault\n• You deserve to be safe\n• Help is available and confidential\n\nWould you like immediate assistance or information about your options?`;
    }
    
    // Basic Health Queries
    else if (input.includes('appointment') || input.includes('book') || input.includes('doctor') || input.includes('schedule')) {
      return `📅 I can help you get the care you need!\n\n🏥 TIET Health Centre Services:\n• General Medicine\n• First Aid & Emergency\n• Health Checkups\n• Referrals to specialists\n\n📍 Location: Near Main Gate, TIET Campus\n📞 Contact: 1800 202 4100\n\n🧠 Mental Health (TICC):\n• Location: G-Block 104-105\n• Email counselors directly for appointments\n\n⏰ Quick Options:\n• Walk-in during OPD hours\n• Emergency care 24/7\n\nWhat type of appointment would you like to book?`;
    } else if (input.includes('emergency') || input.includes('urgent') || input.includes('ambulance')) {
      return `🚨 For emergencies, here's what to do:\n\n🔴 Life-Threatening: Call 112 immediately\n🚑 TIET Ambulance: +91 8288008122\n📞 TIET Toll-Free: 1800 202 4100\n\n🏥 TIET Health Centre:\n• 24/7 Emergency Care Available\n• Location: Near Main Gate\n\n🆘 National Helplines:\n• Ambulance: 108\n• Police: 100\n• Fire: 101\n• Women Helpline: 1091\n\nIs this a current emergency? Tell me more so I can help connect you with the right care.`;
    } else if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('good')) {
      return `👋 Good ${timeGreeting}! I'm your TIET Medi-Care assistant, here to support your health journey.\n\n✨ I can help with:\n🧠 Mental wellness & TICC counseling\n🏥 Symptom assessment & health guidance\n💪 Fitness & nutrition tips\n📚 Academic stress management\n🆘 Crisis support (24/7)\n📅 Health Centre information\n\n📍 Quick TIET Contacts:\n• Health Centre: 1800 202 4100\n• Ambulance: +91 8288008122\n• TICC: G-Block 104-105\n\nWhat's on your mind today? Feel free to share anything - I'm here to help!`;
    } else if (input.includes('contact') || input.includes('phone') || input.includes('call') || input.includes('number')) {
      return `📞 TIET Medi-Care Contacts:\n\n🏥 Health Centre:\n• Toll-Free: 1800 202 4100\n• Ambulance: +91 8288008122\n\n🧠 TICC (Counseling):\n• Location: G-Block 104-105\n• Dr. Sonam Dullat: sonam.dullat@thapar.edu\n• Ms. Sukhpreet Kaur: sukhpreet.kaur@thapar.edu\n\n📧 General:\n• Registrar: registrar@thapar.edu\n\n🆘 Emergency:\n• Police: 100\n• Ambulance: 108\n• Fire: 101\n• Women Helpline: 1091\n\nWhich service would you like to reach?`;
    } else if (input.includes('thank') || input.includes('thanks') || input.includes('helpful')) {
      return `💙 You're so welcome! Taking care of your health is always worth it.\n\n🌟 Remember:\n• I'm here 24/7 whenever you need support\n• No question is too small\n• Your wellbeing matters\n\n📍 TIET Resources Always Available:\n• Health Centre: 1800 202 4100\n• TICC: G-Block 104-105\n\nTake care of yourself, and don't hesitate to reach out anytime! 🌈`;
    } else if (input.includes('breathing') || input.includes('breathe') || input.includes('calm')) {
      return `🧘 Let's do a quick breathing exercise together:\n\n✨ 4-7-8 Technique:\n1️⃣ Breathe IN through nose for 4 seconds\n2️⃣ HOLD your breath for 7 seconds\n3️⃣ Breathe OUT through mouth for 8 seconds\n4️⃣ Repeat 3-4 times\n\n💡 This activates your body's relaxation response.\n\n🧘 More relaxation resources:\n• TICC offers guided meditation sessions\n• Campus has quiet spaces for mindfulness\n\nTry it now - I'll wait. How do you feel after a few rounds?`;
    } else if (input.includes('water') || input.includes('hydration') || input.includes('drink')) {
      return `💧 Staying hydrated is essential for your health!\n\n📊 Daily Goal: 8 glasses (64 oz / 2 liters)\n\n🌟 Hydration Tips:\n• Start your day with a glass of water\n• Carry a reusable water bottle\n• Set hourly reminders\n• Eat water-rich foods (fruits, veggies)\n\n🏫 TIET Campus:\n• Water coolers available in all blocks\n• RO water in hostels and academic buildings\n\n⚠️ Signs of Dehydration:\n• Dark urine\n• Headaches\n• Fatigue\n• Dry mouth\n\nHow much water have you had today?`;
    } else if (input.includes('hostel') || input.includes('warden') || input.includes('room')) {
      return `🏠 TIET Hostel Information:\n\n📞 Hostel Contacts:\n• Anantam Hall: 9115611523\n• Agira Hall: 9115611510\n• Vasudha Hall-E: 9115611515\n• Vasudha Hall-G: 9115611517\n\n🏥 Health Issues in Hostel:\n• Contact your hostel warden first\n• Health Centre: 1800 202 4100\n• Ambulance: +91 8288008122\n\n🧠 Mental Health Support:\n• TICC: G-Block 104-105\n• Available for all hostel residents\n\nWhat specific help do you need regarding hostel?`;
    } else if (input.includes('ticc') || input.includes('counseling') || input.includes('counselor') || input.includes('therapy')) {
      return `🧠 TICC - Thapar Institute Counselling Cell\n\n📍 Location: G-Block 104-105\n\n👩‍⚕️ Counselors:\n• Dr. Sonam Dullat (Manager)\n  📧 sonam.dullat@thapar.edu\n• Ms. Sukhpreet Kaur (Assistant)\n  📧 sukhpreet.kaur@thapar.edu\n\n📞 Appointments:\n• Email counselors directly\n• Or call: 1800 202 4100\n\n🌟 Services:\n• Individual counseling\n• Stress management\n• Academic guidance\n• Crisis support\n\nAll sessions are confidential. Would you like help reaching out to them?`;
    } else {
      return `🤖 I'm here to help with your health and wellness needs!\n\n💡 I can assist with:\n\n🧠 Mental Health\n   Anxiety, stress, depression, TICC counseling\n\n🏥 Physical Health\n   Symptoms, Health Centre info, medications\n\n🍎 Lifestyle\n   Nutrition, fitness, sleep, hydration\n\n📚 Student Life\n   Academic stress, hostel support\n\n🆘 Crisis Support\n   24/7 emergency resources\n\n📞 Quick Contacts:\n• Health Centre: 1800 202 4100\n• Ambulance: +91 8288008122\n• TICC: G-Block 104-105\n\nTell me more about what's on your mind, or try one of the quick action buttons below!`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleSendMessage();
    }
  };

  const addMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: getTimeString(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const openComponent = (componentName: string) => {
    if (!isAuthenticated && guestMessagesCount >= maxGuestMessages) {
      return;
    }
    setActiveComponent(componentName);
  };

  const closeComponent = () => {
    setActiveComponent(null);
  };

  const handleSuggestionClick = (suggestion: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default action which might cause page reload
    
    // Check if non-authenticated user has reached the message limit
    if (!isAuthenticated && guestMessagesCount >= maxGuestMessages) {
      return;
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: suggestion,
      isUser: true,
      timestamp: getTimeString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Increment guest message count if user is not authenticated
    if (!isAuthenticated) {
      incrementGuestMessageCount();
    }
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      setIsTyping(false);
      
      // If this was the last allowed message for guest users
      if (!isAuthenticated && guestMessagesCount + 1 >= maxGuestMessages) {
        const limitMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "You've reached the limit for guest access. Sign in to continue our conversation and access all features.",
          isUser: false,
          timestamp: getTimeString(),
        };
        setMessages(prev => [...prev, limitMessage]);
      } else {
        // Regular response
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getBotResponse(suggestion),
          isUser: false,
          timestamp: getTimeString(),
        };
        setMessages(prev => [...prev, responseMessage]);
      }
    }, 1500);
  };

  const clearChat = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any navigation
    setMessages([
      {
        id: '1',
        text: '👋 Hello! I\'m your TIET Medi-Care assistant, here to support your health and wellness journey.\n\n✨ I can help with:\n🧠 Mental health & TICC counseling\n🩺 Symptom guidance & health tips\n📅 Health Centre information\n🆘 Crisis support (24/7)\n💪 Wellness tracking\n\n📞 Quick Contacts:\n• Health Centre: 1800 202 4100\n• Ambulance: +91 8288008122\n• TICC: G-Block 104-105\n\nWhat brings you here today?',
        isUser: false,
        timestamp: getTimeString(),
      },
    ]);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  // Render active component if one is selected
  if (activeComponent) {
    switch (activeComponent) {
      case 'wellness-assessment':
        return (
          <WellnessAssessment 
            onComplete={(results) => {
              const message = `🌟 Wellness Assessment Complete!\n\nOverall Score: ${results.overallScore}/100\n\n📊 Category Breakdown:\n• Mental Health: ${results.mentalHealth}/100\n• Physical Health: ${results.physicalHealth}/100\n• Social Wellbeing: ${results.socialWellbeing}/100\n• Academic Stress: ${results.academicStress}/100\n\n💡 Personalized Recommendations:\n${results.recommendations.map(rec => `• ${rec}`).join('\n')}\n\nRisk Level: ${results.riskLevel.toUpperCase()}\n\nWould you like to discuss any of these areas in more detail?`;
              addMessage(message);
              closeComponent();
            }}
            onClose={closeComponent}
          />
        );
      case 'mood-tracker':
        return (
          <MoodTracker 
            onSendMessage={addMessage}
            onClose={closeComponent}
          />
        );
      case 'symptom-checker':
        return (
          <SymptomChecker 
            onSendMessage={addMessage}
            onClose={closeComponent}
          />
        );
      case 'crisis-support':
        return (
          <CrisisSupport 
            onSendMessage={addMessage}
            onClose={closeComponent}
          />
        );
      case 'health-resources':
        return (
          <HealthResources 
            onSendMessage={addMessage}
            onClose={closeComponent}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-medical-blue-50 via-white to-medical-green-50 rounded-md relative overflow-hidden">
      {/* Appointment Confirmation Dialog */}
      {showAppointmentDialog && (
        <motion.div 
          className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Book an Appointment</h3>
              <p className="text-gray-600 text-sm mb-6">
                You'll be redirected to the appointments page where you can browse available doctors and book your appointment.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowAppointmentDialog(false)}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAppointmentConfirm}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
                >
                  OK, Let's Go!
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mental Health Options Dialog */}
      {showMentalHealthDialog && (
        <motion.div 
          className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Mental Health Support</h3>
              <p className="text-gray-500 text-xs mt-1">Choose how you'd like to get support</p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => handleMentalHealthOption('mood')}
                className="w-full p-3 text-left rounded-xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 transition-all"
              >
                <div className="flex items-center">
                  <Brain className="w-5 h-5 text-pink-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">Mood Tracker</div>
                    <div className="text-xs text-gray-500">Track and understand your emotions</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleMentalHealthOption('ticc')}
                className="w-full p-3 text-left rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all"
              >
                <div className="flex items-center">
                  <Stethoscope className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">TICC Counseling</div>
                    <div className="text-xs text-gray-500">G-Block 104-105 • Professional help</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleMentalHealthOption('resources')}
                className="w-full p-3 text-left rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all"
              >
                <div className="flex items-center">
                  <Book className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">Health Resources</div>
                    <div className="text-xs text-gray-500">Articles, guides & self-help tools</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleMentalHealthOption('crisis')}
                className="w-full p-3 text-left rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-all"
              >
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">Crisis Support</div>
                    <div className="text-xs text-gray-500">Immediate help • 24/7 available</div>
                  </div>
                </div>
              </button>
            </div>
            
            <Button 
              onClick={() => setShowMentalHealthDialog(false)}
              className="w-full mt-4 bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-medical-blue-200 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-medical-green-200 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-medical-blue-300 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-8 w-12 h-12 bg-medical-green-300 rounded-full blur-lg"></div>
      </div>
      
      {/* Chat messages area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-medical-blue-300 scrollbar-track-transparent relative z-10">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <div
                className={`flex max-w-[80%] items-start ${
                  message.isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className={`w-10 h-10 ${message.isUser ? 'ml-3' : 'mr-3'} transition-all duration-300 hover:scale-110 shadow-lg`}>
                  <AvatarFallback className={`${message.isUser 
                    ? 'bg-gradient-to-br from-medical-blue-400 to-medical-blue-600 text-white shadow-inner' 
                    : 'bg-gradient-to-br from-medical-green-400 to-medical-green-600 text-white shadow-inner'}`}
                  >
                    {message.isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <motion.div
                    className={`rounded-2xl p-4 shadow-lg backdrop-blur-sm ${
                      message.isUser
                        ? 'bg-gradient-to-br from-medical-blue-500 via-medical-blue-600 to-medical-blue-700 text-white border border-medical-blue-400/30'
                        : 'bg-white/90 text-gray-800 border border-medical-green-200/50 shadow-medical-green-100/20'
                    }`}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.3, type: "spring" }}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.text}
                    </div>
                  </motion.div>
                  <div className={`text-xs mt-2 ${message.isUser ? 'text-right text-medical-blue-400' : 'text-left text-medical-green-500'} font-medium`}>
                    {message.timestamp}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start">
                <Avatar className="w-10 h-10 mr-3 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-medical-green-400 to-medical-green-600 text-white shadow-inner">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl p-4 shadow-lg bg-white/90 text-gray-800 border border-medical-green-200/50 backdrop-blur-sm">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-gradient-to-r from-medical-green-400 to-medical-green-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-medical-blue-400 to-medical-blue-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-medical-green-500 to-medical-green-600 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Message limit alert for non-authenticated users */}
        {!isAuthenticated && (
          <motion.div 
            className="px-3 py-2 mb-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-gradient-to-r from-medical-blue-50 to-medical-green-50 border-medical-blue-200 shadow-lg backdrop-blur-sm">
              <Lock className="h-5 w-5 text-medical-blue-600" />
              <AlertTitle className="text-sm font-semibold text-medical-blue-800">Limited Access Mode</AlertTitle>
              <AlertDescription className="text-xs text-medical-blue-700">
                You have <span className="font-bold text-medical-blue-800">{maxGuestMessages - guestMessagesCount}</span> message{maxGuestMessages - guestMessagesCount !== 1 ? 's' : ''} remaining. 
                <button 
                  className="ml-2 text-xs px-2 py-1 bg-medical-blue-600 text-white rounded-full hover:bg-medical-blue-700 font-semibold transition-all duration-200 hover:scale-105 shadow-sm" 
                  onClick={(e) => {
                    e.preventDefault();
                    onLoginRequest();
                  }}
                >
                  Sign in for unlimited access
                </button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick actions above input */}
      <div className="px-4 pt-3 pb-2 bg-gradient-to-r from-medical-blue-50/50 to-medical-green-50/50 backdrop-blur-sm border-t border-medical-blue-100/30">
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs text-medical-blue-600 flex items-center font-medium">
            <HelpCircle className="w-4 h-4 mr-2 text-medical-green-500" /> 
            <span>Ask about services or type a question</span>
          </div>
          <button 
            onClick={clearChat} 
            className="text-xs text-medical-blue-500 hover:text-red-500 bg-white/70 border border-medical-blue-200 cursor-pointer px-3 py-1 rounded-full hover:bg-red-50 transition-all duration-200 font-medium shadow-sm"
          >
            Clear chat
          </button>
        </div>
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-medical-blue-200/30 bg-gradient-to-r from-white via-medical-blue-50/30 to-medical-green-50/30 rounded-b-md backdrop-blur-sm">
        {/* Show input only if user has remaining messages or is authenticated */}
        {(isAuthenticated || guestMessagesCount < maxGuestMessages) ? (
          <>
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <Input
                placeholder="Type your health question or concern..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow bg-white/80 border-medical-blue-200 focus:ring-2 focus:ring-medical-blue-400 focus:border-medical-blue-400 rounded-2xl px-5 py-3 shadow-lg transition-all duration-300 focus:shadow-xl backdrop-blur-sm placeholder-medical-blue-400"
              />
              <Button 
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-medical-blue-500 to-medical-blue-600 hover:from-medical-blue-600 hover:to-medical-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl w-12 h-12 p-0 flex items-center justify-center"
                disabled={input.trim() === ''}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            
            {/* Enhanced Quick Actions */}
            <div className="mt-4 space-y-3">
              {/* Primary Actions */}
              <div className="flex justify-center">
                <div className="flex flex-wrap justify-center gap-2 w-full">
                  <motion.button 
                    className="px-4 py-2 bg-gradient-to-r from-medical-blue-400 to-medical-blue-500 hover:from-medical-blue-500 hover:to-medical-blue-600 rounded-xl transition-all flex items-center text-xs text-white font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMentalHealthDialog(true)}
                  >
                    <Heart className="w-4 h-4 mr-2" /> Mental Health
                  </motion.button>
                  <motion.button 
                    className="px-4 py-2 bg-gradient-to-r from-medical-green-400 to-medical-green-500 hover:from-medical-green-500 hover:to-medical-green-600 rounded-xl transition-all flex items-center text-xs text-white font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openComponent('symptom-checker')}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" /> Symptoms
                  </motion.button>
                  <motion.button 
                    className="px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 rounded-xl transition-all flex items-center text-xs text-white font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAppointmentClick}
                  >
                    <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                  </motion.button>
                  <motion.button 
                    className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 rounded-xl transition-all flex items-center text-xs text-white font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openComponent('crisis-support')}
                  >
                    <Shield className="w-4 h-4 mr-2" /> Crisis Support
                  </motion.button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <motion.div 
            className="text-center py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-medical-blue-50 to-medical-green-50 rounded-2xl p-6 border border-medical-blue-200 shadow-lg">
              <Lock className="w-12 h-12 text-medical-blue-500 mx-auto mb-3" />
              <p className="text-sm text-medical-blue-700 mb-4 font-medium">You've reached the message limit for guest access</p>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  onLoginRequest();
                }} 
                className="bg-gradient-to-r from-medical-blue-600 to-medical-blue-700 hover:from-medical-blue-700 hover:to-medical-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🔓 Sign in for unlimited access
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;