import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';

const testDB = async () => {
  try {
    console.log('🧪 Testing MongoDB connection...');
    
    // Connect to database
    await connectDB();
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({ name: String, createdAt: Date });
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({ 
      name: 'Connection Test', 
      createdAt: new Date() 
    });
    
    await testDoc.save();
    console.log('✅ Test document created:', testDoc._id);
    
    // Clean up
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🧹 Test document deleted');
    
    console.log('🎉 MongoDB connection is working perfectly!');
    
    // Check appointments collection
    const Appointment = (await import('./models/Appointment.js')).default;
    const appointmentCount = await Appointment.countDocuments();
    console.log(`📊 Appointments in database: ${appointmentCount}`);
    
    if (appointmentCount > 0) {
      const sampleAppointments = await Appointment.find({}).limit(3);
      console.log('Sample appointments:');
      sampleAppointments.forEach(apt => {
        console.log(`  - ${apt._id}: ${apt.name} (${apt.doctor})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
};

testDB();