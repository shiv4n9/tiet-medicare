import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Calendar, AlertCircle, Heart, HelpCircle, Lock, Brain, Activity, Stethoscope, Book, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import WellnessAssessment from './WellnessAssessment';
import MoodTracker from './MoodTracker';
import SymptomChecker from './SymptomChecker';
import CrisisSupport from './CrisisSupport';
import HealthResources from './HealthResources';

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
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  isOpen, 
  isAuthenticated, 
  guestMessagesCount, 
  incrementGuestMessageCount,
  onLoginRequest,
  maxGuestMessages
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [
      {
        id: '1',
        text: '👋 Hello! I\'m your TIET Medi-Care assistant, here to support your health and wellness journey. \n\n✨ I can help with:\n🧠 Mental health support\n🩺 Symptom guidance\n📅 Appointment booking\n🆘 Crisis support\n💪 Wellness tracking\n\nWhat brings you here today?',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: getTimeString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
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
          text: getBotResponse(input),
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
      return `💙 I hear you, and I want you to know that what you're feeling is valid. Depression affects many people, and reaching out is a brave first step.\n\nHere's how I can support you right now:\n\n🌱 Immediate Support:\n• Try the Mood Tracker to understand your patterns\n• Practice a 5-minute breathing exercise\n• Connect with our 24/7 counseling service\n\n📞 Professional Help:\n• Campus Counseling: +91-175-239-3000\n• Crisis Line: 988 (available 24/7)\n\nWould you like to start with a mood check-in, or would you prefer to talk to a counselor?`;
    } else if (input.includes('anxiety') || input.includes('panic') || input.includes('worried') || input.includes('nervous') || input.includes('anxious')) {
      return `🧘 I understand anxiety can feel overwhelming. Let's work through this together.\n\n✨ Try this quick grounding exercise:\n1. Name 5 things you can see\n2. 4 things you can touch\n3. 3 things you can hear\n4. 2 things you can smell\n5. 1 thing you can taste\n\n🛠️ Tools I can offer:\n• Guided breathing (4-7-8 technique)\n• Progressive muscle relaxation\n• Anxiety management strategies\n• Professional therapy referrals\n\nWould you like me to guide you through a 2-minute breathing exercise right now?`;
    } else if (input.includes('stress') || input.includes('overwhelmed') || input.includes('pressure') || input.includes('burnout')) {
      return `💆 Feeling stressed is your body's way of telling you it needs attention. Let's find what works for you.\n\n🎯 Quick Stress Relief:\n• Take 3 deep breaths right now\n• Step away from screens for 5 minutes\n• Stretch your shoulders and neck\n\n📋 I can help with:\n• Personalized stress management plan\n• Time management strategies\n• Mindfulness exercises\n• Work-life balance tips\n\nWhat's the main source of your stress right now - academic, personal, or work-related?`;
    } else if (input.includes('sleep') || input.includes('insomnia') || input.includes('tired') || input.includes('fatigue') || input.includes('exhausted')) {
      return `😴 Quality sleep is foundational to your wellbeing. Let's improve your rest.\n\n🌙 Tonight's Sleep Tips:\n• Avoid screens 1 hour before bed\n• Keep your room cool (65-68°F)\n• Try a relaxation technique\n• Stick to a consistent bedtime\n\n📊 I can help you:\n• Create a personalized sleep schedule\n• Identify sleep disruptors\n• Learn relaxation techniques\n• Screen for sleep disorders\n\nHow many hours are you currently sleeping, and do you wake up feeling rested?`;
    } else if (input.includes('eating') || input.includes('diet') || input.includes('nutrition') || input.includes('weight') || input.includes('food')) {
      return `🥗 Nutrition directly impacts your energy, mood, and overall health.\n\n🍎 Quick Nutrition Tips:\n• Aim for colorful plates (variety of veggies)\n• Stay hydrated (8 glasses/day)\n• Don't skip breakfast\n• Balance protein, carbs, and healthy fats\n\n📋 I can assist with:\n• Personalized meal planning\n• Healthy eating on a budget\n• Understanding food labels\n• Addressing specific dietary concerns\n\nAre you looking for general nutrition advice or do you have specific dietary goals?`;
    } else if (input.includes('exercise') || input.includes('fitness') || input.includes('workout') || input.includes('gym') || input.includes('physical activity')) {
      return `🏃 Physical activity is one of the best things you can do for your body and mind!\n\n💪 Start Simple:\n• 10-minute walk after meals\n• Stretching breaks every hour\n• Take stairs instead of elevator\n• Join a campus sports club\n\n🎯 I can help with:\n• Beginner-friendly workout plans\n• Campus gym information\n• Home exercises (no equipment needed)\n• Fitness goal tracking\n\nWhat's your current activity level - beginner, intermediate, or looking to level up?`;
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
      return `🆘 I'm really glad you reached out. What you're feeling matters, and help is available right now.\n\n🚨 IMMEDIATE SUPPORT:\n• National Suicide Prevention: 988\n• Crisis Text Line: Text HOME to 741741\n• Campus Counseling: +91-175-239-3000\n• Emergency Services: 112\n\n💙 You are not alone. These feelings can get better with support.\n\nPlease reach out to one of these resources right now. Would you like me to provide more information about crisis support services?`;
    } else if (input.includes('abuse') || input.includes('violence') || input.includes('harassment') || input.includes('assault') || input.includes('unsafe')) {
      return `🛡️ Your safety is the top priority. I'm here to help you access support.\n\n🚨 Confidential Resources:\n• Campus Security: +91-175-239-3001\n• Counseling Services: 24/7 available\n• Student Advocacy Office\n• Medical Care (confidential)\n\n💙 Remember:\n• It's not your fault\n• You deserve to be safe\n• Help is available and confidential\n\nWould you like immediate assistance or information about your options?`;
    }
    
    // Basic Health Queries
    else if (input.includes('appointment') || input.includes('book') || input.includes('doctor') || input.includes('schedule')) {
      return `📅 I can help you get the care you need!\n\n🏥 Available Services:\n• General Medicine\n• Mental Health Counseling\n• Women's Health\n• Dermatology\n• Nutrition Counseling\n• Physical Therapy\n\n⏰ Quick Options:\n• Same-day urgent appointments\n• Telehealth consultations\n• Scheduled follow-ups\n\nWhat type of appointment would you like to book? I can check availability for you.`;
    } else if (input.includes('emergency') || input.includes('urgent')) {
      return `🚨 For emergencies, here's what to do:\n\n🔴 Life-Threatening: Call 112 immediately\n🟠 Campus Emergency: +91-175-239-3000\n🟡 After-Hours Clinic: Available 24/7\n🔵 Mental Health Crisis: Crisis hotline 24/7\n\n📍 Campus Health Center Location:\n[Provide location details]\n\nIs this a current emergency? Tell me more so I can help connect you with the right care.`;
    } else if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('good')) {
      return `👋 Good ${timeGreeting}! I'm your TIET Medi-Care assistant, here to support your health journey.\n\n✨ I can help with:\n🧠 Mental wellness & counseling\n🏥 Symptom assessment & care\n💪 Fitness & nutrition guidance\n📚 Academic stress management\n🆘 Crisis support (24/7)\n📅 Appointment booking\n\nWhat's on your mind today? Feel free to share anything - I'm here to help!`;
    } else if (input.includes('contact') || input.includes('phone') || input.includes('call') || input.includes('number')) {
      return `📞 TIET Medi-Care Contacts:\n\n🏥 Main Office: +91-175-239-3000\n🚨 Emergency: +91-175-239-3001\n🧠 Mental Health: 24/7 Crisis Line\n📧 Email: medicare@thapar.edu\n\n⏰ Hours:\n• Weekdays: 8 AM - 6 PM\n• Weekends: Emergency on-call\n• Crisis Support: 24/7\n\nWhich service would you like to reach?`;
    } else if (input.includes('thank') || input.includes('thanks') || input.includes('helpful')) {
      return `💙 You're so welcome! Taking care of your health is always worth it.\n\n🌟 Remember:\n• I'm here 24/7 whenever you need support\n• No question is too small\n• Your wellbeing matters\n\nTake care of yourself, and don't hesitate to reach out anytime! 🌈`;
    } else if (input.includes('breathing') || input.includes('breathe') || input.includes('calm')) {
      return `🧘 Let's do a quick breathing exercise together:\n\n✨ 4-7-8 Technique:\n1️⃣ Breathe IN through nose for 4 seconds\n2️⃣ HOLD your breath for 7 seconds\n3️⃣ Breathe OUT through mouth for 8 seconds\n4️⃣ Repeat 3-4 times\n\n💡 This activates your body's relaxation response.\n\nTry it now - I'll wait. How do you feel after a few rounds?`;
    } else if (input.includes('water') || input.includes('hydration') || input.includes('drink')) {
      return `💧 Staying hydrated is essential for your health!\n\n📊 Daily Goal: 8 glasses (64 oz / 2 liters)\n\n🌟 Hydration Tips:\n• Start your day with a glass of water\n• Carry a reusable water bottle\n• Set hourly reminders\n• Eat water-rich foods (fruits, veggies)\n\n⚠️ Signs of Dehydration:\n• Dark urine\n• Headaches\n• Fatigue\n• Dry mouth\n\nHow much water have you had today?`;
    } else {
      return `🤖 I'm here to help with your health and wellness needs!\n\n💡 I can assist with:\n\n🧠 Mental Health\n   Anxiety, stress, depression, mood tracking\n\n🏥 Physical Health\n   Symptoms, checkups, medications\n\n🍎 Lifestyle\n   Nutrition, fitness, sleep, hydration\n\n📚 Student Life\n   Academic stress, social support\n\n🆘 Crisis Support\n   24/7 emergency resources\n\nTell me more about what's on your mind, or try one of the quick action buttons below!`;
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
        text: '👋 Hello! I\'m your TIET Medi-Care assistant, here to support your health and wellness journey. \n\n✨ I can help with:\n🧠 Mental health support\n🩺 Symptom guidance\n📅 Appointment booking\n🆘 Crisis support\n💪 Wellness tracking\n\nWhat brings you here today?',
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
                    onClick={(e) => handleSuggestionClick("I'm feeling anxious and stressed", e)}
                  >
                    <Heart className="w-4 h-4 mr-2" /> Mental Health
                  </motion.button>
                  <motion.button 
                    className="px-4 py-2 bg-gradient-to-r from-medical-green-400 to-medical-green-500 hover:from-medical-green-500 hover:to-medical-green-600 rounded-xl transition-all flex items-center text-xs text-white font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleSuggestionClick("I have a headache and fever", e)}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" /> Symptoms
                  </motion.button>
                  <motion.button 
                    className="px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 rounded-xl transition-all flex items-center text-xs text-white font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleSuggestionClick("Book an appointment", e)}
                  >
                    <Calendar className="w-4 h-4 mr-2" /> Appointments
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
              
              {/* Advanced Tools */}
              <div className="flex justify-center">
                <div className="flex flex-wrap justify-center gap-2 w-full">
                  <motion.button 
                    className="px-3 py-2 bg-gradient-to-r from-indigo-300 to-indigo-400 hover:from-indigo-400 hover:to-indigo-500 rounded-lg transition-all flex items-center text-xs text-white font-medium shadow-md hover:shadow-lg backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openComponent('wellness-assessment')}
                  >
                    <Activity className="w-3 h-3 mr-1" /> Wellness Check
                  </motion.button>
                  <motion.button 
                    className="px-3 py-2 bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 rounded-lg transition-all flex items-center text-xs text-white font-medium shadow-md hover:shadow-lg backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openComponent('mood-tracker')}
                  >
                    <Brain className="w-3 h-3 mr-1" /> Mood Tracker
                  </motion.button>
                  <motion.button 
                    className="px-3 py-2 bg-gradient-to-r from-teal-300 to-teal-400 hover:from-teal-400 hover:to-teal-500 rounded-lg transition-all flex items-center text-xs text-white font-medium shadow-md hover:shadow-lg backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openComponent('symptom-checker')}
                  >
                    <Stethoscope className="w-3 h-3 mr-1" /> Symptom Checker
                  </motion.button>
                  <motion.button 
                    className="px-3 py-2 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 rounded-lg transition-all flex items-center text-xs text-white font-medium shadow-md hover:shadow-lg backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openComponent('health-resources')}
                  >
                    <Book className="w-3 h-3 mr-1" /> Health Library
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