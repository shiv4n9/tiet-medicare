import React from 'react';
import { motion } from 'framer-motion';
import BlurEffect from './BlurEffect';
import { 
  FileText, 
  MessageSquare, 
  Ambulance, 
  Calendar, 
  Activity, 
  Heart,
  Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const featuresData = [
  {
    icon: <FileText className="h-10 w-10 text-medical-blue-500" />,
    title: "Digital Medical Records",
    description: "Access your complete medical history, prescriptions, and test results securely from anywhere at any time.",
    requiresAuth: true
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-medical-blue-500" />,
    title: "AI Health Assistant",
    description: "Chat with our intelligent assistant for preliminary symptom checking and health recommendations.",
    requiresAuth: false
  },
  {
    icon: <Ambulance className="h-10 w-10 text-medical-blue-500" />,
    title: "Emergency Response",
    description: "Request immediate medical assistance with real-time ambulance tracking and status updates.",
    requiresAuth: true
  },
  {
    icon: <Calendar className="h-10 w-10 text-medical-blue-500" />,
    title: "Smart Scheduling",
    description: "Book appointments with campus medical professionals through our intuitive interface.",
    requiresAuth: true
  },
  {
    icon: <Activity className="h-10 w-10 text-medical-blue-500" />,
    title: "Wellness Monitoring",
    description: "Track health metrics using IoT devices integrated with our platform for proactive health management.",
    requiresAuth: true
  },
  {
    icon: <Heart className="h-10 w-10 text-medical-blue-500" />,
    title: "Mental Health Support",
    description: "Access mental wellness resources, schedule counseling sessions, and get personalized support.",
    requiresAuth: true
  }
];

const Features: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleAuth = () => {
    navigate('/auth');
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
        {featuresData.map((feature, index) => (
          <BlurEffect key={index} delay={300 + index * 100}>
            <motion.div 
              className={`glass-effect rounded-xl p-8 h-full flex flex-col relative bg-white dark:bg-gray-800 border-2 ${feature.requiresAuth && !isAuthenticated ? 'border-gray-200 dark:border-gray-700' : 'border-transparent'} group cursor-pointer overflow-hidden`}
              whileHover={{ 
                y: -8,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                borderColor: 'rgb(14, 165, 233)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Gradient overlay on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-medical-blue-500/5 to-medical-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
              
              {/* Accent glow */}
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-medical-blue-500 to-medical-green-500 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.2 }}
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
                  <motion.a 
                    href="#" 
                    className="inline-flex items-center text-medical-blue-600 dark:text-medical-blue-300 font-medium hover:text-medical-blue-700 dark:hover:text-medical-blue-100 transition-colors group/link"
                    whileHover={{ x: 5 }}
                  >
                    Learn more
                    <motion.svg 
                      className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </motion.svg>
                  </motion.a>
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
