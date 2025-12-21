import 'dotenv/config';
import { connectDB } from './config/database.js';
import mongoose from 'mongoose';

const testAppointmentPatch = async () => {
  try {
    await connectDB();
    const Appointment = (await import('./models/Appointment.js')).default;
    
    const appointmentId = '694678a98347b02a64e42775';
    console.log(`🧪 Testing appointment update for ID: ${appointmentId}`);
    
    // Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.log('❌ Appointment not found');
      process.exit(1);
    }
    
    console.log('✅ Appointment found:', {
      id: appointment._id,
      patient: appointment.patientName,
      status: appointment.status
    });
    
    // Test updating the appointment
    console.log('🔄 Attempting to update appointment status...');
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { 
        status: 'in_progress',
        startedAt: new Date()
      },
      { new: true }
    );
    
    if (updatedAppointment) {
      console.log('✅ Appointment updated successfully:', {
        id: updatedAppointment._id,
        status: updatedAppointment.status,
        startedAt: updatedAppointment.startedAt
      });
      
      // Reset it back to scheduled
      await Appointment.findByIdAndUpdate(appointmentId, { 
        status: 'scheduled',
        $unset: { startedAt: 1 }
      });
      console.log('🔄 Reset appointment back to scheduled');
    } else {
      console.log('❌ Failed to update appointment');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testAppointmentPatch();