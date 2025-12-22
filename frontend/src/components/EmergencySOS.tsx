import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Phone, MapPin, Clock, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EmergencySOS = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          // Default to TIET campus center
          setUserLocation({ lat: 30.3515, lng: 76.3619 });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  const handleEmergency = async () => {
    setIsSending(true);

    try {
      // Get fresh location
      let location = userLocation || { lat: 30.3515, lng: 76.3619 };
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          });
          location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
        } catch (geoError) {
          console.log('Using cached/default location');
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/emergency/sos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          location,
          emergencyType: 'medical',
          description: 'Emergency SOS triggered from TIET Medi-Care app (SOS Button)',
          userName: user?.name || 'Anonymous User',
          userPhone: user?.phone || '',
          userEmail: user?.email || '',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEmergencyActive(true);
        toast.success('🚨 Emergency SOS Sent!', {
          description: `Alert sent to ${data.data.notificationsSent} emergency contacts. Help is on the way!`,
          duration: 10000,
        });
        
        // Navigate to emergency section after delay
        setTimeout(() => {
          setIsOpen(false);
          setIsEmergencyActive(false);
          const emergencySection = document.getElementById('emergency');
          if (emergencySection) {
            emergencySection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 5000);
      } else {
        throw new Error(data.message || 'Failed to send SOS');
      }
    } catch (error: any) {
      console.error('SOS Error:', error);
      toast.error('Failed to send SOS', {
        description: error.message || 'Please try again or call emergency services directly.',
      });
      
      // Show direct call option
      toast.info('Call emergency directly', {
        description: 'Ambulance: +91 8288008122 | Toll-Free: 1800 202 4100',
        duration: 10000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDirectCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <>
      {/* Floating SOS Button */}
      <motion.div
        className="fixed bottom-20 right-4 z-40"
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
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
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {!isEmergencyActive ? (
                  <>
                    <p className="text-gray-700 dark:text-gray-300">
                      This will immediately alert campus medical services and dispatch an ambulance to your location.
                    </p>

                    <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      <button 
                        onClick={() => handleDirectCall('+918288008122')}
                        className="w-full flex items-center space-x-3 text-sm p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Phone className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Ambulance: +91 8288008122</span>
                      </button>
                      <button 
                        onClick={() => handleDirectCall('18002024100')}
                        className="w-full flex items-center space-x-3 text-sm p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Phone className="w-4 h-4 text-medical-blue-600 dark:text-medical-blue-400" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">TIET Toll-Free: 1800 202 4100</span>
                      </button>
                      <div className="flex items-center space-x-3 text-sm p-2">
                        <MapPin className="w-4 h-4 text-medical-green-600 dark:text-medical-green-400" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">
                          {userLocation ? 'Location tracking enabled' : 'Getting location...'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm p-2">
                        <Clock className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                        <span className="text-gray-700 dark:text-gray-300 text-xs">Average response: 3-5 min (on campus)</span>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <Button
                        onClick={handleEmergency}
                        disabled={isSending}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-5 disabled:opacity-50"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Send Emergency SOS
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setIsOpen(false)}
                        variant="outline"
                        className="px-4"
                        disabled={isSending}
                      >
                        Cancel
                      </Button>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center pb-1">
                      Tap phone numbers above to call directly
                    </p>
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
