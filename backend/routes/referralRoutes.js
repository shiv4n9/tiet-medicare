import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import Referral from '../models/Referral.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get all referrals (filtered by role)
// @route   GET /api/doctor/referrals
// @access  Private (Doctor only)
const getReferrals = asyncHandler(async (req, res) => {
  const { 
    status, 
    patientId, 
    type = 'all', // 'sent', 'received', 'all'
    page = 1, 
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  const query = {};
  
  // Filter by role (referring or referred doctor)
  if (type === 'sent') {
    query.referringDoctorId = req.user._id;
  } else if (type === 'received') {
    query.referredToDoctorId = req.user._id;
  } else {
    // Default: show all referrals where user is either referring or referred doctor
    query.$or = [
      { referringDoctorId: req.user._id },
      { referredToDoctorId: req.user._id }
    ];
  }
  
  if (status) query.status = status;
  if (patientId) query.patientId = patientId;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const [referrals, total] = await Promise.all([
    Referral.find(query)
      .populate('patientId', 'name age gender')
      .populate('referringDoctorId', 'name specialty')
      .populate('referredToDoctorId', 'name specialty')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit)),
    Referral.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: referrals,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get a single referral by ID
// @route   GET /api/doctor/referrals/:id
// @access  Private (Doctor only)
const getReferral = asyncHandler(async (req, res) => {
  const referral = await Referral.findById(req.params.id)
    .populate('patientId', 'name age gender bloodGroup')
    .populate('referringDoctorId', 'name specialty contact')
    .populate('referredToDoctorId', 'name specialty contact')
    .populate('appointmentId', 'date time status')
    .populate('metadata.createdBy', 'name')
    .populate('metadata.modifiedBy', 'name');

  if (!referral) {
    res.status(404);
    throw new Error('Referral not found');
  }

  // Verify the requesting doctor has access to this referral
  if (
    referral.referringDoctorId._id.toString() !== req.user._id.toString() &&
    referral.referredToDoctorId._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to access this referral');
  }

  res.json({
    success: true,
    data: referral
  });
});

// @desc    Create a new referral
// @route   POST /api/doctor/referrals
// @access  Private (Doctor only)
const createReferral = asyncHandler(async (req, res) => {
  const {
    patientId,
    referredToDoctorId,
    referredToFacility,
    reasonForReferral,
    clinicalInformation,
    requestedServices,
    priority,
    appointmentRequired,
    preferredDateRange,
    notes
  } = req.body;

  // Validate required fields
  if (!patientId || !referredToDoctorId || !reasonForReferral || !requestedServices || !Array.isArray(requestedServices) || requestedServices.length === 0) {
    res.status(400);
    throw new Error('Patient, referred doctor, reason, and at least one requested service are required');
  }

  // Verify the referred doctor exists
  const referredDoctor = await User.findById(referredToDoctorId);
  if (!referredDoctor || referredDoctor.role !== 'doctor') {
    res.status(400);
    throw new Error('Referred doctor not found or is not a doctor');
  }

  // Create the referral
  const referral = await Referral.create({
    patientId,
    referringDoctorId: req.user._id,
    referredToDoctorId,
    referredToFacility: referredToFacility || {
      name: referredDoctor.workplace || 'Medical Center',
      address: referredDoctor.address || {}
    },
    reasonForReferral,
    clinicalInformation: clinicalInformation || {},
    requestedServices,
    priority: priority || 'routine',
    appointmentRequired: appointmentRequired !== undefined ? appointmentRequired : true,
    preferredDateRange: preferredDateRange || {},
    notes,
    status: 'pending',
    metadata: {
      createdBy: req.user._id
    }
  });

  // Create notification for the referred doctor
  await Notification.create({
    recipientId: referredToDoctorId,
    senderId: req.user._id,
    type: 'new_referral',
    title: 'New Patient Referral',
    message: `You have received a new patient referral from Dr. ${req.user.name}.`,
    priority: priority === 'emergency' ? 'high' : 'medium',
    metadata: {
      referralId: referral._id,
      patientId,
      referringDoctorId: req.user._id
    }
  });

  res.status(201).json({
    success: true,
    data: await referral.populate([
      { path: 'patientId', select: 'name age gender' },
      { path: 'referringDoctorId', select: 'name specialty' },
      { path: 'referredToDoctorId', select: 'name specialty' }
    ])
  });
});

// @desc    Update referral status
// @route   PUT /api/doctor/referrals/:id/status
// @access  Private (Doctor only)
const updateReferralStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  
  const referral = await Referral.findById(req.params.id);
  
  if (!referral) {
    res.status(404);
    throw new Error('Referral not found');
  }

  // Verify the requesting doctor is either the referring or referred doctor
  if (
    referral.referringDoctorId.toString() !== req.user._id.toString() &&
    referral.referredToDoctorId.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to update this referral');
  }

  // Only the referred doctor can accept/reject a referral
  if (
    (status === 'accepted' || status === 'rejected') &&
    referral.referredToDoctorId.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Only the referred doctor can accept or reject a referral');
  }

  // Only the referring doctor can cancel a pending referral
  if (
    status === 'cancelled' &&
    referral.referringDoctorId.toString() !== req.user._id.toString() &&
    referral.status === 'pending'
  ) {
    res.status(403);
    throw new Error('Only the referring doctor can cancel a pending referral');
  }

  // Update the status
  await referral.updateStatus(status, req.user._id, notes);
  const updatedReferral = await Referral.findById(referral._id)
    .populate('patientId', 'name age gender')
    .populate('referringDoctorId', 'name specialty')
    .populate('referredToDoctorId', 'name specialty');

  // Create notifications based on status change
  let notificationTitle = '';
  let notificationMessage = '';
  let recipientId = null;
  let priority = 'medium';

  switch (status) {
    case 'accepted':
      notificationTitle = 'Referral Accepted';
      notificationMessage = `Dr. ${req.user.name} has accepted your referral for ${updatedReferral.patientId.name}.`;
      recipientId = updatedReferral.referringDoctorId._id;
      break;
    case 'rejected':
      notificationTitle = 'Referral Rejected';
      notificationMessage = `Dr. ${req.user.name} has rejected your referral for ${updatedReferral.patientId.name}.`;
      if (notes) notificationMessage += ` Reason: ${notes}`;
      recipientId = updatedReferral.referringDoctorId._id;
      priority = 'high';
      break;
    case 'in-progress':
      notificationTitle = 'Referral In Progress';
      notificationMessage = `Dr. ${req.user.name} has started working on the referral for ${updatedReferral.patientId.name}.`;
      recipientId = updatedReferral.referringDoctorId._id;
      break;
    case 'completed':
      notificationTitle = 'Referral Completed';
      notificationMessage = `Dr. ${req.user.name} has marked the referral for ${updatedReferral.patientId.name} as completed.`;
      recipientId = updatedReferral.referringDoctorId._id;
      break;
    case 'cancelled':
      notificationTitle = 'Referral Cancelled';
      notificationMessage = `Dr. ${req.user.name} has cancelled the referral for ${updatedReferral.patientId.name}.`;
      if (notes) notificationMessage += ` Reason: ${notes}`;
      recipientId = updatedReferral.referredToDoctorId._id;
      priority = 'high';
      break;
  }

  if (recipientId) {
    await Notification.create({
      recipientId,
      senderId: req.user._id,
      type: 'referral_update',
      title: notificationTitle,
      message: notificationMessage,
      priority,
      metadata: {
        referralId: referral._id,
        patientId: updatedReferral.patientId._id,
        status: status
      }
    });
  }

  res.json({
    success: true,
    data: updatedReferral
  });
});

// @desc    Add feedback to a referral
// @route   POST /api/doctor/referrals/:id/feedback
// @access  Private (Doctor only)
const addReferralFeedback = asyncHandler(async (req, res) => {
  const { comments, rating } = req.body;
  
  const referral = await Referral.findById(req.params.id);
  
  if (!referral) {
    res.status(404);
    throw new Error('Referral not found');
  }

  // Verify the requesting doctor is either the referring or referred doctor
  if (
    referral.referringDoctorId.toString() !== req.user._id.toString() &&
    referral.referredToDoctorId.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to add feedback to this referral');
  }

  const isFromReferredDoctor = referral.referredToDoctorId.toString() === req.user._id.toString();
  
  // Add feedback
  await referral.addFeedback(
    { comments, rating },
    req.user._id,
    isFromReferredDoctor
  );

  const updatedReferral = await Referral.findById(referral._id)
    .populate('patientId', 'name age gender')
    .populate('referringDoctorId', 'name specialty')
    .populate('referredToDoctorId', 'name specialty');

  // Create notification for the other doctor
  const otherDoctorId = isFromReferredDoctor 
    ? referral.referringDoctorId 
    : referral.referredToDoctorId;
  
  const notificationMessage = isFromReferredDoctor
    ? `Dr. ${req.user.name} has provided feedback on the referral for ${updatedReferral.patientId.name}.`
    : `Dr. ${req.user.name} has provided feedback on your referral for ${updatedReferral.patientId.name}.`;

  await Notification.create({
    recipientId: otherDoctorId,
    senderId: req.user._id,
    type: 'referral_feedback',
    title: 'Referral Feedback Received',
    message: notificationMessage,
    priority: 'medium',
    metadata: {
      referralId: referral._id,
      patientId: updatedReferral.patientId._id
    }
  });

  res.json({
    success: true,
    data: updatedReferral
  });
});

// @desc    Get all specialists (doctors with specialties)
// @route   GET /api/doctor/specialists
// @access  Private (Doctor only)
const getSpecialists = asyncHandler(async (req, res) => {
  const { 
    specialty, 
    search, 
    page = 1, 
    limit = 10 
  } = req.query;
  
  const query = { 
    role: 'doctor',
    'specialty': { $exists: true, $ne: '' }
  };
  
  if (specialty) {
    query.specialty = new RegExp(specialty, 'i');
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialty: { $regex: search, $options: 'i' } },
      { 'workplace': { $regex: search, $options: 'i' } }
    ];
  }

  const [doctors, total] = await Promise.all([
    User.find(query)
      .select('name email phone specialty workplace address')
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit)),
    User.countDocuments(query)
  ]);

  // Group by specialty for easier filtering on the frontend
  const specialties = [...new Set(doctors.map(doc => doc.specialty).filter(Boolean))].sort();

  res.json({
    success: true,
    data: doctors,
    meta: {
      specialties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// @desc    Get referral feedback
// @route   GET /api/doctor/referral-feedback
// @access  Private (Doctor only)
const getReferralFeedback = asyncHandler(async (req, res) => {
  const { 
    type = 'received', // 'received' or 'given'
    page = 1, 
    limit = 10 
  } = req.query;
  
  let query = {};
  
  if (type === 'received') {
    // Feedback received about the current user's referrals
    query = {
      'referringDoctorId': req.user._id,
      'feedback.fromReferredDoctor': { $exists: true, $ne: '' }
    };
  } else {
    // Feedback given by the current user
    query = {
      'referredToDoctorId': req.user._id,
      'feedback.fromReferredDoctor': { $exists: true, $ne: '' }
    };
  }

  const [referrals, total] = await Promise.all([
    Referral.find(query)
      .populate('patientId', 'name age gender')
      .populate('referringDoctorId', 'name specialty')
      .populate('referredToDoctorId', 'name specialty')
      .sort({ 'feedback.submittedAt': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit)),
    Referral.countDocuments(query)
  ]);

  // Calculate average rating if any
  const ratings = referrals
    .filter(ref => ref.feedback?.rating)
    .map(ref => ref.feedback.rating);
  
  const averageRating = ratings.length > 0 
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : null;

  res.json({
    success: true,
    data: referrals,
    meta: {
      totalFeedback: total,
      averageRating,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router.get('/referrals', getReferrals);
router.get('/referrals/:id', getReferral);
router.post('/referrals', createReferral);
router.put('/referrals/:id/status', updateReferralStatus);
router.post('/referrals/:id/feedback', addReferralFeedback);
router.get('/specialists', getSpecialists);
router.get('/referral-feedback', getReferralFeedback);

export default router;
