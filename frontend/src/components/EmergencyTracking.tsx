import React, { useState, useEffect } from 'react';
import BlurEffect from './BlurEffect';
import { Clock, MapPin, Check, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const ambulanceIcon = new L.DivIcon({
  className: 'custom-ambulance-icon',
  html: `<div style="background: white; border: 3px solid #EF4444; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(239,68,68,0.4);">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
      <path d="M3 16l4 2 4-2 4 2 4-2"/>
      <path d="M22 12a10 9 0 0 0-20 0"/>
      <path d="M9 6v2"/>
      <path d="M15 6v2"/>
      <path d="M13 21h-2a2 2 0 0 1-2-2v-7h6v7a2 2 0 0 1-2 2z"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const userIcon = new L.DivIcon({
  className: 'custom-user-icon',
  html: `<div style="background: #3B82F6; border: 3px solid white; border-radius: 50%; width: 24px; height: 24px; box-shadow: 0 4px 12px rgba(59,130,246,0.5);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const hospitalIcon = new L.DivIcon({
  className: 'custom-hospital-icon',
  html: `<div style="background: white; border: 3px solid #10B981; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16,185,129,0.4);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
      <path d="M3 21h18"/>
      <path d="M5 21V7l8-4v18"/>
      <path d="M19 21V11l-6-4"/>
      <path d="M9 9v.01"/>
      <path d="M9 12v.01"/>
      <path d="M9 15v.01"/>
      <path d="M9 18v.01"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Thapar University coordinates
const THAPAR_HOSPITAL: [number, number] = [30.355938, 76.368687]; // TIET Health Centre

// TIET Verified Emergency Contact Numbers
const TIET_EMERGENCY = {
  ambulance: '+91 8288008122',           // Emergency Ambulance
  tollFree: '1800 202 4100',              // TIET Toll-Free (General/Medical/Security)
  registrar: 'registrar@thapar.edu',      // Registrar Email
  counselor1: 'sonam.dullat@thapar.edu',  // Dr. Sonam Dullat - Student Counsellor
  counselor2: 'sukhpreet.kaur@thapar.edu', // Ms. Sukhpreet Kaur - Assistant Counsellor
  // Sample Hostel Numbers
  anantamHall: '9115611523',              // Anantam Hall (Boys)
  agiraHall: '9115611510',                // Agira Hall (Girls)
};

// Animated ambulance component
const AnimatedAmbulance: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % positions.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [positions.length]);

  return (
    <Marker position={positions[currentIndex]} icon={ambulanceIcon}>
      <Popup>
        <div className="text-center">
          <strong className="text-red-600">🚑 Ambulance #A-103</strong>
          <p className="text-sm text-gray-600">En route to your location</p>
          <p className="text-xs text-gray-500">ETA: 4 minutes</p>
        </div>
      </Popup>
    </Marker>
  );
};

// Map updater component
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);
  return null;
};

const EmergencyTracking: React.FC = () => {
  const { user } = useAuth();
  const [sosSent, setSosSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([30.3530, 76.3640]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // Ambulance route points
  const ambulanceRoute: [number, number][] = [
    [30.3460, 76.3580],
    [30.3480, 76.3600],
    [30.3500, 76.3620],
    [30.3515, 76.3635],
  ];

  // Get user's real location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLocationError(null);
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          setLocationError('Using default campus location');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  const handleFindAmbulance = () => {
    window.open('https://fantastic-licorice-b76ec1.netlify.app/', '_blank');
  };

  const handleSOSClick = () => {
    if (sosSent || sending) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmSOS = async () => {
    setShowConfirmDialog(false);
    setSending(true);

    try {
      // Get fresh location
      let location = { lat: userLocation[0], lng: userLocation[1] };
      
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
          setUserLocation([location.lat, location.lng]);
        } catch (geoError) {
          console.log('Using cached location');
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/emergency/sos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          location,
          emergencyType: 'medical',
          description: 'Emergency SOS triggered from TIET Medi-Care app',
          userName: user?.name || 'Anonymous User',
          userPhone: user?.phone || '',
          userEmail: user?.email || '',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSosSent(true);
        toast.success('🚨 Emergency SOS Sent!', {
          description: `Alert sent to ${data.data.notificationsSent} emergency contacts. Help is on the way!`,
          duration: 10000,
        });
        
        // Reset after 30 seconds
        setTimeout(() => setSosSent(false), 30000);
      } else {
        throw new Error(data.message || 'Failed to send SOS');
      }
    } catch (error: any) {
      console.error('SOS Error:', error);
      toast.error('Failed to send SOS', {
        description: error.message || 'Please try again or call emergency services directly.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="emergency" className="section-container bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Emergency SOS</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This will alert emergency services</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to send an emergency SOS? This will:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Send SMS alerts to campus security
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Share your GPS location
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Dispatch medical assistance
              </li>
            </ul>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSOS}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Send SOS Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 right-0 w-96 h-96 bg-red-100/50 dark:bg-red-900/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <BlurEffect>
            <div className="glass-effect rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="relative aspect-[4/3] w-full">
                {/* Real Leaflet Map */}
                <MapContainer
                  center={userLocation}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapUpdater center={userLocation} />
                  
                  {/* User Location Marker */}
                  <Marker position={userLocation} icon={userIcon}>
                    <Popup>
                      <div className="text-center">
                        <strong className="text-blue-600">📍 Your Location</strong>
                        <p className="text-sm text-gray-600">
                          {locationError || 'GPS Location'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Hospital Marker */}
                  <Marker position={THAPAR_HOSPITAL} icon={hospitalIcon}>
                    <Popup>
                      <div className="text-center">
                        <strong className="text-green-600">🏥 TIET Medical Center</strong>
                        <p className="text-sm text-gray-600">24/7 Medical Services</p>
                        <p className="text-xs text-gray-500">Near Main Building, TIET Campus</p>
                        <p className="text-xs font-medium text-green-600 mt-1">📞 {TIET_EMERGENCY.tollFree}</p>
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Animated Ambulance */}
                  <AnimatedAmbulance positions={ambulanceRoute} />
                  
                  {/* Route Line */}
                  <Polyline
                    positions={[...ambulanceRoute, userLocation]}
                    pathOptions={{
                      color: '#EF4444',
                      weight: 4,
                      dashArray: '10, 10',
                      opacity: 0.8,
                    }}
                  />
                </MapContainer>
                
                {/* Status bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 z-[1000]">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mr-3">
                        <Clock className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Estimated Arrival</p>
                        <p className="font-bold dark:text-gray-200">4 minutes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-medical-blue-100 dark:bg-gray-900 flex items-center justify-center mr-3">
                        <MapPin className="h-5 w-5 text-medical-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Distance</p>
                        <p className="font-bold dark:text-gray-200">1.2 km away</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center italic">
                    * Demo visualization only. Actual tracking requires integration with emergency services.
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold dark:text-gray-200">Emergency Response</h3>
                  <span className={`px-3 py-1 ${sosSent ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200'} text-sm font-medium rounded-full flex items-center`}>
                    <span className={`w-2 h-2 ${sosSent ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2 animate-pulse`}></span>
                    {sosSent ? 'SOS Active' : 'Ready'}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {sosSent 
                    ? '🚨 Emergency services have been notified. Help is on the way!'
                    : 'Press Emergency SOS to alert campus security and medical services with your location.'}
                </p>
                
                <div className="flex items-center justify-between">
                  <button 
                    onClick={handleFindAmbulance}
                    className="flex items-center justify-center gap-2 w-full mr-2 py-3 bg-medical-blue-50 text-medical-blue-600 dark:bg-gray-900 dark:text-medical-blue-200 hover:bg-medical-blue-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    Find My Ambulance
                  </button>
                  
                  <button 
                    onClick={handleSOSClick}
                    className={`flex items-center justify-center gap-2 w-full ml-2 py-3 ${
                      sosSent 
                        ? 'bg-green-500 text-white cursor-not-allowed' 
                        : sending 
                          ? 'bg-red-400 text-white cursor-wait'
                          : 'bg-red-500 text-white hover:bg-red-600'
                    } rounded-lg font-medium transition-colors`}
                    disabled={sosSent || sending}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : sosSent ? (
                      <>
                        <Check className="h-4 w-4" />
                        SOS Sent
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                          <path d="M9 18h6"></path>
                          <path d="M10 22h4"></path>
                        </svg>
                        Emergency SOS
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </BlurEffect>
          
          <div>
            <BlurEffect delay={100}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-red-100 text-red-600 font-medium text-sm mb-4">
                Critical Response
              </span>
            </BlurEffect>
            
            <BlurEffect delay={200}>
              <h2 className="section-title">Real-Time <br />Emergency Assistance</h2>
            </BlurEffect>
            
            <BlurEffect delay={300}>
              <p className="section-subtitle">
                Our integrated emergency response system ensures rapid medical assistance during critical situations. Track ambulances in real-time and stay connected with healthcare providers.
              </p>
            </BlurEffect>
            
            <BlurEffect delay={400}>
              <div className="space-y-6 mt-8">
                <div className="glass-effect rounded-xl p-5 flex items-start hover:shadow-lg transition-all duration-300 border border-red-100 dark:border-red-900/30">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">One-Touch Emergency Alert</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      Instantly notify TIET Medical Center and campus security with a single tap. Your location and medical information are shared automatically.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`tel:${TIET_EMERGENCY.ambulance}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        🚑 Ambulance: {TIET_EMERGENCY.ambulance}
                      </a>
                      <a href={`tel:${TIET_EMERGENCY.tollFree}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        📞 Toll-Free: {TIET_EMERGENCY.tollFree}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="glass-effect rounded-xl p-5 flex items-start hover:shadow-lg transition-all duration-300 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Campus Security & Safety</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      TIET campus has 24/7 security coverage with patrol vehicles and emergency response teams. Contact the central toll-free line for all security assistance.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`tel:${TIET_EMERGENCY.tollFree}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        🛡️ Security/Main Gate: {TIET_EMERGENCY.tollFree}
                      </a>
                      <a href={`mailto:${TIET_EMERGENCY.registrar}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        📧 Registrar: {TIET_EMERGENCY.registrar}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="glass-effect rounded-xl p-5 flex items-start hover:shadow-lg transition-all duration-300 border border-green-100 dark:border-green-900/30">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">TIET Medical & Counseling</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      TIET provides healthcare and mental health support. TICC (Counselling Cell) is located at G-Block 104-105. Contact counselors via email or the central toll-free line.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`mailto:${TIET_EMERGENCY.counselor1}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                        🧠 Dr. Sonam Dullat
                      </a>
                      <a href={`mailto:${TIET_EMERGENCY.counselor2}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                        🧠 Ms. Sukhpreet Kaur
                      </a>
                    </div>
                  </div>
                </div>

                {/* Quick Emergency Numbers Card */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">📞</span> Quick Emergency Numbers
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">🚑</span>
                      <span className="text-gray-600 dark:text-gray-300">Ambulance: <strong>108</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">👮</span>
                      <span className="text-gray-600 dark:text-gray-300">Police: <strong>100</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">🔥</span>
                      <span className="text-gray-600 dark:text-gray-300">Fire: <strong>101</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-pink-500">👩</span>
                      <span className="text-gray-600 dark:text-gray-300">Women Helpline: <strong>1091</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </BlurEffect>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmergencyTracking;