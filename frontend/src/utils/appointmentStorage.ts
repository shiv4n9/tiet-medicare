// Utility functions for storing appointment details

import { appointmentService } from '@/services/api';

export interface AppointmentDetails {
  _id?: string;
  date: Date | string;
  time: string;
  doctor: string;
  type: string;
  notes?: string;
  patientName?: string;
  patientEmail?: string;
  status?: string;
  userId?: string;
  contactNumber?: string;
  service?: string;
}

// Get all appointments for the current user
export const getAppointments = async (): Promise<AppointmentDetails[]> => {
  try {
    const appointments = await appointmentService.getAppointments();
    return appointments.map((apt: any) => ({
      ...apt,
      date: new Date(apt.date)
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

// Get a single appointment by ID
export const getAppointment = async (id: string): Promise<AppointmentDetails | null> => {
  try {
    const appointment = await appointmentService.getAppointment(id);
    return {
      ...appointment,
      date: new Date(appointment.date)
    };
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return null;
  }
};

// Save a new appointment
export const saveAppointment = async (appointment: AppointmentDetails): Promise<AppointmentDetails | null> => {
  try {
    console.log('Saving appointment:', JSON.stringify(appointment, null, 2));
    
    // Ensure date is in ISO string format for the backend
    const appointmentToSave = {
      ...appointment,
      date: appointment.date instanceof Date ? appointment.date.toISOString() : appointment.date
    };
    
    console.log('Formatted appointment for API:', JSON.stringify(appointmentToSave, null, 2));
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentToSave),
      credentials: 'include',
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Error response from server:', responseData);
      throw new Error(responseData.error || 'Failed to save appointment');
    }
    
    console.log('Appointment saved successfully:', responseData);
    
    return {
      ...responseData.data,
      date: new Date(responseData.data.date)
    };
  } catch (error) {
    console.error('Error in saveAppointment:', {
      error,
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack,
    });
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      throw new Error(error.response.data.message || 'Failed to save appointment');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
      throw error;
    }
  }
};

// Update an existing appointment
export const updateAppointment = async (appointment: AppointmentDetails): Promise<AppointmentDetails | null> => {
  if (!appointment._id) {
    throw new Error('Appointment ID is required for update');
  }

  try {
    const updatedAppointment = await appointmentService.updateAppointment(appointment._id, appointment);
    return {
      ...updatedAppointment,
      date: new Date(updatedAppointment.date)
    };
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

// Delete an appointment
export const deleteAppointment = async (id: string): Promise<boolean> => {
  try {
    await appointmentService.deleteAppointment(id);
    return true;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return false;
  }
};

// Get upcoming appointments
export const getUpcomingAppointments = async (): Promise<AppointmentDetails[]> => {
  try {
    const now = new Date();
    const appointments = await getAppointments();
    return appointments
      .filter(apt => new Date(apt.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    return [];
  }
};

// Check if a time slot is available
export const isSlotAvailable = async (date: Date, time: string, excludeId?: string): Promise<boolean> => {
  try {
    const appointments = await getAppointments();
    const slotAppointments = appointments.filter(apt => {
      const isSameDate = new Date(apt.date).toDateString() === date.toDateString();
      const isSameTime = apt.time === time;
      const isDifferentAppointment = !excludeId || apt._id !== excludeId;
      return isSameDate && isSameTime && isDifferentAppointment;
    });
    
    return slotAppointments.length === 0;
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return false;
  }
};
