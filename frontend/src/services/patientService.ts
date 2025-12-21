import { api } from './api';

export const patientService = {
  // Dashboard overview (aggregated data)
  getDashboardOverview: async () => {
    const res = await api.get('/patients/dashboard');
    return res.data.data;
  },

  // Get full patient dashboard with all clinical data
  getFullDashboard: async (patientId: string) => {
    const res = await api.get(`/patients/${patientId}/dashboard`);
    return res.data.data;
  },

  // Appointments
  getAppointments: async () => {
    const res = await api.get('/patients/appointments');
    return res.data.data;
  },

  bookAppointment: async (appointmentData: any) => {
    const res = await api.post('/appointments', appointmentData);
    return res.data.data;
  },

  cancelAppointment: async (appointmentId: string) => {
    const res = await api.put(`/appointments/${appointmentId}`, { status: 'cancelled' });
    return res.data.data;
  },

  // Medical Records
  getMedicalRecords: async () => {
    const res = await api.get('/patients/medical-records');
    return res.data.data;
  },

  getMedicalRecord: async (recordId: string) => {
    const res = await api.get(`/patients/medical-records/${recordId}`);
    return res.data.data;
  },

  // Prescriptions
  getPrescriptions: async () => {
    const res = await api.get('/patients/prescriptions');
    return res.data.data;
  },

  requestRefill: async (prescriptionId: string) => {
    const res = await api.post(`/patients/prescriptions/${prescriptionId}/refill`);
    return res.data.data;
  },

  // Lab Results
  getLabResults: async () => {
    const res = await api.get('/patients/lab-results');
    return res.data.data;
  },

  getLabResult: async (resultId: string) => {
    const res = await api.get(`/patients/lab-results/${resultId}`);
    return res.data.data;
  },

  // Referrals
  getReferrals: async () => {
    const res = await api.get('/patients/referrals');
    return res.data.data;
  },

  getReferral: async (referralId: string) => {
    const res = await api.get(`/patients/referrals/${referralId}`);
    return res.data.data;
  },

  // Profile
  getProfile: async () => {
    const res = await api.get('/patients/profile');
    return res.data.data;
  },

  updateProfile: async (profileData: any) => {
    const res = await api.put('/patients/profile', profileData);
    return res.data.data;
  },

  // Health metrics
  getHealthMetrics: async () => {
    const res = await api.get('/patients/health-metrics');
    return res.data.data;
  },

  addHealthMetric: async (metricData: any) => {
    const res = await api.post('/patients/health-metrics', metricData);
    return res.data.data;
  },

  // Messages/Communication
  getMessages: async () => {
    const res = await api.get('/patients/messages');
    return res.data.data;
  },

  sendMessage: async (messageData: any) => {
    const res = await api.post('/patients/messages', messageData);
    return res.data.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await api.get('/patients/notifications');
    return res.data.data;
  },

  markNotificationRead: async (notificationId: string) => {
    const res = await api.put(`/patients/notifications/${notificationId}/read`);
    return res.data.data;
  }
};

export default patientService;