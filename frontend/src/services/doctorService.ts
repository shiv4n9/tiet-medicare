import { api } from './api';

export const doctorService = {
  getDashboardOverview: async () => {
    const res = await api.get('/doctor/dashboard');
    return res.data.data;
  },
  searchPatients: async (query: string) => {
    const res = await api.get('/doctor/patients/search', { params: { query } });
    return res.data.data;
  },
  getTodaySchedule: async () => {
    const res = await api.get('/doctor/schedule/today');
    return res.data.data;
  },
  getAnalytics: async (period = 'week') => {
    const res = await api.get('/doctor/analytics', { params: { period } });
    return res.data.data;
  },
  getNotifications: async (unreadOnly = false) => {
    const res = await api.get('/doctor/notifications', { params: { unreadOnly } });
    return res.data.data.notifications;
  },
  markNotificationRead: async (id: string) => {
    const res = await api.put(`/doctor/notifications/${id}/read`);
    return res.data.data;
  },
  getPatientRecords: async (patientId: string) => {
    const res = await api.get(`/doctor/patients/${patientId}/records`);
    return res.data.data;
  },
  createMedicalRecord: async (patientId: string, record: any) => {
    const res = await api.post(`/doctor/patients/${patientId}/records`, record);
    return res.data.data;
  },
  getConversations: async () => {
    const res = await api.get('/doctor/conversations');
    return res.data.data;
  },
  getMessages: async (conversationId: string) => {
    const res = await api.get(`/doctor/conversations/${conversationId}/messages`);
    return res.data.data;
  },
  getLabOrders: async () => {
    const res = await api.get('/doctor/lab-orders');
    return res.data.data;
  },
  getTestTemplates: async () => {
    const res = await api.get('/doctor/test-templates');
    return res.data.data;
  },
  getLabResults: async () => {
    const res = await api.get('/doctor/lab-results');
    return res.data.data;
  },
  createLabOrder: async (orderData: any) => {
    const res = await api.post('/doctor/lab-orders', orderData);
    return res.data.data;
  },
  getPrescriptions: async () => {
    const res = await api.get('/doctor/prescriptions');
    return res.data.data;
  },
  getMedications: async () => {
    const res = await api.get('/doctor/medications');
    return res.data.data;
  },
  getRefillRequests: async () => {
    const res = await api.get('/doctor/refill-requests');
    return res.data.data;
  },
  approveRefill: async (prescriptionId: string) => {
    const res = await api.put(`/doctor/prescriptions/${prescriptionId}/approve-refill`);
    return res.data.data;
  },
  createPrescription: async (prescriptionData: any) => {
    const res = await api.post('/doctor/prescriptions', prescriptionData);
    return res.data.data;
  },
  getNotes: async () => {
    const res = await api.get('/doctor/notes/notes');
    return res.data.data;
  },
  getNoteTemplates: async () => {
    const res = await api.get('/doctor/notes/note-templates');
    return res.data.data;
  },
  getNoteDrafts: async () => {
    const res = await api.get('/doctor/notes/note-drafts');
    return res.data.data;
  },
  saveNote: async (noteData: any) => {
    const res = await api.post('/doctor/notes/notes', noteData);
    return res.data.data;
  },
  createNoteFromTemplate: async (data: { templateId: string; patientId: string }) => {
    const res = await api.post('/doctor/notes/notes/from-template', data);
    return res.data.data;
  },
  getReferrals: async () => {
    const res = await api.get('/doctor/referrals/referrals');
    return res.data.data;
  },
  getSpecialists: async () => {
    const res = await api.get('/doctor/referrals/specialists');
    return res.data.data;
  },
  getReferralFeedback: async () => {
    const res = await api.get('/doctor/referrals/referral-feedback');
    return res.data.data;
  },
  createReferral: async (referralData: any) => {
    const res = await api.post('/doctor/referrals/referrals', referralData);
    return res.data.data;
  },
  updateReferralStatus: async (data: { referralId: string; status: string }) => {
    const res = await api.put(`/doctor/referrals/referrals/${data.referralId}/status`, { status: data.status });
    return res.data.data;
  },
  getDoctorProfile: async () => {
    const res = await api.get('/doctor/profile/profile');
    return res.data.data;
  },
  getDoctorAvailability: async () => {
    const res = await api.get('/doctor/profile/availability/slots');
    return res.data.data;
  },
  getLeaveRequests: async () => {
    const res = await api.get('/doctor/profile/leave-requests');
    return res.data.data;
  },
  getPatientFeedback: async () => {
    const res = await api.get('/doctor/profile/feedback');
    return res.data.data;
  },
  updateDoctorProfile: async (profileData: any) => {
    const res = await api.put('/doctor/profile/profile', profileData);
    return res.data.data;
  },
  updateAvailability: async (availabilityData: any) => {
    const res = await api.put('/doctor/profile/availability/slots', availabilityData);
    return res.data.data;
  },
  createLeaveRequest: async (leaveData: any) => {
    const res = await api.post('/doctor/profile/leave-requests', leaveData);
    return res.data.data;
  },
  getComplianceAlerts: async () => {
    const res = await api.get('/doctor/compliance-alerts');
    return res.data.data;
  },
  getAuditTrail: async () => {
    const res = await api.get('/doctor/audit-trail');
    return res.data.data;
  },
  getComplianceReports: async () => {
    const res = await api.get('/doctor/compliance-reports');
    return res.data.data;
  },
  acknowledgeAlert: async (alertId: string) => {
    const res = await api.put(`/doctor/compliance-alerts/${alertId}/acknowledge`);
    return res.data.data;
  },
  resolveAlert: async (alertId: string) => {
    const res = await api.put(`/doctor/compliance-alerts/${alertId}/resolve`);
    return res.data.data;
  },
};

export default doctorService; 