
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import AppointmentCard from '../components/AppointmentCard';
import EmergencyTracking from '../components/EmergencyTracking';
import MentalHealthSupport from '../components/MentalHealthSupport';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot/ChatBot';
import AnimatedBackground from '../components/AnimatedBackground';

const Index: React.FC = () => {
  // Function to toggle chat that can be passed to components
  const toggleChat = () => {
    // Find and click the chat button
    const chatButton = document.querySelector('button[aria-label="Open AI assistant"]');
    if (chatButton) {
      (chatButton as HTMLButtonElement).click();
    }
  };
  
  // Smooth scroll to section when clicking navigation links
  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleHashChange(); // Check on initial load
    window.addEventListener('hashchange', handleHashChange);
    
    // Handle navigation click events
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          const id = href.replace('#', '');
          const element = document.getElementById(id);
          if (element) {
            window.history.pushState(null, '', href);
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <AnimatedBackground />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <section id="appointments">
          <AppointmentCard />
        </section>
        <section id="emergency">
          <EmergencyTracking />
        </section>
        <section id="mental-health">
          <MentalHealthSupport toggleChat={toggleChat} />
        </section>
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Index;
