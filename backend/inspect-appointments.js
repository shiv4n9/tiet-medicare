import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';

const inspectAppointments = async () => {
  try {
    console.log('🔍 Inspecting appointments in database...');
    
    // Connect to database
    await connectDB();
    
    // Import Appointment model
    const Appointment = (await import('./models/Appointment.js')).default;
    
    // Get all appointments
    const appointments = await Appointment.find({}).limit(10);
    console.log(`📊 Found ${appointments.length} appointments`);
    
    appointments.forEach((apt, index) => {
      console.log(`\n--- Appointment ${index + 1} ---`);
      console.log(`ID: ${apt._id} (${apt._id.toString().length} chars)`);
      console.log(`Valid ObjectId: ${mongoose.Types.ObjectId.isValid(apt._id)}`);
      console.log(`Patient: ${apt.patientName || apt.name}`);
      console.log(`Doctor: ${apt.doctor}`);
      console.log(`Status: ${apt.status}`);
      console.log(`Date: ${apt.date}`);
      console.log(`Time: ${apt.time}`);
      
      // Check if this is the problematic appointment
      if (apt._id.toString() === '6467b2db147d7d2a6e427775') {
        console.log('🚨 FOUND THE PROBLEMATIC APPOINTMENT!');
        console.log('Full data:', JSON.stringify(apt, null, 2));
      }
    });
    
    // Check for appointments with invalid IDs
    const invalidAppointments = appointments.filter(apt => 
      !mongoose.Types.ObjectId.isValid(apt._id) || apt._id.toString().length !== 24
    );
    
    if (invalidAppointments.length > 0) {
      console.log(`\n🚨 Found ${invalidAppointments.length} appointments with invalid IDs:`);
      invalidAppointments.forEach(apt => {
        console.log(`  - ${apt._id} (${apt._id.toString().length} chars)`);
      });
    } else {
      console.log('\n✅ All appointment IDs are valid ObjectIds');
    }
    
    // Check the raw collection data
    console.log('\n🔍 Checking raw collection data...');
    const rawAppointments = await mongoose.connection.db.collection('appointments').find({}).limit(5).toArray();
    
    rawAppointments.forEach((apt, index) => {
      console.log(`Raw appointment ${index + 1}:`);
      console.log(`  _id: ${apt._id} (type: ${typeof apt._id})`);
      console.log(`  _id string: ${apt._id.toString()} (${apt._id.toString().length} chars)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Inspection failed:', error);
    process.exit(1);
  }
};

inspectAppointments();