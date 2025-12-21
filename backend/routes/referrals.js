import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import Referral from '../models/Referral.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Create new referral (during active consultation)
// @route   POST /api/referrals
// @access  Private (Doctor only)
router.post('/', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Only doctors can create referrals');
  }

  const {
    patientId,
    patientEmail,
    appointmentId,
    referredToDoctorId,
    referredToFacility,
    reasonForReferral,
    clinicalInformation,
    requestedServices,
    priority,
    notes
  } = req.body;

  // Verify appointment is in progress
  if (appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.status !== 'in_progress') {
      res.status(400);
      throw new Error('Referrals can only be created during active consultation');
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

  // Verify referred doctor exists (optional for now)
  if (referredToDoctorId) {
    const referredDoctor = await User.findById(referredToDoctorId);
    if (!referredDoctor || referredDoctor.role !== 'doctor') {
      console.warn('Referred doctor not found, but continuing...');
    }
  }

  // Create referral
  const referral = await Referral.create({
    patientId,
    patientEmail,
    referringDoctorId: req.user._id,
    referredToDoctorId,
    referredToFacility,
    reasonForReferral,
    clinicalInformation,
    requestedServices,
    priority: priority || 'routine',
    notes,
    status: 'pending',
    metadata: {
      createdBy: req.user._id
    }
  });

  await referral.populate([
    { path: 'patientId', select: 'name email age gender' },
    { path: 'referringDoctorId', select: 'name specialization' },
    { path: 'referredToDoctorId', select: 'name specialization' }
  ]);

  res.status(201).json({
    success: true,
    data: referral
  });
}));

// @desc    Get referrals
// @route   GET /api/referrals?patientId=xxx
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { patientId, status } = req.query;

  const query = {};

  if (patientId) {
    query.patientId = patientId;
  } else if (req.user.role === 'patient') {
    query.patientId = req.user._id;
  } else if (req.user.role === 'doctor') {
    // Show referrals where user is either referring or referred doctor
    query.$or = [
      { referringDoctorId: req.user._id },
      { referredToDoctorId: req.user._id }
    ];
  }

  if (status) {
    query.status = status;
  }

  const referrals = await Referral.find(query)
    .populate('patientId', 'name email age gender')
    .populate('referringDoctorId', 'name specialization')
    .populate('referredToDoctorId', 'name specialization')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: referrals
  });
}));

// @desc    Get single referral
// @route   GET /api/referrals/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const referral = await Referral.findById(req.params.id)
    .populate('patientId', 'name email age gender')
    .populate('referringDoctorId', 'name specialization')
    .populate('referredToDoctorId', 'name specialization');

  if (!referral) {
    res.status(404);
    throw new Error('Referral not found');
  }

  // Check authorization
  const isAuthorized =
    req.user.role === 'patient' && referral.patientId._id.toString() === req.user._id.toString() ||
    req.user.role === 'doctor' && (
      referral.referringDoctorId._id.toString() === req.user._id.toString() ||
      referral.referredToDoctorId._id.toString() === req.user._id.toString()
    );

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to view this referral');
  }

  res.json({
    success: true,
    data: referral
  });
}));

// @desc    Update referral status
// @route   PATCH /api/referrals/:id/status
// @access  Private (Doctor only)
router.patch('/:id/status', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Only doctors can update referral status');
  }

  const referral = await Referral.findById(req.params.id);

  if (!referral) {
    res.status(404);
    throw new Error('Referral not found');
  }

  const { status, notes } = req.body;

  await referral.updateStatus(status, req.user._id, notes);

  res.json({
    success: true,
    data: referral
  });
}));

export default router;
