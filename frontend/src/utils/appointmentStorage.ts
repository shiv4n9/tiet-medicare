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
      name: appointment.patientName || appointment.name,
      email: appointment.patientEmail || appointment.email,
      contactNumber: appointment.contactNumber,
      date: appointment.date instanceof Date ? appointment.date.toISOString() : appointment.date,
      time: appointment.time,
      doctor: appointment.doctor,
      doctorId: appointment.doctorId,
      department: appointment.department || appointment.service,
      specialization: appointment.specialization,
      type: appointment.type,
      service: appointment.service || appointment.type,
      notes: appointment.notes || '',
      status: appointment.status || 'scheduled',
    };
    
    console.log('Formatted appointment for API:', JSON.stringify(appointmentToSave, null, 2));
    
    // Get API URL with fallback
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('Using API URL:', apiUrl);
    
    const response = await fetch(`${apiUrl}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentToSave),
      credentials: 'include',
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server returned non-JSON response');
    }

    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    if (!response.ok) {
      console.error('Error response from server:', responseData);
      throw new Error(responseData.error || responseData.message || 'Failed to save appointment');
    }
    
    console.log('Appointment saved successfully:', responseData);
    
    return {
      ...responseData.data,
      date: new Date(responseData.data.date)
    };
  } catch (error: any) {
    console.error('Error in saveAppointment:', {
      error,
      errorMessage: error?.message,
      errorName: error?.name,
      errorStack: error?.stack,
    });
    
    // Re-throw with a user-friendly message
    if (error.message.includes('JSON')) {
      throw new Error('Failed to communicate with server. Please try again.');
    } else if (error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error(error.message || 'Failed to save appointment. Please try again.');
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
