import 'dotenv/config';
import { connectDB } from './config/database.js';
import mongoose from 'mongoose';

const checkCurrentAppointments = async () => {
  try {
    await connectDB();
    const Appointment = (await import('./models/Appointment.js')).default;
    
    console.log('🔍 Current appointments in database:');
    const appointments = await Appointment.find({}).sort({ createdAt: -1 });
    
    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. ID: ${apt._id}`);
      console.log(`   Patient: ${apt.patientName || apt.name}`);
      console.log(`   Doctor: ${apt.doctor}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Date: ${apt.date}`);
      console.log('');
    });
    
    // Check specifically for the ID from the frontend
    const targetId = '694678a98347b02a64e42775';
    console.log(`🎯 Checking for target ID: ${targetId}`);
    
    try {
      const targetAppointment = await Appointment.findById(targetId);
      
      if (targetAppointment) {
        console.log('✅ Target appointment FOUND:', targetAppointment);
      } else {
        console.log('❌ Target appointment NOT FOUND in database');
      }
    } catch (error) {
      console.log('❌ Error finding target appointment:', error.message);
    }
    
    // Also check if any appointment matches the patient name "abc"
    const abcAppointments = await Appointment.find({
      $or: [
        { patientName: 'abc' },
        { name: 'abc' }
      ]
    });
    
    console.log(`\n🔍 Appointments for patient "abc": ${abcAppointments.length}`);
    abcAppointments.forEach(apt => {
      console.log(`   ID: ${apt._id} (Status: ${apt.status})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkCurrentAppointments();