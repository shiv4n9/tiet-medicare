import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import Prescription from '../models/Prescription.js';
import Medication from '../models/Medication.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @desc    Get all prescriptions
// @route   GET /api/doctor/prescriptions
// @access  Private (Doctor only)
const getPrescriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, patientId, status } = req.query;
  
  const query = { doctorId: req.user._id };
  if (patientId) query.patientId = patientId;
  if (status) query.status = status;

  const prescriptions = await Prescription.find(query)
    .populate('patientId', 'name age gender')
    .populate('medications.medicationId', 'name strength form')
    .sort({ prescribedDate: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Prescription.countDocuments(query);

  res.json({
    success: true,
    data: prescriptions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Create new prescription
// @route   POST /api/doctor/prescriptions
// @access  Private (Doctor only)
const createPrescription = asyncHandler(async (req, res) => {
  const { patientId, medications, instructions, refillInfo } = req.body;

  // Validate medications
  if (!medications || !Array.isArray(medications) || medications.length === 0) {
    res.status(400);
    throw new Error('At least one medication is required');
  }

  // Check if all medication IDs exist
  const medicationIds = medications.map(m => m.medicationId);
  const existingMeds = await Medication.find({ _id: { $in: medicationIds } });
  
  if (existingMeds.length !== medicationIds.length) {
    res.status(400);
    throw new Error('One or more medications not found');
  }

  const prescription = await Prescription.create({
    patientId,
    doctorId: req.user._id,
    medications: medications.map(med => ({
      medicationId: med.medicationId,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions || '',
      quantity: med.quantity
    })),
    instructions,
    refillInfo: {
      allowed: refillInfo?.allowed || false,
      quantity: refillInfo?.quantity || 0,
      duration: refillInfo?.duration || 0 // in days
    },
    status: 'active'
  });

  // Create notification for patient
  await Notification.create({
    recipientId: patientId,
    senderId: req.user._id,
    type: 'prescription_ready',
    title: 'New Prescription Available',
    message: 'A new prescription has been prescribed to you.',
    metadata: {
      prescriptionId: prescription._id,
      doctorId: req.user._id
    },
    priority: 'high'
  });

  res.status(201).json({
    success: true,
    data: await prescription.populate('patientId', 'name age gender')
      .populate('medications.medicationId', 'name strength form')
  });
});

// @desc    Get all medications
// @route   GET /api/doctor/medications
// @access  Private (Doctor only)
const getMedications = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  const medications = await Medication.find(query)
    .sort({ name: 1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Medication.countDocuments(query);

  res.json({
    success: true,
    data: medications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get refill requests
// @route   GET /api/doctor/refill-requests
// @access  Private (Doctor only)
const getRefillRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const query = { 
    doctorId: req.user._id,
    'refillRequests.0': { $exists: true }
  };
  
  if (status) {
    query['refillRequests.status'] = status;
  }

  const prescriptions = await Prescription.find(query)
    .populate('patientId', 'name email')
    .populate('refillRequests.requestedBy', 'name')
    .sort({ 'refillRequests.requestedAt': -1 });

  // Flatten the refill requests for easier frontend consumption
  const refillRequests = prescriptions.reduce((acc, prescription) => {
    const requests = prescription.refillRequests.map(request => ({
      _id: request._id,
      prescriptionId: prescription._id,
      patient: prescription.patientId,
      medication: prescription.medications[0], // Assuming one medication per prescription for simplicity
      requestedBy: request.requestedBy,
      requestedAt: request.requestedAt,
      status: request.status,
      reason: request.reason
    }));
    return [...acc, ...requests];
  }, []);

  // Apply pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedRequests = refillRequests.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedRequests,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: refillRequests.length,
      pages: Math.ceil(refillRequests.length / parseInt(limit))
    }
  });
});

// @desc    Approve refill request
// @route   PUT /api/doctor/prescriptions/:id/approve-refill
// @access  Private (Doctor only)
const approveRefill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { refillId, quantity, duration } = req.body;

  const prescription = await Prescription.findOne({
    _id: id,
    doctorId: req.user._id,
    'refillRequests._id': refillId,
    'refillRequests.status': 'pending'
  });

  if (!prescription) {
    res.status(404);
    throw new Error('Prescription or refill request not found');
  }

  // Update the refill request status
  const refillRequest = prescription.refillRequests.id(refillId);
  refillRequest.status = 'approved';
  refillRequest.approvedAt = new Date();
  refillRequest.approvedBy = req.user._id;
  refillRequest.quantityApproved = quantity || refillRequest.quantityRequested;
  refillRequest.durationApproved = duration || refillRequest.durationRequested;

  // Update prescription refill info
  prescription.refillInfo = {
    allowed: true,
    quantity: quantity || prescription.refillInfo.quantity,
    duration: duration || prescription.refillInfo.duration,
    lastRefillDate: new Date()
  };

  await prescription.save();

  // Create notification for patient
  await Notification.create({
    recipientId: prescription.patientId,
    senderId: req.user._id,
    type: 'prescription_refill_approved',
    title: 'Refill Request Approved',
    message: `Your refill request for ${prescription.medications[0].name} has been approved.`,
    metadata: {
      prescriptionId: prescription._id,
      doctorId: req.user._id
    },
    priority: 'medium'
  });

  res.json({
    success: true,
    data: await Prescription.findById(prescription._id)
      .populate('patientId', 'name email')
      .populate('medications.medicationId', 'name strength form')
  });
});

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router.get('/', getPrescriptions);
router.post('/', createPrescription);
router.get('/medications', getMedications);
router.get('/refill-requests', getRefillRequests);
router.put('/:id/approve-refill', approveRefill);

export default router;
