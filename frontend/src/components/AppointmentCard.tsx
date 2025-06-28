import React, { useState, useEffect, useRef } from 'react';
import BlurEffect from './BlurEffect';
import { Calendar as CalendarIcon, Clock, User, Stethoscope, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { 
  saveAppointment, 
  isSlotAvailable, 
  AppointmentDetails 
} from '@/utils/appointmentStorage';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AppointmentCard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("10:30");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("Dr. Aisha Sharma");
  const [selectedType, setSelectedType] = useState<string>("General Checkup");
  const [patientName, setPatientName] = useState<string>("");
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([
    '09:00', '10:30', '11:45', '14:00', '15:15', '16:30'
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const hasPrefilledEmail = useRef(false);
  
  useEffect(() => {
    if (authUser?.email && !hasPrefilledEmail.current) {
      setPatientEmail(authUser.email);
      hasPrefilledEmail.current = true;
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser?.email && patientEmail && patientEmail !== authUser.email) {
      setShowEmailPrompt(true);
    } else {
      setShowEmailPrompt(false);
    }
  }, [authUser, patientEmail]);
  
  useEffect(() => {
    if (selectedDate) {
      const allTimeSlots = ['09:00', '10:30', '11:45', '14:00', '15:15', '16:30'];
      const available = allTimeSlots.filter(time => isSlotAvailable(selectedDate, time));
      setAvailableTimeSlots(available);
      
      if (available.length > 0 && !available.includes(selectedTime)) {
        setSelectedTime(available[0]);
      }
    }
  }, [selectedDate, selectedTime]);
  
  const handleSubmit = async (e?: React.FormEvent) => {
    // Prevent default form submission if called from a form
    if (e) {
      e.preventDefault();
    }

    try {
      setIsLoading(true);
      
      if (!contactNumber) {
        toast.error('Please enter your contact number');
        return;
      }
      
      const appointmentData = {
        name: patientName,
        email: patientEmail,
        contactNumber: contactNumber,
        date: selectedDate,
        time: selectedTime,
        doctor: selectedDoctor,
        type: selectedType,
        service: selectedType, 
        notes: notes,
        status: 'scheduled',
      };

      console.log('Submitting appointment:', appointmentData);
      
      await saveAppointment(appointmentData);
      
      // Reset form
      setSelectedDate(new Date());
      setSelectedTime('10:30');
      setSelectedDoctor('Dr. Aisha Sharma');
      setSelectedType('General Checkup');
      setPatientName('');
      setPatientEmail('');
      setContactNumber('');
      setNotes('');
      setActiveStep(1);
      
      toast.success('Appointment booked successfully!');
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = (e?: React.FormEvent) => {
    // Prevent default form submission if called from a form
    if (e) {
      e.preventDefault();
    }

    // For the first step, only validate date and time selection
    if (activeStep === 1) {
      if (!selectedDate || !selectedTime) {
        toast.error('Please select a date and time');
        return;
      }
      setActiveStep(2);
    } 
    // For the second step, validate doctor and appointment type
    else if (activeStep === 2) {
      if (!selectedDoctor || !selectedType) {
        toast.error('Please select a doctor and appointment type');
        return;
      }
      setActiveStep(3);
    }
    // For the third step, validate personal info
    else if (activeStep === 3) {
      if (!patientName || !patientEmail || !contactNumber) {
        toast.error('Please fill in your name, email and contact number');
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patientEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }
      
      // If all validations pass, submit the form
      handleSubmit();
    }
  };

  const formatTimeForDisplay = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <section id="appointments" className="section-container bg-medical-blue-50 dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <BlurEffect>
              <span className="inline-block px-4 py-1.5 rounded-full bg-medical-blue-100 text-medical-blue-700 dark:bg-medical-blue-900 dark:text-medical-blue-100 font-medium text-sm mb-4">
                Quick & Easy
              </span>
            </BlurEffect>
            
            <BlurEffect delay={100}>
              <h2 className="section-title dark:text-white">Schedule Your Appointment</h2>
            </BlurEffect>
            
            <BlurEffect delay={200}>
              <p className="section-subtitle dark:text-gray-300">
                Our streamlined booking process makes it effortless to schedule appointments with campus medical professionals. Get the care you need, when you need it.
              </p>
            </BlurEffect>
            
            <BlurEffect delay={300}>
              <div className="space-y-6 mt-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-medical-blue-100 dark:bg-gray-900 flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-medical-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-1 dark:text-gray-200">Select Your Date & Time</h3>
                    <p className="text-gray-600 dark:text-gray-300">Choose from available slots that fit your schedule.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-medical-blue-100 dark:bg-gray-900 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-medical-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-1 dark:text-gray-200">Choose Your Doctor</h3>
                    <p className="text-gray-600 dark:text-gray-300">Select from our qualified medical professionals based on your needs.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-medical-blue-100 dark:bg-gray-900 flex items-center justify-center">
                      <User className="h-5 w-5 text-medical-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-1 dark:text-gray-200">Confirm Your Details</h3>
                    <p className="text-gray-600 dark:text-gray-300">Verify your information and appointment specifics.</p>
                  </div>
                </div>
              </div>
            </BlurEffect>
          </div>
          
          <BlurEffect delay={400}>
            <motion.div 
              className="glass-effect rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <form onSubmit={handleNextStep} className="relative">
                <div className="px-6 py-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold dark:text-gray-200">Book Appointment</h3>
                    <div className="absolute top-6 right-8 flex items-center gap-2">
                      {[1, 2, 3].map((step) => (
                        <button
                          key={step}
                          type="button"
                          aria-label={`Go to step ${step}`}
                          onClick={() => setActiveStep(step)}
                          className={`w-3 h-3 rounded-full transition-all border-2 focus:outline-none focus:ring-2 focus:ring-blue-400
                            ${activeStep === step
                              ? 'bg-blue-500 border-blue-500'
                              : 'bg-gray-400 border-gray-400 dark:bg-gray-700 dark:border-gray-700 hover:bg-blue-400 hover:border-blue-400'}
                          `}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {activeStep === 1 && (
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Select Date</label>
                        <div className="relative">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:border-medical-blue-500 flex justify-between items-center dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                                {selectedDate ? format(selectedDate, 'EEEE, MMM d, yyyy') : 'Select date'}
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-50" align="start">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                className="border rounded-md pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Available Time Slots</label>
                        <div className="grid grid-cols-3 gap-2">
                          {availableTimeSlots.length > 0 ? (
                            availableTimeSlots.map((time24, i) => {
                              const displayTime = formatTimeForDisplay(time24);
                              return (
                                <motion.button 
                                  key={i}
                                  type="button"
                                  className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${
                                    time24 === selectedTime 
                                      ? 'bg-medical-blue-100 text-medical-blue-600 border-2 border-medical-blue-500 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-400' 
                                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-medical-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-blue-900/40'
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedTime(time24);
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {displayTime}
                                </motion.button>
                              );
                            })
                          ) : (
                            <p className="col-span-3 text-center py-3 bg-gray-50 text-gray-500 rounded-lg">
                              No slots available for selected date
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeStep === 2 && (
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <motion.button 
                            type="button"
                            className={`p-4 ${selectedType === "General Checkup" ? 'bg-medical-blue-100 text-medical-blue-600 border-2 border-medical-blue-500 dark:bg-blue-700 dark:text-white dark:border-blue-400' : 'bg-white border border-gray-200 hover:bg-medical-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-blue-900/40 dark:text-gray-200'} rounded-lg text-left transition-all`}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedType("General Checkup");
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedType === "General Checkup" ? 'bg-medical-blue-600 dark:bg-blue-500' : 'bg-white dark:bg-white'}`}>
                                <Stethoscope className={`h-5 w-5 ${selectedType === "General Checkup" ? 'text-white' : 'text-medical-blue-600 dark:text-blue-300'}`} />
                              </div>
                              <div className="ml-3">
                                <p className={`font-medium ${selectedType === "General Checkup" ? 'text-white' : 'text-medical-blue-600 dark:text-blue-300'}`}>General Checkup</p>
                              </div>
                            </div>
                          </motion.button>
                          
                          <motion.button 
                            type="button"
                            className={`p-4 ${selectedType === "Specialist Consult" ? 'bg-medical-blue-100 text-medical-blue-600 border-2 border-medical-blue-500 dark:bg-blue-700 dark:text-white dark:border-blue-400' : 'bg-white border border-gray-200 hover:bg-medical-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-blue-900/40 dark:text-gray-200'} rounded-lg text-left transition-all`}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedType("Specialist Consult");
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedType === "Specialist Consult" ? 'bg-medical-blue-600 dark:bg-blue-500' : 'bg-white dark:bg-white'}`}>
                                <svg
                                  className={`h-5 w-5 ${selectedType === "Specialist Consult" ? 'text-white' : 'text-gray-600 dark:text-blue-300'}`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M20 7h-3a2 2 0 0 1-2-2V2"></path>
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className={`font-medium ${selectedType === "Specialist Consult" ? 'text-white' : 'text-gray-800 dark:text-blue-300'}`}>Specialist Consult</p>
                              </div>
                            </div>
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
                        <div className="space-y-2">
                          {['Dr. Aisha Sharma', 'Dr. Rajiv Mehta'].map((doctor, i) => (
                            <motion.button 
                              key={i}
                              type="button"
                              className={`w-full p-3 flex items-center rounded-lg transition-all ${
                                doctor === selectedDoctor 
                                  ? 'bg-medical-blue-100 text-medical-blue-600 border-2 border-medical-blue-500 dark:bg-blue-700 dark:text-white dark:border-blue-400' 
                                  : 'bg-white border border-gray-200 hover:bg-medical-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-blue-900/40 dark:text-gray-200'
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedDoctor(doctor);
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${doctor === selectedDoctor ? 'bg-medical-blue-600 dark:bg-blue-500' : 'bg-white dark:bg-white'}`}>
                                <User className={`h-5 w-5 ${doctor === selectedDoctor ? 'text-white' : 'text-gray-500 dark:text-blue-300'}`} />
                              </div>
                              <div className="ml-3 text-left">
                                <p className={`font-medium ${doctor === selectedDoctor ? 'text-medical-blue-800 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>{doctor}</p>
                                <p className="text-sm text-gray-500">General Physician</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeStep === 3 && (
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name*</label>
                          <input
                            type="text"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:border-medical-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                          <input
                            type="email"
                            value={patientEmail}
                            onChange={(e) => setPatientEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:border-medical-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                            required
                          />
                          {showEmailPrompt && (
                            <div className="mt-1 text-xs text-blue-500 dark:text-blue-300">
                              You are booking with a different email than your logged-in account.
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number*</label>
                          <input
                            type="tel"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            placeholder="Enter your phone number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:border-medical-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="p-4 bg-medical-blue-50 rounded-lg border border-medical-blue-100 dark:bg-gray-800 dark:border-gray-700">
                        <h4 className="font-medium text-medical-blue-800 mb-3 dark:text-blue-200">Appointment Summary</h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <div className="flex items-center text-gray-700 dark:text-gray-200">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              <span className="text-sm">Date:</span>
                            </div>
                            <span className="text-sm font-medium dark:text-gray-100">
                              {selectedDate ? format(selectedDate, 'EEEE, MMM d, yyyy') : 'Not selected'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <div className="flex items-center text-gray-700 dark:text-gray-200">
                              <Clock className="h-4 w-4 mr-2" />
                              <span className="text-sm">Time:</span>
                            </div>
                            <span className="text-sm font-medium dark:text-gray-100">
                              {selectedTime ? formatTimeForDisplay(selectedTime) : 'Not selected'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <div className="flex items-center text-gray-700 dark:text-gray-200">
                              <Stethoscope className="h-4 w-4 mr-2" />
                              <span className="text-sm">Doctor:</span>
                            </div>
                            <span className="text-sm font-medium dark:text-gray-100">{selectedDoctor}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <div className="flex items-center text-gray-700 dark:text-gray-200">
                              <svg
                                className={`h-5 w-5 ${selectedType === "Specialist Consult" ? 'text-gray-600 dark:text-white' : 'text-gray-600 dark:text-blue-300'}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 7h-3a2 2 0 0 1-2-2V2"></path>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                              </svg>
                              <span className="text-sm">Service:</span>
                            </div>
                            <span className="text-sm font-medium dark:text-gray-100">{selectedType}</span>
                          </div>
                        </div>
                        
                        {!isAuthenticated && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-700 flex items-center">
                              <Lock className="h-4 w-4 mr-2" />
                              You'll need to sign in to complete your booking
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                        <textarea
                          id="notes"
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any specific concerns or symptoms you'd like to discuss..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:border-medical-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                        ></textarea>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="flex justify-between mt-8">
                    {activeStep > 1 ? (
                      <motion.button 
                        type="button"
                        onClick={() => setActiveStep(activeStep - 1)}
                        className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Back
                      </motion.button>
                    ) : (
                      <div></div>
                    )}
                    
                    <motion.button 
                      type={activeStep === 3 ? 'submit' : 'button'}
                      onClick={activeStep === 3 ? undefined : handleNextStep}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-medical-blue-500 ${
                        activeStep === 3 
                          ? 'bg-medical-green-500 text-white hover:bg-medical-green-600' 
                          : 'bg-medical-blue-500 text-white hover:bg-medical-blue-600'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {activeStep === 3 ? (isAuthenticated ? 'Confirm Booking' : 'Sign In & Book') : 'Continue'}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </BlurEffect>
        </div>
      </div>
    </section>
  );
};

export default AppointmentCard;
