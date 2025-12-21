import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import Prescription from '../models/Prescription.js';
import Medication from '../models/Medication.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';

const router = express.Router();

// @desc    Create new prescription (during active consultation)
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
router.post('/', protect, asyncHandler(async (req, res) => {
  const { patientId, patientEmail, appointmentId, medications, instructions, notes } = req.body;

  // Verify appointment is in progress
  if (appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.status !== 'in_progress') {
      res.status(400);
      throw new Error('Prescription can only be created during active consultation');
    }
  }

  // If patientId is provided, verify patient exists
  if (patientId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      res.status(404);
      throw new Error('Patient not found');
    }
  }

  // Create prescription
  const prescription = await Prescription.create({
    patientId,
    patientEmail,
    doctorId: req.user._id,
    appointmentId,
    medications,
    instructions,
    notes,
    status: 'active'
  });

  // Populate medication details
  await prescription.populate('medications.medicationId');

  res.status(201).json({
    success: true,
    data: prescription
  });
}));

// @desc    Get prescriptions for a patient
// @route   GET /api/prescriptions?patientId=xxx
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { patientId, status } = req.query;

  const query = {};
  
  if (patientId) {
    query.patientId = patientId;
  } else if (req.user.role === 'patient') {
    // If patient is requesting, only show their own prescriptions
    query.patientId = req.user._id;
  } else if (req.user.role === 'doctor') {
    // If doctor is requesting without patientId, show all their prescriptions
    query.doctorId = req.user._id;
  }

  if (status) {
    query.status = status;
  }

  const prescriptions = await Prescription.find(query)
    .populate('patientId', 'name email age gender')
    .populate('doctorId', 'name specialization')
    .populate('medications.medicationId')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: prescriptions
  });
}));

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patientId', 'name email age gender')
    .populate('doctorId', 'name specialization')
    .populate('medications.medicationId');

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  // Check authorization
  if (req.user.role === 'patient' && prescription.patientId._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this prescription');
  }

  if (req.user.role === 'doctor' && prescription.doctorId._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this prescription');
  }

  res.json({
    success: true,
    data: prescription
  });
}));

// @desc    Update prescription status
// @route   PATCH /api/prescriptions/:id
// @access  Private (Doctor only)
router.patch('/:id', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Only doctors can update prescriptions');
  }

  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }

  if (prescription.doctorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this prescription');
  }

  const { status, notes } = req.body;

  if (status) prescription.status = status;
  if (notes) prescription.notes = notes;

  await prescription.save();

  res.json({
    success: true,
    data: prescription
  });
}));

export default router;
