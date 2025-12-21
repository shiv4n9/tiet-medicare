import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const EmergencySOS = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleEmergency = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to use emergency services');
      navigate('/auth');
      return;
    }

    setIsEmergencyActive(true);
    toast.success('Emergency alert sent! Help is on the way.');
    
    // Simulate emergency response
    setTimeout(() => {
      toast.info('Ambulance dispatched - ETA 5 minutes');
    }, 2000);

    // Navigate to emergency section
    setTimeout(() => {
      setIsOpen(false);
      setIsEmergencyActive(false);
      const emergencySection = document.getElementById('emergency');
      if (emergencySection) {
        emergencySection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 3000);
  };

  return (
    <>
      {/* Floating SOS Button */}
      <motion.div
        className="fixed bottom-24 right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group relative overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 10px 30px rgba(239, 68, 68, 0.3)',
              '0 10px 40px rgba(239, 68, 68, 0.5)',
              '0 10px 30px rgba(239, 68, 68, 0.3)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <AlertTriangle className="w-6 h-6" />
          </motion.div>
          
          {/* Pulse effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{
              scale: [1, 1.5, 2],
              opacity: [0.5, 0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          />
        </motion.button>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none"
        >
          Emergency SOS
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900" />
        </motion.div>
      </motion.div>

      {/* Emergency Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isEmergencyActive && setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white relative">
                <button
                  onClick={() => !isEmergencyActive && setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                  disabled={isEmergencyActive}
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{
                      rotate: [0, -10, 10, -10, 0],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    <AlertTriangle className="w-8 h-8" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold">Emergency SOS</h3>
                    <p className="text-sm text-red-100">Immediate medical assistance</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {!isEmergencyActive ? (
                  <>
                    <p className="text-gray-700 dark:text-gray-300">
                      This will immediately alert campus medical services and dispatch an ambulance to your location.
                    </p>

                    <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 text-sm">
                        <Phone className="w-5 h-5 text-medical-blue-600 dark:text-medical-blue-400" />
                        <span className="text-gray-700 dark:text-gray-300">Emergency hotline: 1800-XXX-XXXX</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <MapPin className="w-5 h-5 text-medical-green-600 dark:text-medical-green-400" />
                        <span className="text-gray-700 dark:text-gray-300">Location tracking enabled</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Clock className="w-5 h-5 text-medical-orange-600 dark:text-medical-orange-400" />
                        <span className="text-gray-700 dark:text-gray-300">Average response: 5-7 minutes</span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={handleEmergency}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg"
                      >
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Call Emergency
                      </Button>
                      <Button
                        onClick={() => setIsOpen(false)}
                        variant="outline"
                        className="px-6"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4"
                    >
                      <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </motion.div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Emergency Alert Sent
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Help is on the way. Stay calm and stay where you are.
                    </p>
                    <div className="mt-4 flex items-center justify-center space-x-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 bg-red-600 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-red-600 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-red-600 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencySOS;
