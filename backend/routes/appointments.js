import express from 'express';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// Create appointment
router.post("/", async (req, res, next) => {
  try {
    console.log('Creating new appointment with data:', req.body);
    
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
    
    // Check if slot is available
    const isAvailable = await Appointment.isSlotAvailable(doctor, date, time);
    if (!isAvailable) {
      return res.status(400).json({ 
        success: false, 
        error: 'Time slot is not available' 
      });
    }
    
    // Create and save the appointment
    const appointment = new Appointment({
      ...req.body,
      status: req.body.status || 'scheduled'
    });
    
    await appointment.save();
    
    console.log('Appointment created successfully:', appointment);
    
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

// Update appointment status
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

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find({}).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
