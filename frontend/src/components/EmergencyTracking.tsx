import React, { useState } from 'react';
import BlurEffect from './BlurEffect';
import { Phone, Clock, MapPin, UserCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

const EmergencyTracking: React.FC = () => {
  const [isCallingDriver, setIsCallingDriver] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const handleCallDriver = () => {
    setIsCallingDriver(true);
    toast.info("Connecting to driver...", { duration: 2000 });
    
    setTimeout(() => {
      setIsCallingDriver(false);
      toast.success("Connected with Driver");
    }, 2000);
  };

  const handleSendSOS = () => {
    if (sosSent) return;
    
    setSosSent(true);
    toast.success("Emergency SOS sent successfully!", {
      description: "Additional medical team has been dispatched to your location."
    });
    
    setTimeout(() => setSosSent(false), 10000);
  };

  return (
    <section id="emergency" className="section-container bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 right-0 w-96 h-96 bg-red-100/50 dark:bg-red-900/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <BlurEffect>
            <div className="glass-effect rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="relative aspect-[4/3] w-full">
                {/* Enhanced Map */}
                <div className="absolute inset-0 bg-[#EBF3FB] dark:bg-gray-900">
                  {/* Map grid lines */}
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={`v-${i}`} className="absolute top-0 bottom-0 w-px bg-blue-200/50" style={{ left: `${(i/6) * 100}%` }} />
                    ))}
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={`h-${i}`} className="absolute left-0 right-0 h-px bg-blue-200/50" style={{ top: `${(i/6) * 100}%` }} />
                    ))}
                  </div>
                  
                  {/* Roads */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path 
                      d="M10,20 L40,20 L60,50 L90,50" 
                      stroke="#D1DCE8" 
                      strokeWidth="3" 
                      fill="none" 
                    />
                    <path 
                      d="M30,10 L30,30 L50,70 L50,90" 
                      stroke="#D1DCE8" 
                      strokeWidth="3" 
                      fill="none" 
                    />
                    <path 
                      d="M60,10 L60,90" 
                      stroke="#D1DCE8" 
                      strokeWidth="3" 
                      fill="none" 
                    />
                  </svg>
                  
                  {/* Campus building */}
                  <div className="absolute top-[15%] left-[55%] transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-12 bg-blue-100 border-2 border-blue-300 shadow-md rounded-sm flex items-center justify-center">
                      <div className="text-xs font-semibold text-blue-600">Campus</div>
                    </div>
                  </div>
                  
                  {/* Hospital building */}
                  <div className="absolute top-[80%] left-[60%] transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-12 bg-red-100 border-2 border-red-300 shadow-md rounded-sm flex items-center justify-center">
                      <div className="text-xs font-semibold text-red-600">Hospital</div>
                    </div>
                  </div>

                  {/* Ambulance marker */}
                  <div className="absolute top-[45%] left-[20%] transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse border-2 border-red-500">
                        <svg className="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m3 16 4 2 4-2 4 2 4-2"></path>
                          <path d="M22 12a10 9 0 0 0-20 0"></path>
                          <path d="M9 6v2"></path>
                          <path d="M15 6v2"></path>
                          <path d="M13 21h-2a2 2 0 0 1-2-2v-7h6v7a2 2 0 0 1-2 2z"></path>
                        </svg>
                      </div>
                      
                      {/* Pulsing effect */}
                      <div className="w-12 h-12 bg-red-500/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
                    </div>
                  </div>
                  
                  {/* Current location marker */}
                  <div className="absolute top-[50%] left-[70%] transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Pulsing effect */}
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
                  </div>
                  
                  {/* Route path */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path 
                      d="M20,45 C30,45 40,45 50,50 S65,60 70,50" 
                      stroke="#EF4444" 
                      strokeWidth="2.5" 
                      strokeDasharray="3 3" 
                      fill="none" 
                    />
                    <circle cx="20" cy="45" r="2" fill="#EF4444" />
                    <circle cx="70" cy="50" r="2" fill="#EF4444" />
                  </svg>
                </div>
                
                {/* Status bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-4">
                  <div className="flex justify-between items-center">
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
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold dark:text-gray-200">Emergency Response</h3>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 text-sm font-medium rounded-full flex items-center">
                    <span className="w-2 h-2 bg-red-500 dark:bg-red-300 rounded-full mr-2 animate-pulse"></span>
                    Active
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">Ambulance #A-103 is en route to your location. Medical team has been notified of your situation.</p>
                
                <div className="flex items-center justify-between">
                  <button 
                    onClick={handleCallDriver}
                    className={`flex items-center justify-center gap-2 w-full mr-2 py-3 ${isCallingDriver ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-medical-blue-50 text-medical-blue-600 dark:bg-gray-900 dark:text-medical-blue-200 hover:bg-medical-blue-100 dark:hover:bg-gray-800'} rounded-lg font-medium transition-colors`}
                  >
                    {isCallingDriver ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4" />
                        Call Driver
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={handleSendSOS}
                    className={`flex items-center justify-center gap-2 w-full ml-2 py-3 ${sosSent ? 'bg-green-500 text-white' : 'bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-700'} rounded-lg font-medium transition-colors`}
                    disabled={sosSent}
                  >
                    {sosSent ? (
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
                <div className="glass-effect rounded-lg p-5 flex items-start hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-1">One-Touch Emergency Alert</h3>
                    <p className="text-gray-600">Instantly notify emergency services with a single tap, automatically sharing your location and medical information. Call our emergency number at <span className="font-semibold">+91-175-239-3000</span> for immediate assistance.</p>
                  </div>
                </div>
                
                <div className="glass-effect rounded-lg p-5 flex items-start hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-medical-blue-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-medical-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="8"></circle>
                        <path d="M12 2v2"></path>
                        <path d="M12 20v2"></path>
                        <path d="m4.93 4.93 1.41 1.41"></path>
                        <path d="m17.66 17.66 1.41 1.41"></path>
                        <path d="M2 12h2"></path>
                        <path d="M20 12h2"></path>
                        <path d="m6.34 17.66-1.41 1.41"></path>
                        <path d="m19.07 4.93-1.41 1.41"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-1">Real-Time Tracking</h3>
                    <p className="text-gray-600">Monitor the ambulance location and estimated arrival time, providing peace of mind during emergencies. Our dispatch center can be reached at <span className="font-semibold">+91-175-239-4000</span>.</p>
                  </div>
                </div>
                
                <div className="glass-effect rounded-lg p-5 flex items-start hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-medical-green-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-medical-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-1">Immediate Medical Response</h3>
                    <p className="text-gray-600">Our medical team is alerted instantly, allowing them to prepare for your specific emergency while en route. For medical consultations, call <span className="font-semibold">+91-175-239-5000</span>.</p>
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
