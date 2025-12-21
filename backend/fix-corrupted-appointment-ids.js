import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
console.log('🔗 Connecting to MongoDB Atlas...');

try {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Get the appointments collection directly
  const db = mongoose.connection.db;
  const appointmentsCollection = db.collection('appointments');

  console.log('\n🔍 Checking for corrupted appointment IDs...');
  
  // Find all appointments
  const appointments = await appointmentsCollection.find({}).toArray();
  console.log(`📊 Total appointments found: ${appointments.length}`);

  let corruptedCount = 0;
  let validCount = 0;

  appointments.forEach((apt, index) => {
    const idString = apt._id.toString();
    const isValid = /^[a-f\d]{24}$/i.test(idString);
    
    console.log(`\n${index + 1}. Appointment:`);
    console.log(`   ID: ${idString} (${idString.length} chars)`);
    console.log(`   Patient: ${apt.name || apt.patientName || 'Unknown'}`);
    console.log(`   Status: ${apt.status || 'Unknown'}`);
    console.log(`   Valid: ${isValid ? '✅' : '❌'}`);
    
    if (isValid) {
      validCount++;
    } else {
      corruptedCount++;
      console.log(`   🚨 CORRUPTED ID DETECTED!`);
    }
  });

  console.log(`\n📈 Summary:`);
  console.log(`   Valid appointments: ${validCount}`);
  console.log(`   Corrupted appointments: ${corruptedCount}`);

  if (corruptedCount === 0) {
    console.log('\n🎉 No corrupted appointment IDs found in database!');
    console.log('   The issue must be in the frontend data transformation.');
  } else {
    console.log('\n⚠️  Found corrupted appointment IDs in database!');
    console.log('   These need to be fixed or recreated.');
  }

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.connection.close();
  console.log('\n🔌 Database connection closed');
}