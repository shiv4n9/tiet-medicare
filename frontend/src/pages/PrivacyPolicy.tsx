import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Bell } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 via-white to-medical-green-50">
      {/* Header */}
      <div className="bg-medical-blue-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center text-medical-blue-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-medical-blue-200">Last updated: December 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-medical-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-medical-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Introduction</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              TIET Medi-Care ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our healthcare platform designed for the Thapar Institute of Engineering & Technology community.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name, email address, and phone number</li>
                  <li>TIET student/staff ID and department</li>
                  <li>Date of birth and gender</li>
                  <li>Emergency contact information</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Health Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Medical history and current health conditions</li>
                  <li>Appointment records and consultation notes</li>
                  <li>Prescriptions and lab results</li>
                  <li>Mental health assessments and mood tracking data</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Technical Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device information and browser type</li>
                  <li>IP address and location data (for emergency services)</li>
                  <li>Usage patterns and interaction data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-medical-blue-500 mt-1">•</span>
                <span>Provide healthcare services including appointment booking, consultations, and prescriptions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-medical-blue-500 mt-1">•</span>
                <span>Enable emergency response services and location sharing during SOS alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-medical-blue-500 mt-1">•</span>
                <span>Offer mental health support through mood tracking and wellness assessments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-medical-blue-500 mt-1">•</span>
                <span>Send appointment reminders and health notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-medical-blue-500 mt-1">•</span>
                <span>Improve our services through anonymized analytics</span>
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Data Security</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>End-to-end encryption for all health data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Secure authentication with JWT tokens</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Regular security audits and vulnerability assessments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Access controls limiting data to authorized personnel only</span>
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Your Rights</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Access your personal and health data</li>
              <li>• Request correction of inaccurate information</li>
              <li>• Request deletion of your account and data</li>
              <li>• Opt-out of non-essential communications</li>
              <li>• Export your health records</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Contact Us</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              For privacy-related inquiries, please contact:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800">TIET Medi-Care Privacy Team</p>
              <p className="text-gray-600">Email: registrar@thapar.edu</p>
              <p className="text-gray-600">Phone: 1800 202 4100 (Toll-Free)</p>
              <p className="text-gray-600">Address: Thapar Institute of Engineering & Technology, Patiala, Punjab 147004</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
