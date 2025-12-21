import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, Users, Scale, Clock } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 via-white to-medical-green-50">
      {/* Header */}
      <div className="bg-medical-blue-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center text-medical-blue-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-medical-blue-200">Last updated: December 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Acceptance */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-medical-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-medical-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Acceptance of Terms</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using TIET Medi-Care, you agree to be bound by these Terms of Service. This platform is designed exclusively for the Thapar Institute of Engineering & Technology (TIET) community, including students, faculty, and staff. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Eligibility</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              To use TIET Medi-Care, you must:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Be a current student, faculty member, or staff of TIET</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Have a valid TIET email address or ID</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Be at least 18 years old, or have parental consent</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Provide accurate and complete registration information</span>
              </li>
            </ul>
          </section>

          {/* Services */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Services Provided</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              TIET Medi-Care provides the following services:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Healthcare Services</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Online appointment booking</li>
                  <li>• Doctor consultations</li>
                  <li>• Digital prescriptions</li>
                  <li>• Lab test referrals</li>
                  <li>• Medical record management</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Mental Health Support</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AI-powered health assistant</li>
                  <li>• Mood tracking tools</li>
                  <li>• Wellness assessments</li>
                  <li>• Crisis support resources</li>
                  <li>• TICC counseling referrals</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Emergency Services</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• One-touch SOS alerts</li>
                  <li>• GPS location sharing</li>
                  <li>• Ambulance tracking</li>
                  <li>• Emergency contact notifications</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Health Resources</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Health education articles</li>
                  <li>• Symptom checker</li>
                  <li>• Self-help guides</li>
                  <li>• Campus health information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Medical Disclaimer */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Medical Disclaimer</h2>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>Important:</strong> TIET Medi-Care is not a substitute for professional medical advice, diagnosis, or treatment. The AI health assistant and symptom checker provide general information only. Always seek the advice of qualified healthcare providers for any medical conditions. In case of emergency, call 112 or visit the nearest hospital immediately.
              </p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">User Responsibilities</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              As a user, you agree to:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Provide accurate health information for proper care</li>
              <li>• Keep your account credentials secure</li>
              <li>• Not share your account with others</li>
              <li>• Use the platform responsibly and ethically</li>
              <li>• Report any security vulnerabilities or misuse</li>
              <li>• Attend scheduled appointments or cancel in advance</li>
              <li>• Not use the emergency SOS feature for non-emergencies</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Limitation of Liability</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              TIET Medi-Care and Thapar Institute shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our liability is limited to the extent permitted by applicable law.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Changes to Terms</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <div className="mt-8 p-6 bg-medical-blue-50 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-2">Questions about these Terms?</h3>
              <p className="text-gray-600 mb-4">Contact us at:</p>
              <div className="space-y-1 text-gray-600">
                <p>Email: registrar@thapar.edu</p>
                <p>Phone: 1800 202 4100 (Toll-Free)</p>
                <p>Address: Thapar Institute of Engineering & Technology, Patiala, Punjab 147004</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
