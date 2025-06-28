
import React from 'react';
import { MapPin, Phone, Mail, Twitter, Facebook, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-medical-blue-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-6">
            <div>
              <a href="/" className="text-2xl font-bold bg-gradient-to-r from-medical-blue-300 to-medical-green-300 bg-clip-text text-transparent">
                TIET Medi-Care
              </a>
              <p className="mt-4 text-medical-blue-100">
                A secure and AI-driven healthcare platform integrated with IoT for the Thapar Institute community.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <a href="/" className="text-medical-blue-100 hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="#features" className="text-medical-blue-100 hover:text-white transition-colors">Features</a>
              </li>
              <li>
                <a href="#appointments" className="text-medical-blue-100 hover:text-white transition-colors">Appointments</a>
              </li>
              <li>
                <a href="#emergency" className="text-medical-blue-100 hover:text-white transition-colors">Emergency</a>
              </li>
              <li>
                <a href="#mental-health" className="text-medical-blue-100 hover:text-white transition-colors">Mental Health</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-medical-blue-300 mr-3 mt-0.5" />
                <span className="text-medical-blue-100">
                  Thapar Institute of Engineering & Technology, Patiala, Punjab 147004
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-medical-blue-300 mr-3" />
                <span className="text-medical-blue-100">+91 123 456 7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-medical-blue-300 mr-3" />
                <span className="text-medical-blue-100">medical@thapar.edu</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6">Stay Updated</h3>
            <p className="text-medical-blue-100 mb-4">
              Subscribe to our newsletter for health tips and platform updates.
            </p>
            <form className="space-y-3">
              <div>
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-medical-blue-200 border border-medical-blue-700 focus:outline-none focus:ring-2 focus:ring-medical-blue-300"
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 rounded-lg bg-medical-blue-500 text-white font-medium hover:bg-medical-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-medical-blue-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-medical-blue-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-medical-blue-200 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} TIET Medi-Care. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-medical-blue-200 text-sm hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-medical-blue-200 text-sm hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-medical-blue-200 text-sm hover:text-white transition-colors">
              Data Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
