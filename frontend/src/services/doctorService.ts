import { api } from './api';

export const doctorService = {
  getDashboardOverview: async () => {
    try {
      const res = await api.get('/doctor/dashboard');
      console.log('Dashboard API response:', res.data);
      return res.data.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      return {
        todayAppointments: [],
        stats: {
          todayCount: 0,
          todayCompleted: 0,
          todayPending: 0,
          weekCount: 0,
          weekCompleted: 0,
          totalPatients: 0,
          totalCompleted: 0,
          totalPending: 0
        },
        recentPatients: [],
        criticalAlerts: []
      };
    }
  },

  updateAppointmentStatus: async (appointmentId: string, status: string) => {
    try {
      const res = await api.patch(`/appointments/${appointmentId}`, { status });
      return res.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }
};

export default doctorService;