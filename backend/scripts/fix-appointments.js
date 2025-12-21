import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixAppointments() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    // Find appointments without patientId or doctorId
    const brokenAppointments = await Appointment.find({
      $or: [
        { patientId: { $exists: false } },
        { patientId: null },
        { doctorId: { $exists: false } },
        { doctorId: null }
      ]
    });
    
    console.log(`\n📊 Found ${brokenAppointments.length} broken appointments\n`);
    
    if (brokenAppointments.length === 0) {
      console.log('✅ No broken appointments found! Database is clean.');
      process.exit(0);
    }
    
    // Display broken appointments
    brokenAppointments.forEach((appt, index) => {
      console.log(`${index + 1}. Appointment ID: ${appt._id}`);
      console.log(`   Patient ID: ${appt.patientId || '❌ MISSING'}`);
      console.log(`   Doctor ID: ${appt.doctorId || '❌ MISSING'}`);
      console.log(`   Patient Name: ${appt.patientName || appt.name || 'Unknown'}`);
      console.log(`   Status: ${appt.status}`);
      console.log(`   Date: ${appt.date}`);
      console.log(`   Time: ${appt.time}`);
      console.log('');
    });
    
    // Ask what to do
    console.log('🔧 Options:');
    console.log('1. Delete all broken appointments');
    console.log('2. Mark as cancelled');
    console.log('3. Just show report (no changes)');
    console.log('');
    
    // For now, just mark as cancelled (safer option)
    console.log('Marking broken appointments as cancelled...');
    
    const result = await Appointment.updateMany(
      {
        $or: [
          { patientId: { $exists: false } },
          { patientId: null },
          { doctorId: { $exists: false } },
          { doctorId: null }
        ]
      },
      {
        $set: {
          status: 'cancelled',
          notes: 'Auto-cancelled: Missing patient ID or doctor ID'
        }
      }
    );
    
    console.log(`\n✅ Updated ${result.modifiedCount} appointments`);
    console.log('These appointments are now marked as cancelled and won\'t show in active lists.');
    
    // Show summary
    const totalAppointments = await Appointment.countDocuments();
    const validAppointments = await Appointment.countDocuments({
      patientId: { $exists: true, $ne: null },
      doctorId: { $exists: true, $ne: null }
    });
    
    console.log(`\n📊 Database Summary:`);
    console.log(`   Total appointments: ${totalAppointments}`);
    console.log(`   Valid appointments: ${validAppointments}`);
    console.log(`   Broken appointments: ${totalAppointments - validAppointments}`);
    
    console.log('\n✅ Cleanup complete!');
    console.log('You can now refresh your dashboard to see only valid appointments.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the script
fixAppointments();
