import React, { useState } from 'react';
import { patientService } from './services/api';
import { toast } from 'sonner';

interface PatientFormProps {
  onPatientAdded?: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ onPatientAdded }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !age || !symptoms) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      await patientService.createPatient({
        name,
        age: Number(age),
        symptoms,
        // Add any additional fields that might be required by your backend
      });
      
      // Reset form
      setName('');
      setAge('');
      setSymptoms('');
      
      toast.success('Patient information saved successfully!');
      
      // Notify parent component
      if (onPatientAdded) {
        onPatientAdded();
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error('Failed to save patient. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Patient</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter patient's full name"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            type="number"
            id="age"
            min="0"
            max="120"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter patient's age"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
            Symptoms
          </label>
          <textarea
            id="symptoms"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe the symptoms"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Saving...' : 'Save Patient'}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;
