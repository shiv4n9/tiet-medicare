import express from 'express';
import asyncHandler from 'express-async-handler';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Prescription from '../models/Prescription.js';
import LabTest from '../models/LabTest.js';
import Referral from '../models/Referral.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to check if user is a patient or has access to patient data
const isPatientOrAuthorized = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'doctor') {
    return next();
  }
  if (req.user.role === 'patient') {
    return next();
  }
  res.status(403);
  throw new Error('Access denied');
});

// @desc    Get patient dashboard overview
// @route   GET /api/patients/dashboard
// @access  Private (Patient)
const getPatientDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userEmail = req.user.email;

  try {
    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patientEmail: userEmail,
      date: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed', 'pending'] }
    }).sort({ date: 1 }).limit(5);

    // Get recent medical records
    const recentRecords = await MedicalRecord.find({
      patientEmail: userEmail
    }).sort({ visitDate: -1 }).limit(5);

    // Get active prescriptions
    const activePrescriptions = await Prescription.find({
      patientEmail: userEmail,
      status: 'active'
    }).sort({ createdAt: -1 });

    // Get pending lab results
    const pendingLabResults = await LabTest.find({
      patientEmail: userEmail,
      status: 'pending'
    }).sort({ orderDate: -1 });

    // Get notifications
    const notifications = await Notification.find({
      recipientId: userId,
      isRead: false
    }).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        upcomingAppointments: upcomingAppointments || [],
        recentRecords: recentRecords || [],
        activePrescriptions: activePrescriptions || [],
        pendingLabResults: pendingLabResults || [],
        notifications: notifications || []
      }
    });
  } catch (error) {
    console.error('Error fetching patient dashboard:', error);
    res.json({
      success: true,
      data: {
        upcomingAppointments: [],
        recentRecords: [],
        activePrescriptions: [],
        pendingLabResults: [],
        notifications: []
      }
    });
  }
});

// @desc    Get patient appointments
// @route   GET /api/patients/appointments
// @access  Private (Patient)
const getPatientAppointments = asyncHandler(async (req, res) => {
  const userEmail = req.user.email;

  const appointments = await Appointment.find({
    patientEmail: userEmail
  }).sort({ date: -1 });

  // Transform appointments to match frontend interface
  const transformedAppointments = appointments.map(apt => ({
    _id: apt._id,
    doctorName: apt.doctor || 'Unknown Doctor',
    doctorId: apt.doctorId || null,
    department: apt.department || apt.service || 'General',
    date: apt.date || apt.appointmentDate,
    time: apt.time || apt.appointmentTime || '00:00',
    status: apt.status || 'pending',
    type: apt.type || 'consultation',
    cancellationReason: apt.cancellationReason || null
  }));

  res.json({
    success: true,
    data: transformedAppointments
  });
});

// @desc    Get patient medical records
// @route   GET /api/patients/medical-records
// @access  Private (Patient)
const getPatientMedicalRecords = asyncHandler(async (req, res) => {
  const userEmail = req.user.email;
  const userId = req.user._id;

  try {
    console.log('📋 Fetching medical records for patient:', { userId, userEmail });
    
    // Search by both patientId OR patientEmail
    const records = await MedicalRecord.find({
      $or: [
        { patientId: userId },
        { patientEmail: userEmail }
      ]
    })
    .populate('doctorId', 'name specialization department')
    .populate('appointmentId', 'date time service')
    .sort({ visitDate: -1 });

    console.log(`📋 Found ${records.length} medical records`);

    // Transform records to match frontend interface with consultation details
    const transformedRecords = records.map(record => {
      // Format diagnosis - handle both array and string formats
      let diagnosisText = '';
      if (Array.isArray(record.diagnosis) && record.diagnosis.length > 0) {
        diagnosisText = record.diagnosis
          .filter(d => d && d.condition)
          .map(d => `${d.condition}${d.severity ? ` (${d.severity})` : ''}`)
          .join(', ');
      }
      if (!diagnosisText) {
        diagnosisText = record.chiefComplaint || 'General Consultation';
      }

      return {
        _id: record._id,
        doctorName: record.doctorId?.name || 'Unknown Doctor',
        doctorSpecialization: record.doctorId?.specialization || 'General Medicine',
        doctorDepartment: record.doctorId?.department || 'General',
        date: record.visitDate || record.createdAt,
        time: record.appointmentId?.time || new Date(record.visitDate || record.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        diagnosis: diagnosisText,
        treatment: record.treatmentPlan || 'Follow-up as needed',
        notes: record.notes || '',
        chiefComplaint: record.chiefComplaint || '',
        prescriptions: record.prescriptions || [],
        labOrders: record.labOrders || [],
        referrals: record.referrals || [],
        vitalSigns: record.vitalSigns || {},
        followUp: record.followUp || {},
        consultationType: record.appointmentId?.service || record.chiefComplaint || 'Consultation',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };
    });

    res.json({
      success: true,
      data: transformedRecords
    });
  } catch (error) {
    console.error('Error fetching patient medical records:', error);
    res.json({
      success: true,
      data: []
    });
  }
});

// @desc    Get patient prescriptions
// @route   GET /api/patients/prescriptions
// @access  Private (Patient)
const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const userEmail = req.user.email;

  const prescriptions = await Prescription.find({
    patientEmail: userEmail
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: prescriptions || []
  });
});

// @desc    Get patient lab results
// @route   GET /api/patients/lab-results
// @access  Private (Patient)
const getPatientLabResults = asyncHandler(async (req, res) => {
  const userEmail = req.user.email;

  const labResults = await LabTest.find({
    patientEmail: userEmail
  }).sort({ orderDate: -1 });

  // Transform lab results to match frontend interface
  const transformedResults = labResults.map(result => ({
    _id: result._id,
    testName: result.testName || result.name || 'Unknown Test',
    result: result.result || 'Pending',
    normalRange: result.normalRange || 'N/A',
    date: result.orderDate || result.createdAt,
    status: result.status || 'pending'
  }));

  res.json({
    success: true,
    data: transformedResults
  });
});

// @desc    Get patient referrals
// @route   GET /api/patients/referrals
// @access  Private (Patient)
const getPatientReferrals = asyncHandler(async (req, res) => {
  const userEmail = req.user.email;
  const userId = req.user._id;

  try {
    // Try to find referrals by patientId first (if user has _id)
    let referrals = [];
    
    if (userId) {
      referrals = await Referral.find({
        patientId: userId
      })
      .populate('referringDoctorId', 'name specialization')
      .populate('referredToDoctorId', 'name specialization')
      .sort({ createdAt: -1 });
    }

    // If no referrals found by patientId, try by email (fallback for legacy data)
    if (referrals.length === 0) {
      referrals = await Referral.find({
        patientEmail: userEmail
      })
      .populate('referringDoctorId', 'name specialization')
      .populate('referredToDoctorId', 'name specialization')
      .sort({ createdAt: -1 });
    }

    // Transform referrals to match frontend interface
    const transformedReferrals = referrals.map(referral => ({
      _id: referral._id,
      doctorName: referral.referringDoctorId?.name || 'Unknown Doctor',
      specialistName: referral.referredToDoctorId?.name || referral.referredToFacility?.name || 'Specialist',
      reason: referral.reasonForReferral || 'General consultation',
      priority: referral.priority || 'routine',
      status: referral.status || 'pending',
      date: referral.createdAt,
      facility: referral.referredToFacility?.name || 'External Facility'
    }));

    res.json({
      success: true,
      data: transformedReferrals
    });
  } catch (error) {
    console.error('Error fetching patient referrals:', error);
    res.json({
      success: true,
      data: []
    });
  }
});

// @desc    Get patient notifications
// @route   GET /api/patients/notifications
// @access  Private (Patient)
const getPatientNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.find({
    recipientId: userId
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: notifications || []
  });
});

// Protected routes
router.use(protect);
router.get('/dashboard', isPatientOrAuthorized, getPatientDashboard);
router.get('/appointments', isPatientOrAuthorized, getPatientAppointments);
router.get('/medical-records', isPatientOrAuthorized, getPatientMedicalRecords);
router.get('/prescriptions', isPatientOrAuthorized, getPatientPrescriptions);
router.get('/lab-results', isPatientOrAuthorized, getPatientLabResults);
router.get('/referrals', isPatientOrAuthorized, getPatientReferrals);
router.get('/notifications', isPatientOrAuthorized, getPatientNotifications);

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, age, symptoms } = req.body;

    // Basic validation
    if (!name || !age || !symptoms) {
      res.status(400);
      throw new Error('Please include all required fields');
    }

    const patient = new Patient({
      name,
      age,
      symptoms
    });

    const createdPatient = await patient.save();
    res.status(201).json(createdPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all patients
// @route   GET /api/patients
// @access  Public
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (patient) {
      res.json(patient);
    } else {
      res.status(404);
      throw new Error('Patient not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a patient
// @route   PUT /api/patients/:id
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { name, age, symptoms } = req.body;

    const patient = await Patient.findById(req.params.id);

    if (patient) {
      patient.name = name || patient.name;
      patient.age = age || patient.age;
      patient.symptoms = symptoms || patient.symptoms;

      const updatedPatient = await patient.save();
      res.json(updatedPatient);
    } else {
      res.status(404);
      throw new Error('Patient not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a patient
// @route   DELETE /api/patients/:id
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
      await patient.remove();
      res.json({ message: 'Patient removed' });
    } else {
      res.status(404);
      throw new Error('Patient not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
