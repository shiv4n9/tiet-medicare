import { api } from './api';

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  department: string;
  consultationFee: number;
  rating: number;
  totalRatings: number;
  availability: Array<{
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
}

export const doctorsService = {
  // Get all available doctors for appointment booking
  getAvailableDoctors: async (filters?: {
    specialization?: string;
    department?: string;
  }): Promise<Doctor[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.specialization) {
        params.append('specialization', filters.specialization);
      }
      if (filters?.department) {
        params.append('department', filters.department);
      }

      const response = await api.get(`/doctors/available?${params.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching available doctors:', error);
      return [];
    }
  },

  // Get doctor by ID
  getDoctorById: async (doctorId: string): Promise<Doctor | null> => {
    try {
      const doctors = await doctorsService.getAvailableDoctors();
      return doctors.find(doctor => doctor._id === doctorId) || null;
    } catch (error) {
      console.error('Error fetching doctor by ID:', error);
      return null;
    }
  },

  // Get doctors by specialization
  getDoctorsBySpecialization: async (specialization: string): Promise<Doctor[]> => {
    return doctorsService.getAvailableDoctors({ specialization });
  },

  // Get doctors by department
  getDoctorsByDepartment: async (department: string): Promise<Doctor[]> => {
    return doctorsService.getAvailableDoctors({ department });
  }
};

export default doctorsService;