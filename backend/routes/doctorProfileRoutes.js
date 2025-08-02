import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import DoctorProfile from '../models/DoctorProfile.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @desc    Get or create doctor profile
// @route   GET /api/doctor/profile
// @access  Private (Doctor only)
const getDoctorProfile = asyncHandler(async (req, res) => {
  let profile = await DoctorProfile.findOne({ userId: req.user._id })
    .populate('userId', 'name email phone role')
    .populate('leaveRequests.approvedBy', 'name')
    .populate('feedback.feedbackResponses.patientId', 'name')
    .populate('feedback.testimonials.patientId', 'name');

  if (!profile) {
    // Create a new profile if it doesn't exist
    profile = await DoctorProfile.create({
      userId: req.user._id,
      professional: {
        specialty: 'General Practitioner', // Default specialty
        consultationFee: 0
      },
      settings: {},
      metadata: {
        createdBy: req.user._id,
        updatedBy: req.user._id
      }
    });
    
    // Populate the new profile with user data
    profile = await DoctorProfile.findById(profile._id)
      .populate('userId', 'name email phone role');
  }

  res.json({
    success: true,
    data: profile
  });
});

// @desc    Update doctor profile
// @route   PUT /api/doctor/profile
// @access  Private (Doctor only)
const updateDoctorProfile = asyncHandler(async (req, res) => {
  const updates = req.body;
  
  // Remove fields that shouldn't be updated directly
  delete updates._id;
  delete updates.userId;
  delete updates.metadata;
  delete updates.feedback.averageRating;
  delete updates.feedback.totalRatings;
  
  const profile = await DoctorProfile.findOneAndUpdate(
    { userId: req.user._id },
    { 
      ...updates,
      'metadata.updatedAt': new Date(),
      'metadata.updatedBy': req.user._id
    },
    { new: true, runValidators: true }
  )
    .populate('userId', 'name email phone role')
    .populate('leaveRequests.approvedBy', 'name')
    .populate('feedback.feedbackResponses.patientId', 'name')
    .populate('feedback.testimonials.patientId', 'name');

  if (!profile) {
    res.status(404);
    throw new Error('Doctor profile not found');
  }

  res.json({
    success: true,
    data: profile
  });
});

// @desc    Update doctor settings
// @route   PUT /api/doctor/profile/settings
// @access  Private (Doctor only)
const updateDoctorSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  
  if (!settings) {
    res.status(400);
    throw new Error('Settings are required');
  }
  
  const profile = await DoctorProfile.findOneAndUpdate(
    { userId: req.user._id },
    { 
      'settings': settings,
      'metadata.updatedAt': new Date(),
      'metadata.updatedBy': req.user._id
    },
    { new: true, runValidators: true }
  );

  if (!profile) {
    res.status(404);
    throw new Error('Doctor profile not found');
  }

  res.json({
    success: true,
    data: profile.settings
  });
});

// @desc    Add or update availability slot
// @route   POST /api/doctor/availability/slots
// @access  Private (Doctor only)
const addOrUpdateAvailabilitySlot = asyncHandler(async (req, res) => {
  const { day, startTime, endTime, isRecurring, maxAppointments, appointmentDuration, breakTime } = req.body;
  
  if (!day || !startTime || !endTime) {
    res.status(400);
    throw new Error('Day, start time, and end time are required');
  }
  
  const profile = await DoctorProfile.findOne({ userId: req.user._id });
  
  if (!profile) {
    res.status(404);
    throw new Error('Doctor profile not found');
  }
  
  // Check for overlapping slots
  const overlappingSlot = profile.availability.slots.find(slot => 
    slot.day === day && 
    ((startTime >= slot.startTime && startTime < slot.endTime) ||
     (endTime > slot.startTime && endTime <= slot.endTime) ||
     (startTime <= slot.startTime && endTime >= slot.endTime))
  );
  
  if (overlappingSlot) {
    res.status(400);
    throw new Error('This time slot overlaps with an existing slot');
  }
  
  // Add new slot
  const newSlot = {
    day,
    startTime,
    endTime,
    isRecurring: isRecurring !== undefined ? isRecurring : true,
    maxAppointments: maxAppointments || 1,
    appointmentDuration: appointmentDuration || 30,
    breakTime
  };
  
  profile.availability.slots.push(newSlot);
  profile.metadata.updatedAt = new Date();
  profile.metadata.updatedBy = req.user._id;
  
  await profile.save();
  
  res.status(201).json({
    success: true,
    data: profile.availability.slots[profile.availability.slots.length - 1]
  });
});

// @desc    Remove availability slot
// @route   DELETE /api/doctor/availability/slots/:slotId
// @access  Private (Doctor only)
const removeAvailabilitySlot = asyncHandler(async (req, res) => {
  const { slotId } = req.params;
  
  const profile = await DoctorProfile.findOne({ userId: req.user._id });
  
  if (!profile) {
    res.status(404);
    throw new Error('Doctor profile not found');
  }
  
  const slotIndex = profile.availability.slots.findIndex(slot => slot._id.toString() === slotId);
  
  if (slotIndex === -1) {
    res.status(404);
    throw new Error('Slot not found');
  }
  
  profile.availability.slots.splice(slotIndex, 1);
  profile.metadata.updatedAt = new Date();
  profile.metadata.updatedBy = req.user._id;
  
  await profile.save();
  
  res.json({
    success: true,
    message: 'Slot removed successfully'
  });
});

// @desc    Request leave
// @route   POST /api/doctor/leave-requests
// @access  Private (Doctor only)
const requestLeave = asyncHandler(async (req, res) => {
  const { startDate, endDate, reason, type, notes } = req.body;
  
  if (!startDate || !endDate || !reason || !type) {
    res.status(400);
    throw new Error('Start date, end date, reason, and type are required');
  }
  
  const profile = await DoctorProfile.findOne({ userId: req.user._id });
  
  if (!profile) {
    res.status(404);
    throw new Error('Doctor profile not found');
  }
  
  // Check for overlapping leave requests
  const overlappingLeave = profile.leaveRequests.find(leave => 
    (new Date(startDate) <= new Date(leave.endDate) && 
     new Date(endDate) >= new Date(leave.startDate) &&
     leave.status !== 'rejected' &&
     leave.status !== 'cancelled')
  );
  
  if (overlappingLeave) {
    res.status(400);
    throw new Error('You already have a leave request for this period');
  }
  
  const leaveRequest = {
    startDate,
    endDate,
    reason,
    type,
    notes,
    status: 'pending',
    requestedAt: new Date()
  };
  
  profile.leaveRequests.push(leaveRequest);
  profile.metadata.updatedAt = new Date();
  profile.metadata.updatedBy = req.user._id;
  
  await profile.save();
  
  // Notify admin about the leave request
  await Notification.create({
    recipient: 'admin', // This should be the admin's ID or a role-based lookup
    sender: req.user._id,
    type: 'leave_request',
    title: 'New Leave Request',
    message: `Dr. ${req.user.name} has requested leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
    metadata: {
      leaveRequestId: profile.leaveRequests[profile.leaveRequests.length - 1]._id,
      doctorId: req.user._id,
      startDate,
      endDate
    },
    priority: 'high'
  });
  
  res.status(201).json({
    success: true,
    data: profile.leaveRequests[profile.leaveRequests.length - 1]
  });
});

// @desc    Update leave request status
// @route   PUT /api/doctor/leave-requests/:leaveId/status
// @access  Private (Admin only)
const updateLeaveRequestStatus = asyncHandler(async (req, res) => {
  const { leaveId } = req.params;
  const { status, rejectionReason } = req.body;
  
  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }
  
  if (status === 'rejected' && !rejectionReason) {
    res.status(400);
    throw new Error('Rejection reason is required when rejecting a leave request');
  }
  
  const profile = await DoctorProfile.findOne({ 'leaveRequests._id': leaveId });
  
  if (!profile) {
    res.status(404);
    throw new Error('Leave request not found');
  }
  
  const leaveRequest = profile.leaveRequests.id(leaveId);
  
  if (!leaveRequest) {
    res.status(404);
    throw new Error('Leave request not found');
  }
  
  // Only allow status transitions that make sense
  if (leaveRequest.status === 'approved' && status !== 'cancelled') {
    res.status(400);
    throw new Error('Cannot change status of an approved leave request');
  }
  
  if (leaveRequest.status === 'rejected' && status !== 'cancelled') {
    res.status(400);
    throw new Error('Cannot change status of a rejected leave request');
  }
  
  // Update leave request
  leaveRequest.status = status;
  
  if (status === 'approved') {
    leaveRequest.approvedBy = req.user._id;
    leaveRequest.approvedAt = new Date();
  } else if (status === 'rejected') {
    leaveRequest.rejectionReason = rejectionReason;
  }
  
  profile.metadata.updatedAt = new Date();
  profile.metadata.updatedBy = req.user._id;
  
  await profile.save();
  
  // Notify the doctor about the status update
  await Notification.create({
    recipient: profile.userId,
    sender: req.user._id,
    type: 'leave_request_update',
    title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your leave request from ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()} has been ${status}.`,
    metadata: {
      leaveRequestId: leaveRequest._id,
      status,
      rejectionReason: rejectionReason || null
    },
    priority: 'high'
  });
  
  res.json({
    success: true,
    data: leaveRequest
  });
});

// @desc    Get available time slots
// @route   GET /api/doctor/availability/slots
// @access  Public
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date, duration = 30 } = req.query;
  
  if (!doctorId || !date) {
    res.status(400);
    throw new Error('Doctor ID and date are required');
  }
  
  const profile = await DoctorProfile.findOne({ userId: doctorId });
  
  if (!profile) {
    res.status(404);
    throw new Error('Doctor profile not found');
  }
  
  const slots = await profile.getAvailableSlots(date, parseInt(duration));
  
  res.json({
    success: true,
    data: slots
  });
});

// @desc    Submit feedback
// @route   POST /api/doctor/feedback
// @access  Private (Patient only)
const submitFeedback = asyncHandler(async (req, res) => {
  const { doctorId, rating, comment, appointmentId, isAnonymous } = req.body;
  
  if (!doctorId || !rating) {
    res.status(400);
    throw new Error('Doctor ID and rating are required');
  }
  
  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }
  
  const profile = await DoctorProfile.findOne({ userId: doctorId });
  
  if (!profile) {
    res.status(404);
    throw new Error('Doctor profile not found');
  }
  
  // Check if feedback already exists for this appointment
  if (appointmentId) {
    const existingFeedback = profile.feedback.feedbackResponses.find(
      f => f.appointmentId?.toString() === appointmentId
    );
    
    if (existingFeedback) {
      res.status(400);
      throw new Error('Feedback already submitted for this appointment');
    }
  }
  
  const feedback = {
    patientId: isAnonymous ? null : req.user._id,
    rating,
    comment: comment || '',
    appointmentId: appointmentId || null,
    isAnonymous: !!isAnonymous,
    responseDate: new Date()
  };
  
  profile.feedback.feedbackResponses.push(feedback);
  
  // Update average rating
  const ratings = profile.feedback.feedbackResponses.map(f => f.rating);
  profile.feedback.averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  profile.feedback.totalRatings = ratings.length;
  
  profile.metadata.updatedAt = new Date();
  profile.metadata.updatedBy = req.user._id;
  
  await profile.save();
  
  // Notify the doctor about the new feedback
  if (!isAnonymous) {
    await Notification.create({
      recipient: doctorId,
      sender: req.user._id,
      type: 'new_feedback',
      title: 'New Feedback Received',
      message: `You have received new ${rating}-star feedback from a patient.`,
      metadata: {
        feedbackId: profile.feedback.feedbackResponses[profile.feedback.feedbackResponses.length - 1]._id,
        rating,
        appointmentId: appointmentId || null
      },
      priority: 'medium'
    });
  }
  
  res.status(201).json({
    success: true,
    data: feedback
  });
});

// Apply authentication middleware to protected routes
router.use(protect);

// Profile routes
router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);
router.put('/profile/settings', updateDoctorSettings);

// Availability routes
router.post('/availability/slots', addOrUpdateAvailabilitySlot);
router.delete('/availability/slots/:slotId', removeAvailabilitySlot);
router.get('/availability/slots', getAvailableSlots);

// Leave requests routes
router.post('/leave-requests', requestLeave);
router.put('/leave-requests/:leaveId/status', updateLeaveRequestStatus);

// Feedback routes
router.post('/feedback', submitFeedback);

export default router;
