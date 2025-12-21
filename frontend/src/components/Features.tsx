import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlurEffect from './BlurEffect';
import { 
  FileText, 
  MessageSquare, 
  Ambulance, 
  Calendar,
  Heart,
  Lock,
  ChevronDown,
  Check
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const featuresData = [
  {
    icon: <FileText className="h-10 w-10 text-medical-blue-500" />,
    title: "Digital Medical Records",
    description: "Access your medical history, prescriptions, and consultation records securely from your dashboard.",
    requiresAuth: true,
    details: {
      overview: "View and download your complete medical records including doctor consultations, prescriptions, and diagnoses. All records are stored securely and accessible anytime.",
      features: [
        "View consultation history",
        "Download records as PDF",
        "Track prescriptions and medications",
        "Access doctor notes and diagnoses"
      ]
    }
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-medical-blue-500" />,
    title: "AI Health Assistant",
    description: "Chat with our health assistant for symptom checking and general health guidance.",
    requiresAuth: false,
    details: {
      overview: "Get quick health guidance through our AI chatbot. Check symptoms, get health tips, and find relevant information about common health concerns.",
      features: [
        "Symptom checker",
        "General health tips",
        "Wellness assessment",
        "24/7 availability"
      ]
    }
  },
  {
    icon: <Ambulance className="h-10 w-10 text-medical-blue-500" />,
    title: "Emergency Response",
    description: "Quick access to emergency contacts and SOS alerts for immediate assistance.",
    requiresAuth: false,
    details: {
      overview: "In emergencies, quickly send SOS alerts with your location to campus security and medical services. Access verified TIET emergency contact numbers instantly.",
      features: [
        "One-tap SOS alert",
        "GPS location sharing",
        "TIET emergency contacts",
        "National helpline numbers"
      ]
    }
  },
  {
    icon: <Calendar className="h-10 w-10 text-medical-blue-500" />,
    title: "Appointment Booking",
    description: "Book appointments with campus doctors through our simple booking interface.",
    requiresAuth: true,
    details: {
      overview: "Schedule appointments with available doctors on campus. View doctor profiles, select convenient time slots, and manage your bookings easily.",
      features: [
        "View available doctors",
        "Book appointment slots",
        "Cancel or reschedule",
        "Chat with your doctor"
      ]
    }
  },
  {
    icon: <Heart className="h-10 w-10 text-medical-blue-500" />,
    title: "Mental Health Support",
    description: "Access mental wellness resources, mood tracking, and TIET counseling contacts.",
    requiresAuth: false,
    details: {
      overview: "Your mental health matters. Access mood tracking tools, wellness resources, and connect with TIET's counseling services (TICC) at G-Block 104-105.",
      features: [
        "Mood tracking",
        "Wellness assessment",
        "TIET counselor contacts",
        "Crisis support resources"
      ]
    }
  }
];

const Features: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  
  const handleAuth = () => {
    navigate('/auth');
  };

  const toggleExpand = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };
  
  return (
    <section id="features" className="section-container bg-white dark:bg-gray-900">
      <div className="text-center mb-16">
        <BlurEffect>
          <span className="inline-block px-4 py-1.5 rounded-full bg-medical-blue-100 text-medical-blue-700 dark:bg-medical-blue-900 dark:text-medical-blue-100 font-medium text-sm mb-4">
            Our Services
          </span>
        </BlurEffect>
        
        <BlurEffect delay={100}>
          <h2 className="section-title dark:text-white">Comprehensive Healthcare <br />at Your Fingertips</h2>
        </BlurEffect>
        
        <BlurEffect delay={200}>
          <p className="section-subtitle mx-auto dark:text-gray-300">
            TIET Medi-Care combines cutting-edge technology with compassionate care to provide the Thapar community with accessible and efficient healthcare services.
            {!isAuthenticated && (
              <span className="block mt-2 text-medical-blue-600 dark:text-medical-blue-300 font-medium">
                Sign in to unlock all features
              </span>
            )}
          </p>
        </BlurEffect>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuresData.slice(0, 3).map((feature, index) => (
          <BlurEffect key={index} delay={300 + index * 100}>
            <motion.div 
              className={`glass-effect rounded-xl p-8 flex flex-col relative bg-white dark:bg-gray-800 border-2 ${feature.requiresAuth && !isAuthenticated ? 'border-gray-200 dark:border-gray-700' : 'border-transparent'} ${expandedCard === index ? 'border-medical-blue-400 dark:border-medical-blue-500' : ''} group overflow-hidden`}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              whileHover={expandedCard !== index ? { 
                y: -8,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                borderColor: 'rgb(14, 165, 233)',
              } : {}}
            >
              {/* Gradient overlay on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-medical-blue-500/5 to-medical-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
              />
              
              {/* Accent glow */}
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-medical-blue-500 to-medical-green-500 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"
                initial={{ opacity: 0 }}
              />
              
              {feature.requiresAuth && !isAuthenticated && (
                <div className="absolute right-4 top-4 flex items-center z-10">
                  <motion.div 
                    className="bg-medical-blue-50 text-medical-blue-600 dark:bg-medical-blue-900 dark:text-medical-blue-100 text-xs font-medium px-3 py-1 rounded-full border border-medical-blue-100 dark:border-medical-blue-800 flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Sign in required</span>
                  </motion.div>
                </div>
              )}
              
              <div className="mb-6 relative z-10">
                <motion.div 
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-medical-blue-50 to-medical-green-50 dark:from-gray-900 dark:to-gray-8
00 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                </motion.div>
              </div>
              
              <h3 className="text-xl font-bold mb-3 dark:text-gray-200 relative z-10 group-hover:text-medical-blue-600 dark:group-hover:text-medical-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow relative z-10">{feature.description}</p>
              
              {/* Expandable Details Section */}
              <AnimatePresence>
                {expandedCard === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="relative z-10 overflow-hidden"
                  >
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                        {feature.details.overview}
                      </p>
                      
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Key Features:
                      </h4>
                      <ul className="space-y-2">
                        {feature.details.features.map((item, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                          >
                            <Check className="w-4 h-4 text-medical-green-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="mt-6 relative z-10">
                {feature.requiresAuth && !isAuthenticated ? (
                  <Button 
                    onClick={handleAuth}
                    variant="outline"
                    className="w-full text-medical-blue-600 dark:text-medical-blue-300 border-medical-blue-200 dark:border-medical-blue-700 hover:bg-medical-blue-50 dark:hover:bg-medical-blue-900/40 group-hover:border-medical-blue-400 transition-all"
                  >
                    Sign in to access
                    <motion.svg 
                      className="ml-2 w-4 h-4" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </motion.svg>
                  </Button>
                ) : (
                  <motion.button 
                    onClick={() => toggleExpand(index)}
                    className="inline-flex items-center text-medical-blue-600 dark:text-medical-blue-300 font-medium hover:text-medical-blue-700 dark:hover:text-medical-blue-100 transition-colors group/link w-full justify-between"
                  >
                    <span>{expandedCard === index ? 'Show less' : 'Learn more'}</span>
                    <motion.div
                      animate={{ rotate: expandedCard === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </BlurEffect>
        ))}
      </div>
      
      {/* Second row - centered */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-3xl mx-auto">
        {featuresData.slice(3).map((feature, index) => (
          <BlurEffect key={index + 3} delay={600 + index * 100}>
            <motion.div 
              className={`glass-effect rounded-xl p-8 flex flex-col relative bg-white dark:bg-gray-800 border-2 ${feature.requiresAuth && !isAuthenticated ? 'border-gray-200 dark:border-gray-700' : 'border-transparent'} ${expandedCard === index + 3 ? 'border-medical-blue-400 dark:border-medical-blue-500' : ''} group overflow-hidden`}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              whileHover={expandedCard !== index + 3 ? { 
                y: -8,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                borderColor: 'rgb(14, 165, 233)',
              } : {}}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-medical-blue-500/5 to-medical-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
              />
              
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-medical-blue-500 to-medical-green-500 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"
                initial={{ opacity: 0 }}
              />
              
              {feature.requiresAuth && !isAuthenticated && (
                <div className="absolute right-4 top-4 flex items-center z-10">
                  <motion.div 
                    className="bg-medical-blue-50 text-medical-blue-600 dark:bg-medical-blue-900 dark:text-medical-blue-100 text-xs font-medium px-3 py-1 rounded-full border border-medical-blue-100 dark:border-medical-blue-800 flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Sign in required</span>
                  </motion.div>
                </div>
              )}
              
              <div className="mb-6 relative z-10">
                <motion.div 
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-medical-blue-50 to-medical-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                </motion.div>
              </div>
              
              <h3 className="text-xl font-bold mb-3 dark:text-gray-200 relative z-10 group-hover:text-medical-blue-600 dark:group-hover:text-medical-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow relative z-10">{feature.description}</p>
              
              <AnimatePresence>
                {expandedCard === index + 3 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="relative z-10 overflow-hidden"
                  >
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                        {feature.details.overview}
                      </p>
                      
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Key Features:
                      </h4>
                      <ul className="space-y-2">
                        {feature.details.features.map((item, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                          >
                            <Check className="w-4 h-4 text-medical-green-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="mt-6 relative z-10">
                {feature.requiresAuth && !isAuthenticated ? (
                  <Button 
                    onClick={handleAuth}
                    variant="outline"
                    className="w-full text-medical-blue-600 dark:text-medical-blue-300 border-medical-blue-200 dark:border-medical-blue-700 hover:bg-medical-blue-50 dark:hover:bg-medical-blue-900/40 group-hover:border-medical-blue-400 transition-all"
                  >
                    Sign in to access
                    <motion.svg 
                      className="ml-2 w-4 h-4" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </motion.svg>
                  </Button>
                ) : (
                  <motion.button 
                    onClick={() => toggleExpand(index + 3)}
                    className="inline-flex items-center text-medical-blue-600 dark:text-medical-blue-300 font-medium hover:text-medical-blue-700 dark:hover:text-medical-blue-100 transition-colors group/link w-full justify-between"
                  >
                    <span>{expandedCard === index + 3 ? 'Show less' : 'Learn more'}</span>
                    <motion.div
                      animate={{ rotate: expandedCard === index + 3 ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </BlurEffect>
        ))}
      </div>
    </section>
  );
};

export default Features;
