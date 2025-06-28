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
    const chatButton = document.querySelector('button[aria-label="Open AI assistant"]');
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
              <h3 className="text-xl font-bold mb-4 dark:text-gray-200">Counseling Services</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Connect with professional counselors through secure video sessions or in-person appointments at the campus counseling center.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-medical-green-100 dark:bg-medical-green-900 flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-medical-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-200">Individual counseling sessions</span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-medical-green-100 dark:bg-medical-green-900 flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-medical-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-200">Group therapy workshops</span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-medical-green-100 dark:bg-medical-green-900 flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-medical-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-200">Crisis intervention support</span>
                </li>
              </ul>
              <div className="mt-auto">
                {isAuthenticated ? (
                  <Button 
                    onClick={() => window.location.href = '#appointments'}
                    className="bg-medical-green-600 hover:bg-medical-green-700 text-white"
                  >
                    Schedule Consultation
                  </Button>
                ) : (
                  <Button 
                    onClick={handleAuthRequired}
                    className="bg-medical-green-600 hover:bg-medical-green-700 text-white"
                  >
                    Sign in to Schedule
                  </Button>
                )}
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
                Access a comprehensive library of mental health resources, guides, and self-help tools designed for the unique challenges faced by students.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                  <h4 className="font-medium mb-2 text-medical-blue-800 dark:text-medical-blue-200">Stress Management</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Techniques and exercises to manage academic stress</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                  <h4 className="font-medium mb-2 text-medical-blue-800 dark:text-medical-blue-200">Sleep Improvement</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Guides for better sleep habits and routines</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                  <h4 className="font-medium mb-2 text-medical-blue-800 dark:text-medical-blue-200">Mindfulness</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Meditation and mindfulness practices</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                  <h4 className="font-medium mb-2 text-medical-blue-800 dark:text-medical-blue-200">Anxiety Relief</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Tools to manage anxiety and panic</p>
                </div>
              </div>
              <div className="mt-auto">
                <Button
                  variant="outline"
                  onClick={() => window.open("https://www.thapar.edu/health", "_blank")}
                  className="border-medical-blue-200 text-medical-blue-600 dark:text-medical-blue-200 hover:bg-medical-blue-50 dark:hover:bg-gray-900"
                >
                  Browse Resources
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
                Join moderated peer support groups where you can connect with others facing similar challenges in a safe, confidential environment.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-medical-blue-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-medical-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"></path>
                      <rect x="3" y="4" width="18" height="12" rx="2"></rect>
                      <line x1="2" y1="20" x2="22" y2="20"></line>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-medical-blue-800 dark:text-medical-blue-200">Academic Stress Group</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Wednesdays, 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-medical-green-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-medical-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-medical-green-800 dark:text-medical-green-200">Mindfulness Circle</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Mondays, 5:30 PM</p>
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = "#appointments"}
                    className="border-medical-blue-200 text-medical-blue-600 dark:text-medical-blue-200 hover:bg-medical-blue-50 dark:hover:bg-gray-900"
                  >
                    Join a Group
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleAuthRequired}
                    className="border-medical-blue-200 text-medical-blue-600 dark:text-medical-blue-200 hover:bg-medical-blue-50 dark:hover:bg-gray-900"
                  >
                    Sign in to Join
                  </Button>
                )}
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
