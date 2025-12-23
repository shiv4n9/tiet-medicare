import React from 'react';
import BlurEffect from './BlurEffect';
import { Brain, BookOpen, Users, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface MentalHealthSupportProps {
  toggleChat?: () => void;
}

const MentalHealthSupport: React.FC<MentalHealthSupportProps> = ({ toggleChat }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAuthRequired = () => {
    navigate('/auth');
  };
  
  const handleChatNow = () => {
    // Find the chatbot button in the DOM and simulate a click
    const chatButton = document.querySelector('button[aria-label="Open Health Assistant"]');
    if (chatButton) {
      (chatButton as HTMLButtonElement).click();
    }
  };
  
  return (
    <section id="mental-health" className="section-container bg-gradient-to-br from-medical-blue-50 to-white dark:from-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <BlurEffect>
            <span className="inline-block px-4 py-1.5 rounded-full bg-medical-green-100 text-medical-green-700 dark:bg-medical-green-900 dark:text-medical-green-100 font-medium text-sm mb-4">
              Support Resources
            </span>
          </BlurEffect>
          
          <BlurEffect delay={100}>
            <h2 className="section-title dark:text-white">Mental Health & Wellness</h2>
          </BlurEffect>
          
          <BlurEffect delay={200}>
            <p className="section-subtitle mx-auto dark:text-gray-300">
              Your mental wellbeing is just as important as your physical health. TIET Medi-Care provides comprehensive resources and support for the Thapar community.
            </p>
          </BlurEffect>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <BlurEffect delay={300} className="card-hover">
            <div className="glass-effect rounded-xl p-8 h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-lg bg-medical-green-50 dark:bg-gray-900 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-medical-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 dark:text-gray-200">TICC - Counseling Services</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Thapar Institute Counselling Cell (TICC) provides confidential counseling support for students. Visit us at <strong>G-Block 104-105</strong> or reach out via email.
              </p>
              
              {/* Counselor Contacts */}
              <div className="space-y-3 mb-6">
                <a 
                  href="mailto:sonam.dullat@thapar.edu"
                  className="flex items-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-medical-green-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-medical-green-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-medical-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Dr. Sonam Dullat</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Student Counsellor</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-medical-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </a>
                <a 
                  href="mailto:sukhpreet.kaur@thapar.edu"
                  className="flex items-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-medical-green-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-medical-green-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-medical-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Ms. Sukhpreet Kaur</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Assistant Counsellor</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-medical-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </a>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                📍 Location: G-Block 104-105
              </p>
              
              <div className="mt-auto">
                <Button 
                  onClick={() => window.open("https://www.thapar.edu/students/pages/thapar-university-counseling-cell", "_blank")}
                  className="bg-medical-green-600 hover:bg-medical-green-700 text-white"
                >
                  Learn More About TICC
                </Button>
              </div>
            </div>
          </BlurEffect>
          
          <BlurEffect delay={400} className="card-hover">
            <div className="glass-effect rounded-xl p-8 h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-lg bg-medical-blue-50 dark:bg-gray-900 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-medical-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 dark:text-gray-200">Wellness Resources</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Access a comprehensive library of mental health resources, guides, and self-help tools curated by TICC (Thapar Institute Counseling Center) specifically designed for the unique challenges faced by students.
              </p>
              
              {/* PDF Resources */}
              <div className="space-y-3 mb-6">
                <a 
                  href="https://www.thapar.edu/webroot/upload/files/Covid-19%20&%20Mental%20Health.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-red-300 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                    <svg className="w-5 h-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-red-600 transition-colors text-sm">Covid-19 & Mental Health Guide</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF Resource</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </a>
                <a 
                  href="https://www.thapar.edu/images/TUCC.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-medical-blue-300 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-medical-blue-100 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-medical-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-medical-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-medical-blue-600 transition-colors text-sm">TUCC Information Brochure</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF Resource</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-medical-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </a>
                <a 
                  href="https://www.thapar.edu/images/COUNSELING%20MANUAL.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-medical-green-300 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-medical-green-100 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-medical-green-200 transition-colors">
                    <svg className="w-5 h-5 text-medical-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-medical-green-600 transition-colors text-sm">Counseling Manual</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF Resource</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-medical-green-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </a>
              </div>

              <div className="mt-auto">
                <Button
                  variant="outline"
                  onClick={() => window.open("https://ticc.thapar.edu/about", "_blank")}
                  className="border-medical-blue-200 text-medical-blue-600 dark:text-medical-blue-200 hover:bg-medical-blue-50 dark:hover:bg-gray-900"
                >
                  Browse More Resources
                </Button>
              </div>
            </div>
          </BlurEffect>
          
          <BlurEffect delay={500} className="card-hover">
            <div className="glass-effect rounded-xl p-8 h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-lg bg-medical-blue-50 dark:bg-gray-900 flex items-center justify-center">
                  <Users className="h-8 w-8 text-medical-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 dark:text-gray-200">Support Communities</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Access official Thapar University support services for mental health counseling and medical assistance. Our dedicated teams are here to help you thrive.
              </p>
              <div className="space-y-3 mb-8">
                <a 
                  href="https://www.thapar.edu/students/pages/thapar-university-counseling-cell" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-medical-blue-300 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-medical-blue-100 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-medical-blue-200 transition-colors">
                    <Brain className="w-5 h-5 text-medical-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-medical-blue-800 dark:text-medical-blue-200 group-hover:text-medical-blue-600 transition-colors">TU Counseling Cell</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Professional counseling services for students dealing with stress, anxiety, depression, and other mental health concerns.</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-medical-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
                <a 
                  href="https://www.thapar.edu/students/pages/medical-services" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-medical-green-300 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-medical-green-100 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-medical-green-200 transition-colors">
                    <svg className="w-5 h-5 text-medical-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-medical-green-800 dark:text-medical-green-200 group-hover:text-medical-green-600 transition-colors">Medical Services</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">24/7 medical facilities on campus including OPD services, emergency care, ambulance, and health checkups for all students.</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-medical-green-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </div>
              <div className="mt-auto">
                <Button
                  variant="outline"
                  onClick={() => window.open("https://www.thapar.edu/students/pages/thapar-university-counseling-cell", "_blank")}
                  className="border-medical-blue-200 text-medical-blue-600 dark:text-medical-blue-200 hover:bg-medical-blue-50 dark:hover:bg-gray-900"
                >
                  Visit Counseling Cell
                </Button>
              </div>
            </div>
          </BlurEffect>
          
          <BlurEffect delay={600} className="card-hover">
            <div className="glass-effect rounded-xl p-8 h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-lg bg-medical-green-50 dark:bg-gray-900 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-medical-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 dark:text-gray-200">AI Wellness Assistant</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Chat with our AI wellness assistant for immediate emotional support, coping strategies, and guidance on accessing additional resources.
              </p>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start mb-4">
                  <div className="w-8 h-8 rounded-full bg-medical-blue-100 dark:bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-medical-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm">Hello! I'm your wellness assistant. How are you feeling today?</p>
                  </div>
                </div>
                <div className="flex items-start mb-4 justify-end">
                  <div className="bg-medical-blue-100 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm">I've been feeling stressed about my exams...</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ml-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-medical-blue-100 dark:bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-medical-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm">I understand. Exam stress is common. Let's talk about some strategies that might help you manage this feeling...</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto">
                <Button
                  onClick={handleChatNow}
                  className="bg-medical-green-600 hover:bg-medical-green-700 text-white"
                >
                  Chat Now
                </Button>
              </div>
            </div>
          </BlurEffect>
        </div>
      </div>
    </section>
  );
};

export default MentalHealthSupport;
