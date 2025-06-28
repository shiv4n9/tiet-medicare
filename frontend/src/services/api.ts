import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending/receiving cookies with CORS requests
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Handle unauthorized (e.g., redirect to login)
          console.error('Unauthorized access - please log in');
          break;
        case 403:
          // Handle forbidden
          console.error('You do not have permission to perform this action');
          break;
        case 404:
          console.error('The requested resource was not found');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error('An error occurred with the request');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up the request:', error.message);
    }
    return Promise.reject(error);
  }
);

// API methods
export const appointmentService = {
  // Get all appointments
  getAppointments: async (params = {}) => {
    try {
      const response = await api.get('/appointments', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Get a single appointment by ID
  getAppointment: async (id: string) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  },

  // Create a new appointment
  createAppointment: async (appointmentData: any) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Update an appointment
  updateAppointment: async (id: string, appointmentData: any) => {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  },

  // Delete an appointment
  deleteAppointment: async (id: string) => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting appointment ${id}:`, error);
      throw error;
    }
  },

  // Get appointments by date range
  getAppointmentsByDateRange: async (startDate: string, endDate: string) => {
    try {
      const response = await api.get(
        '/appointments/range',
        { params: { start: startDate, end: endDate } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments by date range:', error);
      throw error;
    }
  },

  // Get appointments by user email
  getAppointmentsByEmail: async (email: string) => {
    try {
      const response = await api.get(`/appointments/${email}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for email ${email}:`, error);
      throw error;
    }
  },
};

export const patientService = {
  // Get all patients
  getPatients: async (params = {}) => {
    try {
      const response = await api.get('/patients', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get a single patient by ID
  getPatient: async (id: string) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  },

  // Create a new patient
  createPatient: async (patientData: any) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  // Update a patient
  updatePatient: async (id: string, patientData: any) => {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  },

  // Delete a patient
  deletePatient: async (id: string) => {
    try {
      const response = await api.delete(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting patient ${id}:`, error);
      throw error;
    }
  },
};

export default {
  appointmentService,
  patientService,
};
