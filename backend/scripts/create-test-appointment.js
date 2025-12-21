import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTestAppointment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Find a doctor
    const doctor = await User.findOne({ role: 'doctor' });
    if (!doctor) {
      console.log('No doctor found. Please create a doctor user first.');
      process.exit(1);
    }
    
    console.log('Found doctor:', doctor.name);
    
    // Find a patient
    const patient = await User.findOne({ role: 'patient' });
    
    // Create appointment
    const appointment = await Appointment.create({
      name: 'Test Patient',
      email: patient?.email || 'test@example.com',
      contactNumber: '1234567890',
      date: new Date(),
      time: '10:00',
      doctor: doctor.name,
      doctorId: doctor._id,
      patientId: patient?._id || null,
      patientName: 'Test Patient',
      patientEmail: patient?.email || 'test@example.com',
      patientAge: 25,
      patientGender: 'Male',
      department: 'General',
      service: 'General Checkup',
      status: 'scheduled',
      duration: 30,
      location: 'Clinic Room 1'
    });
    
    console.log('\n✅ Test appointment created successfully!');
    console.log('Appointment ID:', appointment._id);
    console.log('Patient ID:', appointment.patientId || 'Not set');
    console.log('Doctor ID:', appointment.doctorId);
    console.log('Status:', appointment.status);
    console.log('\nNow refresh your dashboard to see this appointment!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestAppointment();
