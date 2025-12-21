import mongoose from 'mongoose';
import Appointment from './models/Appointment.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
console.log('Connecting to MongoDB Atlas...');

mongoose.connect(MONGODB_URI);

async function debugAppointmentMismatch() {
  console.log('🔍 Debugging Appointment ID Mismatch');
  console.log('=' .repeat(50));

  try {
    // Get all appointments
    const appointments = await Appointment.find({}).lean();
    console.log(`📊 Total appointments in database: ${appointments.length}`);
    
    appointments.forEach((apt, index) => {
      console.log(`\n${index + 1}. Appointment Details:`);
      console.log(`   ID: ${apt._id}`);
      console.log(`   Patient: ${apt.name || apt.patientName}`);
      console.log(`   Doctor: ${apt.doctor}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Date: ${apt.date}`);
      console.log(`   Time: ${apt.time}`);
      
      // Check if this is the ID from the frontend error
      if (apt._id.toString() === '6946b05dd47e4d2a1c879a') {
        console.log('   🎯 THIS IS THE ID FROM FRONTEND ERROR!');
      }
      if (apt._id.toString() === '693479535d6bc1e4dba73159') {
        console.log('   ✅ THIS IS THE VALID ID FROM API TEST!');
      }
    });

    // Check for any appointments with the problematic ID
    const problematicId = '6946b05dd47e4d2a1c879a';
    const problematicAppointment = await Appointment.findById(problematicId);
    
    console.log(`\n🔍 Searching for problematic ID: ${problematicId}`);
    if (problematicAppointment) {
      console.log('✅ Found appointment with problematic ID:', problematicAppointment);
    } else {
      console.log('❌ No appointment found with problematic ID');
      console.log('   This explains the 404 error!');
    }

    // Check if there are any appointments for today that a doctor would see
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const todayAppointments = await Appointment.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).lean();
    
    console.log(`\n📅 Today's appointments: ${todayAppointments.length}`);
    todayAppointments.forEach((apt, index) => {
      console.log(`   ${index + 1}. ${apt._id} - ${apt.name || apt.patientName} - ${apt.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugAppointmentMismatch();