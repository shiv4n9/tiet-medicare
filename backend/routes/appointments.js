import express from 'express';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Prescription from '../models/Prescription.js';
import LabOrder from '../models/LabOrder.js';
import Referral from '../models/Referral.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route to verify router is working
router.get('/test', (req, res) => {
  console.log('🧪 Test route hit!');
  res.json({ message: 'Appointments router is working!' });
});

// Create appointment - NO AUTH REQUIRED for booking
router.post("/", async (req, res, next) => {
  try {
    console.log('Creating new appointment with data:', req.body);
    console.log('User from request:', req.user);
    
    // Validate required fields
    const { name, email, date, time, doctor, service } = req.body;
    
    if (!name || !email || !date || !time || !doctor || !service) {
      console.error('Missing required fields:', { name, email, date, time, doctor, service });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields',
        required: ['name', 'email', 'date', 'time', 'doctor', 'service']
      });
    }
    
    // Check if the appointment time has already passed
    const appointmentDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    if (appointmentDate < now) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot book an appointment in the past. Please select a future time slot.'
      });
    }
    
    // Check if slot is available (not already booked)
    const isAvailable = await Appointment.isSlotAvailable(doctor, date, time);
    if (!isAvailable) {
      return res.status(400).json({ 
        success: false, 
        error: 'This time slot is already booked. Please select a different time.'
      });
    }
    
    // Get authenticated user if available
    const currentUser = req.user;
    
    // Try to find patient by email if not provided
    let patientId = req.body.patientId;
    let doctorId = req.body.doctorId;
    
    // If user is logged in, use their ID
    if (currentUser) {
      if (currentUser.role === 'patient') {
        patientId = currentUser._id;
      } else if (currentUser.role === 'doctor') {
        doctorId = currentUser._id;
      }
    }
    
    // If still no patientId, try to find by email
    if (!patientId && email) {
      const User = (await import('../models/User.js')).default;
      const patient = await User.findOne({ email, role: 'patient' });
      if (patient) {
        patientId = patient._id;
        console.log('Found patient by email:', patientId);
      }
    }
    
    // If still no doctorId, try to find by name
    if (!doctorId && doctor) {
      const User = (await import('../models/User.js')).default;
      const doctorUser = await User.findOne({ name: doctor, role: 'doctor' });
      if (doctorUser) {
        doctorId = doctorUser._id;
        console.log('Found doctor by name:', doctorId);
      }
    }
    
    // Prepare appointment data with all fields
    const appointmentData = {
      name: req.body.name,
      email: req.body.email,
      contactNumber: req.body.contactNumber,
      date: req.body.date,
      time: req.body.time,
      doctor: req.body.doctor,
      doctorId: doctorId,
      patientId: patientId,
      patientName: req.body.patientName || req.body.name,
      patientEmail: req.body.patientEmail || req.body.email,
      patientAge: req.body.patientAge || null,
      patientGender: req.body.patientGender || '',
      department: req.body.department || req.body.service,
      specialization: req.body.specialization || 'General Medicine',
      type: req.body.type || req.body.service,
      service: req.body.service,
      notes: req.body.notes || '',
      status: req.body.status || 'scheduled',
      appointmentTime: req.body.appointmentTime || req.body.time,
      appointmentDate: req.body.appointmentDate || req.body.date,
      duration: req.body.duration || 30,
      location: req.body.location || 'Clinic Room 1'
    };
    
    // Create and save the appointment
    const appointment = new Appointment(appointmentData);
    
    await appointment.save();
    
    console.log('✅ Appointment created successfully!');
    console.log('   ID:', appointment._id);
    console.log('   Patient ID:', appointment.patientId || '❌ NOT SET');
    console.log('   Doctor ID:', appointment.doctorId || '❌ NOT SET');
    console.log('   Status:', appointment.status);
    
    res.status(201).json({
      success: true,
      data: appointment
    });
    
  } catch (error) {
    console.error('Error creating appointment:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate appointment',
        message: 'An appointment with these details already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        messages
      });
    }
    
    // Pass to error handler middleware
    next(error);
  }
});

// Get appointments by email
router.get("/:email", async (req, res, next) => {
  try {
    console.log(`Fetching appointments for email: ${req.params.email}`);
    
    const appointments = await Appointment.find(
      { email: req.params.email },
      { doctor: 1, date: 1, time: 1, service: 1, status: 1, _id: 1 }
    ).sort({ date: 1, time: 1 });
    
    console.log(`Found ${appointments.length} appointments`);
    
    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
    
  } catch (error) {
    console.error('Error fetching appointments:', error);
    next(error);
  }
});

// Update appointment status (including consultation flow)
router.patch("/:id", async (req, res, next) => {
  try {
    console.log('🔥 PATCH /api/appointments/:id HIT!');
    console.log('Appointment ID:', req.params.id);
    
    const { 
      status, startedAt, completedAt, notes,
      chiefComplaint, vitalSigns, diagnosis, treatmentPlan, 
      prescriptions: rxPrescriptions, followUp 
    } = req.body;
    
    // Validate ObjectId format
    const mongoose = (await import('mongoose')).default;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('❌ Invalid ObjectId format:', req.params.id);
      return res.status(400).json({
        success: false,
        error: 'Invalid appointment ID format'
      });
    }
    
    // First, check if appointment exists
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      console.error('❌ Appointment NOT FOUND in database!');
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    console.log('✅ Appointment found:', {
      id: appointment._id,
      doctor: appointment.doctor,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      patientEmail: appointment.patientEmail || appointment.email,
      status: appointment.status
    });

    const previousStatus = appointment.status;

    // Update fields
    if (status) appointment.status = status;
    if (startedAt) appointment.startedAt = startedAt;
    if (completedAt) appointment.completedAt = completedAt;
    if (notes) appointment.notes = notes;

    // Starting consultation
    if (status === 'in_progress' && previousStatus !== 'in_progress') {
      appointment.startedAt = startedAt || new Date();
      console.log('📋 Consultation started at:', appointment.startedAt);
    }

    // Completing consultation - create medical record with full data
    if (status === 'completed' && previousStatus === 'in_progress') {
      appointment.completedAt = completedAt || new Date();
      
      console.log('📋 Creating medical record for completed consultation...');
      
      try {
        // Prepare medical record data from consultation form
        const medicalRecordData = {
          patientId: appointment.patientId,
          patientEmail: appointment.patientEmail || appointment.email,
          doctorId: appointment.doctorId,
          appointmentId: appointment._id,
          visitDate: appointment.date || new Date(),
          
          // Chief complaint
          chiefComplaint: chiefComplaint || appointment.service || 'General Consultation',
          
          // Vital signs from consultation
          vitalSigns: vitalSigns || {},
          
          // Diagnosis array
          diagnosis: diagnosis || [],
          
          // Treatment plan
          treatmentPlan: treatmentPlan || '',
          
          // Prescriptions from consultation form
          prescriptions: (rxPrescriptions || []).map(rx => ({
            medication: rx.medication,
            dosage: rx.dosage,
            frequency: rx.frequency,
            duration: rx.duration,
            instructions: rx.instructions,
            prescribedDate: new Date()
          })),
          
          // Follow-up info
          followUp: followUp || { required: false },
          
          // Doctor's notes
          notes: notes || '',
          
          isActive: true
        };

        // Create the medical record
        const medicalRecord = await MedicalRecord.create(medicalRecordData);
        console.log('✅ Medical record created:', medicalRecord._id);
        console.log('   Diagnosis:', diagnosis?.length || 0, 'condition(s)');
        console.log('   Prescriptions:', rxPrescriptions?.length || 0, 'medication(s)');
        console.log('   Vitals recorded:', vitalSigns ? 'Yes' : 'No');
        
      } catch (medicalRecordError) {
        console.error('❌ Error creating medical record:', medicalRecordError);
      }
    }

    // Save the updated appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: appointment.status,
        startedAt: appointment.startedAt,
        completedAt: appointment.completedAt,
        notes: appointment.notes
      },
      { new: true }
    );
    
    console.log('✅ Appointment updated successfully');
    
    res.json({
      success: true,
      data: updatedAppointment
    });
    
  } catch (error) {
    console.error('Error updating appointment:', error);
    next(error);
  }
});
// Legacy route for backward compatibility
router.put("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    res.json({
      success: true,
      data: appointment
    });
    
  } catch (error) {
    console.error('Error updating appointment status:', error);
    next(error);
  }
});

// Delete appointment
router.delete("/:id", async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    res.json({
      success: true,
      data: {}
    });
    
  } catch (error) {
    console.error('Error deleting appointment:', error);
    next(error);
  }
});

// PUT - Update appointment (for rescheduling)
router.put("/:id", async (req, res, next) => {
  try {
    console.log('🔄 PUT /api/appointments/:id - Updating appointment');
    console.log('Appointment ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const { date, time, status, notes } = req.body;
    
    // Validate ObjectId format
    const mongoose = (await import('mongoose')).default;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid appointment ID format'
      });
    }
    
    // Find the appointment
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    // If rescheduling, check if new slot is available
    if (date && time && (date !== appointment.date?.toISOString().split('T')[0] || time !== appointment.time)) {
      const isAvailable = await Appointment.isSlotAvailable(appointment.doctor, date, time, req.params.id);
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          error: 'The selected time slot is not available'
        });
      }
    }
    
    // Update fields
    const updateData = {};
    if (date) {
      updateData.date = new Date(date);
      updateData.appointmentDate = new Date(date);
    }
    if (time) {
      updateData.time = time;
      updateData.appointmentTime = time;
    }
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log('✅ Appointment updated successfully');
    
    res.json({
      success: true,
      data: updatedAppointment
    });
    
  } catch (error) {
    console.error('Error updating appointment:', error);
    next(error);
  }
});

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find({}).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Quick fix: Add patientId to appointment
router.patch("/:id/add-patient", async (req, res) => {
  try {
    const { patientId } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { patientId },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
