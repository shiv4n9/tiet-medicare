import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function emergencyFixAppointments() {
  try {
    // Connect to MongoDB Atlas
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the appointments collection directly
    const db = mongoose.connection.db;
    const appointmentsCollection = db.collection('appointments');

    console.log('\n🔍 Finding all appointments...');
    const appointments = await appointmentsCollection.find({}).toArray();
    console.log(`📊 Total appointments found: ${appointments.length}`);

    let validCount = 0;
    let invalidCount = 0;
    const invalidIds = [];

    // Check each appointment
    for (const apt of appointments) {
      const idString = apt._id.toString();
      const isValid = mongoose.Types.ObjectId.isValid(idString) && /^[a-f\d]{24}$/i.test(idString);
      
      console.log(`\n📋 Appointment: ${idString} (${idString.length} chars)`);
      console.log(`   Patient: ${apt.name || apt.patientName || 'Unknown'}`);
      console.log(`   Status: ${apt.status || 'Unknown'}`);
      console.log(`   Valid: ${isValid ? '✅' : '❌'}`);
      
      if (isValid) {
        validCount++;
      } else {
        invalidCount++;
        invalidIds.push(apt._id);
        console.log(`   🚨 INVALID APPOINTMENT DETECTED!`);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Valid appointments: ${validCount}`);
    console.log(`   Invalid appointments: ${invalidCount}`);

    if (invalidCount > 0) {
      console.log('\n🗑️  Deleting invalid appointments...');
      
      for (const invalidId of invalidIds) {
        try {
          const result = await appointmentsCollection.deleteOne({ _id: invalidId });
          console.log(`   ✅ Deleted appointment: ${invalidId}`);
        } catch (error) {
          console.log(`   ❌ Failed to delete appointment: ${invalidId}`, error.message);
        }
      }
      
      console.log(`\n🎉 Cleanup complete! Deleted ${invalidCount} invalid appointments.`);
    } else {
      console.log('\n✅ No invalid appointments found!');
    }

    // Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    const remainingAppointments = await appointmentsCollection.find({}).toArray();
    console.log(`📊 Remaining appointments: ${remainingAppointments.length}`);
    
    for (const apt of remainingAppointments) {
      const idString = apt._id.toString();
      const isValid = mongoose.Types.ObjectId.isValid(idString) && /^[a-f\d]{24}$/i.test(idString);
      console.log(`   ${idString} - ${isValid ? '✅ VALID' : '❌ STILL INVALID'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

emergencyFixAppointments();