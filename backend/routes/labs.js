import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import LabOrder from '../models/LabOrder.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';

const router = express.Router();

// @desc    Create new lab order (during active consultation)
// @route   POST /api/labs
// @access  Private (Doctor only)
router.post('/', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Only doctors can create lab orders');
  }

  const { patientId, patientEmail, appointmentId, tests, clinicalNotes, diagnosisCode } = req.body;

  // Verify appointment is in progress
  if (appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.status !== 'in_progress') {
      res.status(400);
      throw new Error('Lab orders can only be created during active consultation');
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

  // Create lab order
  const labOrder = await LabOrder.create({
    patientId,
    patientEmail,
    doctorId: req.user._id,
    appointmentId,
    tests,
    clinicalNotes,
    diagnosisCode,
    status: 'ordered'
  });

  res.status(201).json({
    success: true,
    data: labOrder
  });
}));

// @desc    Get lab orders
// @route   GET /api/labs?patientId=xxx
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { patientId, status } = req.query;

  const query = {};
  
  if (patientId) {
    query.patientId = patientId;
  } else if (req.user.role === 'patient') {
    query.patientId = req.user._id;
  } else if (req.user.role === 'doctor') {
    query.doctorId = req.user._id;
  }

  if (status) {
    query.status = status;
  }

  const labOrders = await LabOrder.find(query)
    .populate('patientId', 'name email age gender')
    .populate('doctorId', 'name specialization')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: labOrders
  });
}));

// @desc    Get single lab order
// @route   GET /api/labs/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const labOrder = await LabOrder.findById(req.params.id)
    .populate('patientId', 'name email age gender')
    .populate('doctorId', 'name specialization');

  if (!labOrder) {
    res.status(404);
    throw new Error('Lab order not found');
  }

  // Check authorization
  if (req.user.role === 'patient' && labOrder.patientId._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this lab order');
  }

  if (req.user.role === 'doctor' && labOrder.doctorId._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this lab order');
  }

  res.json({
    success: true,
    data: labOrder
  });
}));

// @desc    Update lab order status
// @route   PATCH /api/labs/:id
// @access  Private (Doctor only)
router.patch('/:id', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Only doctors can update lab orders');
  }

  const labOrder = await LabOrder.findById(req.params.id);

  if (!labOrder) {
    res.status(404);
    throw new Error('Lab order not found');
  }

  if (labOrder.doctorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this lab order');
  }

  const { status, tests } = req.body;

  if (status) labOrder.status = status;
  if (tests) labOrder.tests = tests;

  await labOrder.save();

  res.json({
    success: true,
    data: labOrder
  });
}));

export default router;
