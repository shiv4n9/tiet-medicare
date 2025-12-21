import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare';

async function debugDashboard() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Appointment = (await import('./models/Appointment.js')).default;
    const User = (await import('./models/User.js')).default;

    // Get doctor
    const doctor = await User.findOne({ role: 'doctor' });
    console.log('\n📋 Doctor:', doctor?.name, doctor?._id);

    // Get all appointments
    const allAppointments = await Appointment.find({}).lean();
    console.log('\n📊 Total appointments in DB:', allAppointments.length);

    // Show each appointment's date
    console.log('\n📅 Appointment dates:');
    allAppointments.forEach(apt => {
      const aptDate = new Date(apt.date);
      const aptDateStr = aptDate.toISOString().split('T')[0];
      console.log(`  - ${apt.patientName || apt.name}: ${aptDateStr} (${apt.date}) | Doctor: ${apt.doctor} | Status: ${apt.status}`);
    });

    // Today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    console.log('\n📅 Today:', todayStr);

    // Filter for today
    const todayAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const aptDateStr = aptDate.toISOString().split('T')[0];
      return aptDateStr === todayStr;
    });
    console.log('\n✅ Today\'s appointments:', todayAppointments.length);

    // Filter for this doctor
    if (doctor) {
      const doctorAppointments = allAppointments.filter(apt => 
        apt.doctor === doctor.name || apt.doctorId?.toString() === doctor._id.toString()
      );
      console.log('\n👨‍⚕️ This doctor\'s appointments:', doctorAppointments.length);

      const doctorTodayAppointments = doctorAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const aptDateStr = aptDate.toISOString().split('T')[0];
        return aptDateStr === todayStr;
      });
      console.log('👨‍⚕️ This doctor\'s TODAY appointments:', doctorTodayAppointments.length);
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugDashboard();
