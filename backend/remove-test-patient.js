import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telemedicine';

async function removeTestPatient() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove appointments with "Test Patient" name
    const result = await mongoose.connection.db.collection('appointments').deleteMany({
      patientName: { $regex: /test/i }
    });
    
    console.log(`Removed ${result.deletedCount} test patient appointments`);

    // Also remove any users with "test" in name (optional)
    const userResult = await mongoose.connection.db.collection('users').deleteMany({
      name: { $regex: /^test/i },
      role: 'patient'
    });
    
    console.log(`Removed ${userResult.deletedCount} test patient users`);

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeTestPatient();
