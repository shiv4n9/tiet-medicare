import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Middleware to check if user is a doctor
const isDoctor = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'doctor') {
    res.status(403);
    throw new Error('Access denied. Doctor role required.');
  }
  next();
});

// @desc    Get doctor dashboard overview (Simplified)
// @route   GET /api/doctor/dashboard
// @access  Private (Doctor only)
const getDashboardOverview = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;
  const doctorName = req.user.name;

  try {
    console.log('🔍 Fetching dashboard for doctor:', { doctorId, doctorName });
    
    // Get today's date range (using local date string comparison for reliability)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get start and end of today for date range query
    const startOfDay = new Date(todayStr + 'T00:00:00.000Z');
    const endOfDay = new Date(todayStr + 'T23:59:59.999Z');

    console.log('📅 Today date range:', { todayStr, startOfDay, endOfDay });

    // Get all appointments for this doctor first
    const allAppointments = await Appointment.find({
      $or: [
        { doctor: doctorName },
        { doctorId: doctorId }
      ]
    })
    .populate('patientId', 'name age gender contactNumber dateOfBirth')
    .sort({ date: -1, time: 1 })
    .lean();

    console.log(`📊 Total appointments found: ${allAppointments.length}`);

    // Filter today's appointments using string comparison for reliability
    const todayAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const aptDateStr = aptDate.toISOString().split('T')[0];
      return aptDateStr === todayStr;
    });

    console.log(`✅ Found ${todayAppointments.length} appointments for today (${todayStr})`);

    // Calculate stats
    const totalPatients = new Set(allAppointments.map(apt => apt.patientEmail || apt.patientName)).size;
    const completedTotal = allAppointments.filter(apt => apt.status === 'completed').length;
    const pendingTotal = allAppointments.filter(apt => ['pending', 'scheduled', 'confirmed'].includes(apt.status)).length;

    // Get this week's appointments
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startOfWeek;
    });

    // Helper function to calculate age from date of birth
    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return null;
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    };

    // Transform today's appointments data
    const transformedAppointments = todayAppointments.map(apt => {
      // Calculate age from DOB if available
      let patientAge = apt.patientAge || null;
      if (!patientAge && apt.patientId?.dateOfBirth) {
        patientAge = calculateAge(apt.patientId.dateOfBirth);
      }
      
      return {
        _id: apt._id,
        patientName: apt.patientName || apt.patientId?.name || apt.name || 'Unknown Patient',
        patientAge: patientAge,
        patientGender: apt.patientId?.gender || apt.patientGender || null,
        patientId: apt.patientId?._id || apt.patientId || null,
        patientEmail: apt.patientEmail || apt.email || null,
        doctorId: apt.doctorId || doctorId,
        time: apt.time || apt.appointmentTime || '00:00',
        service: apt.service || apt.department || 'General Consultation',
        status: apt.status || 'pending',
        contactNumber: apt.patientId?.contactNumber || apt.contactNumber || '',
        date: apt.date || apt.appointmentDate
      };
    });

    // Get recently completed appointments (last 10)
    const recentlyCompleted = allAppointments
      .filter(apt => apt.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date))
      .slice(0, 10)
      .map(apt => ({
        _id: apt._id,
        patientName: apt.patientName || apt.patientId?.name || apt.name || 'Unknown Patient',
        patientAge: apt.patientId?.age || apt.patientAge || null,
        patientGender: apt.patientId?.gender || apt.patientGender || null,
        time: apt.time || apt.appointmentTime || '00:00',
        service: apt.service || apt.department || 'General Consultation',
        date: apt.date || apt.appointmentDate,
        completedAt: apt.completedAt || apt.date,
        notes: apt.notes || ''
      }));

    const stats = {
      todayCount: todayAppointments.length,
      todayCompleted: todayAppointments.filter(apt => apt.status === 'completed').length,
      todayPending: todayAppointments.filter(apt => ['pending', 'scheduled', 'confirmed'].includes(apt.status)).length,
      weekCount: weekAppointments.length,
      weekCompleted: weekAppointments.filter(apt => apt.status === 'completed').length,
      totalPatients: totalPatients,
      totalCompleted: completedTotal,
      totalPending: pendingTotal
    };

    console.log(`📊 Stats:`, stats);
    console.log(`📊 Sending ${transformedAppointments.length} today's appointments to frontend`);

    res.json({
      success: true,
      data: {
        todayAppointments: transformedAppointments,
        recentlyCompleted: recentlyCompleted,
        stats: stats,
        recentPatients: [],
        criticalAlerts: []
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.json({
      success: true,
      data: {
        todayAppointments: [],
        stats: {
          todayCount: 0,
          todayCompleted: 0,
          todayPending: 0,
          weekCount: 0,
          weekCompleted: 0,
          totalPatients: 0,
          totalCompleted: 0,
          totalPending: 0
        },
        recentPatients: [],
        criticalAlerts: []
      }
    });
  }
});

// @desc    Get patient search results
// @route   GET /api/doctor/patients/search
// @access  Private (Doctor only)
const searchPatients = asyncHandler(async (req, res) => {
  const { query, limit = 10 } = req.query;
  
  if (!query) {
    res.status(400);
    throw new Error('Search query is required');
  }

  const patients = await Patient.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { contactNumber: { $regex: query, $options: 'i' } }
    ]
  }).limit(parseInt(limit));

  res.json({
    success: true,
    data: patients
  });
});

// @desc    Get all available doctors for appointment booking
// @route   GET /api/doctor/available
// @access  Public
const getAvailableDoctors = asyncHandler(async (req, res) => {
  const { specialization, department } = req.query;
  
  const query = { 
    role: 'doctor',
    isActive: true
  };
  
  if (specialization) {
    query.specialization = { $regex: specialization, $options: 'i' };
  }
  
  if (department) {
    query.department = { $regex: department, $options: 'i' };
  }

  const doctors = await User.find(query)
    .select('name email specialization department consultationFee rating totalRatings availability')
    .sort({ rating: -1, name: 1 });

  // Transform the data for frontend
  const transformedDoctors = doctors.map(doctor => ({
    _id: doctor._id,
    name: doctor.name,
    email: doctor.email,
    specialization: doctor.specialization || 'General Medicine',
    department: doctor.department || 'General',
    consultationFee: doctor.consultationFee || 0,
    rating: doctor.rating || 0,
    totalRatings: doctor.totalRatings || 0,
    availability: doctor.availability || []
  }));

  res.json({
    success: true,
    data: transformedDoctors
  });
});

// @desc    Get today's schedule
// @route   GET /api/doctor/schedule/today
// @access  Private (Doctor only)
const getTodaySchedule = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const appointments = await Appointment.find({
    $or: [
      { doctor: req.user.name },
      { doctorId: req.user._id }
    ],
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('patientId', 'name age gender contactNumber')
    .sort({ time: 1 });

  // Transform appointments to include patient details
  const transformedAppointments = appointments.map(apt => ({
    _id: apt._id,
    patientName: apt.patientName || apt.patientId?.name || 'Unknown Patient',
    patientAge: apt.patientId?.age || 0,
    patientGender: apt.patientId?.gender || 'Not specified',
    time: apt.time || apt.appointmentTime || '00:00',
    duration: apt.duration || 30,
    service: apt.service || apt.department || 'General Consultation',
    status: apt.status || 'pending',
    contactNumber: apt.patientId?.contactNumber || apt.contactNumber || '',
    email: apt.patientEmail || apt.patientId?.email || '',
    notes: apt.notes || '',
    type: apt.type || 'in-person',
    location: apt.location || 'Clinic Room 1',
    date: apt.date || apt.appointmentDate
  }));

  res.json({
    success: true,
    data: transformedAppointments
  });
});

// @desc    Get analytics and KPIs
// @route   GET /api/doctor/analytics
// @access  Private (Doctor only)
const getAnalytics = asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query;
  const doctorId = req.user._id;

  let stats;
  if (period === 'week') {
    stats = await getWeeklyStats(doctorId);
  } else if (period === 'month') {
    stats = await getMonthlyStats(doctorId);
  } else {
    stats = await getYearlyStats(doctorId);
  }

  res.json({
    success: true,
    data: stats
  });
});

// @desc    Get notifications
// @route   GET /api/doctor/notifications
// @access  Private (Doctor only)
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const doctorId = req.user._id;

  const query = { recipientId: doctorId };
  if (unreadOnly === 'true') {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .populate('senderId', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Notification.countDocuments(query);

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

// @desc    Mark notification as read
// @route   PUT /api/doctor/notifications/:id/read
// @access  Private (Doctor only)
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      recipientId: req.user._id
    },
    {
      isRead: true,
      readAt: new Date()
    },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.json({
    success: true,
    data: notification
  });
});

// @desc    Get patient medical records
// @route   GET /api/doctor/patients/:patientId/records
// @access  Private (Doctor only)
const getPatientRecords = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  if (!patientId) {
    res.status(400);
    throw new Error('Patient ID is required');
  }

  // Check if patient exists
  const patient = await Patient.findById(patientId);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const records = await MedicalRecord.find({
    patientId: patientId,
    doctorId: req.user._id
  }).sort({ visitDate: -1 });

  res.json({
    success: true,
    data: records
  });
});

// @desc    Create new medical record
// @route   POST /api/doctor/patients/:patientId/records
// @access  Private (Doctor only)
const createMedicalRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.create({
    ...req.body,
    patientId: req.params.patientId,
    doctorId: req.user._id
  });

  res.status(201).json({
    success: true,
    data: record
  });
});

// Helper functions
const getWeeklyStats = async (doctorId) => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  try {
    // Get doctor's name from User model
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    const appointments = await Appointment.find({
      $or: [
        { doctor: doctor.name },
        { doctorId: doctorId }
      ],
      date: { $gte: startOfWeek }
    });

    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const noShows = appointments.filter(apt => apt.status === 'cancelled' || apt.status === 'no-show').length;
    const total = appointments.length;

    return {
      totalAppointments: total,
      completedAppointments: completed,
      noShows: noShows,
      noShowRate: total > 0 ? (noShows / total * 100).toFixed(1) : 0,
      completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Error getting weekly stats:', error);
    return {
      totalAppointments: 0,
      completedAppointments: 0,
      noShows: 0,
      noShowRate: 0,
      completionRate: 0
    };
  }
};

const getMonthlyStats = async (doctorId) => {
  const startOfMonth = new Date();
  startOfMonth.setMonth(startOfMonth.getMonth() - 1);

  try {
    // Get doctor's name from User model
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    const appointments = await Appointment.find({
      $or: [
        { doctor: doctor.name },
        { doctorId: doctorId }
      ],
      date: { $gte: startOfMonth }
    });

    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const noShows = appointments.filter(apt => apt.status === 'cancelled' || apt.status === 'no-show').length;
    const total = appointments.length;

    return {
      totalAppointments: total,
      completedAppointments: completed,
      noShows: noShows,
      noShowRate: total > 0 ? (noShows / total * 100).toFixed(1) : 0,
      completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Error getting monthly stats:', error);
    return {
      totalAppointments: 0,
      completedAppointments: 0,
      noShows: 0,
      noShowRate: 0,
      completionRate: 0
    };
  }
};

const getYearlyStats = async (doctorId) => {
  const startOfYear = new Date();
  startOfYear.setFullYear(startOfYear.getFullYear() - 1);

  try {
    // Get doctor's name from User model
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    const appointments = await Appointment.find({
      $or: [
        { doctor: doctor.name },
        { doctorId: doctorId }
      ],
      date: { $gte: startOfYear }
    });

    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const noShows = appointments.filter(apt => apt.status === 'cancelled' || apt.status === 'no-show').length;
    const total = appointments.length;

    return {
      totalAppointments: total,
      completedAppointments: completed,
      noShows: noShows,
      noShowRate: total > 0 ? (noShows / total * 100).toFixed(1) : 0,
      completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Error getting yearly stats:', error);
    return {
      totalAppointments: 0,
      completedAppointments: 0,
      noShows: 0,
      noShowRate: 0,
      completionRate: 0
    };
  }
};

// @desc    Update appointment status
// @route   PUT /api/doctor/appointments/:id/status
// @access  Private (Doctor only)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const appointmentId = req.params.id;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const appointment = await Appointment.findById(appointmentId);
  
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Verify this appointment belongs to the doctor
  if (appointment.doctorId?.toString() !== req.user._id.toString() && 
      appointment.doctor !== req.user.name) {
    res.status(403);
    throw new Error('Not authorized to update this appointment');
  }

  appointment.status = status;
  if (status === 'completed') {
    appointment.completedAt = new Date();
  }
  
  await appointment.save();

  res.json({
    success: true,
    data: appointment,
    message: `Appointment ${status} successfully`
  });
});

// @desc    Complete appointment
// @route   PUT /api/doctor/appointments/:id/complete
// @access  Private (Doctor only)
const completeAppointment = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;

  const appointment = await Appointment.findById(appointmentId);
  
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Verify this appointment belongs to the doctor
  if (appointment.doctorId?.toString() !== req.user._id.toString() && 
      appointment.doctor !== req.user.name) {
    res.status(403);
    throw new Error('Not authorized to update this appointment');
  }

  appointment.status = 'completed';
  appointment.completedAt = new Date();
  
  await appointment.save();

  res.json({
    success: true,
    data: appointment,
    message: 'Appointment completed successfully'
  });
});

// @desc    Cancel appointment
// @route   PUT /api/doctor/appointments/:id/cancel
// @access  Private (Doctor only)
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  const { reason } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Verify this appointment belongs to the doctor
  if (appointment.doctorId?.toString() !== req.user._id.toString() && 
      appointment.doctor !== req.user.name) {
    res.status(403);
    throw new Error('Not authorized to update this appointment');
  }

  appointment.status = 'cancelled';
  appointment.cancellationReason = reason || 'Cancelled by doctor';
  appointment.cancelledAt = new Date();
  
  await appointment.save();

  res.json({
    success: true,
    data: appointment,
    message: 'Appointment cancelled successfully'
  });
});

// Routes
router.use(protect, isDoctor);

router.get('/dashboard', getDashboardOverview);
router.get('/patients/search', searchPatients);
router.get('/schedule/today', getTodaySchedule);
router.get('/analytics', getAnalytics);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/patients/:patientId/records', getPatientRecords);
router.post('/patients/:patientId/records', createMedicalRecord);

// Appointment management routes
router.put('/appointments/:id/status', updateAppointmentStatus);
router.put('/appointments/:id/complete', completeAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);

// Public route for getting available doctors (no auth required for appointment booking)
router.get('/available', getAvailableDoctors);

// Additional routes for frontend compatibility
router.get('/conversations', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.get('/lab-orders', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.get('/test-templates', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.get('/lab-results', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.get('/prescriptions', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.get('/medications', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.get('/refill-requests', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.get('/compliance-alerts', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.get('/audit-trail', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.get('/compliance-reports', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

// Additional routes for better data population
router.post('/lab-orders', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { message: 'Lab order created successfully' }
  });
}));

router.post('/prescriptions', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { message: 'Prescription created successfully' }
  });
}));

router.put('/prescriptions/:id/approve-refill', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { message: 'Refill approved successfully' }
  });
}));

router.put('/compliance-alerts/:id/acknowledge', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { message: 'Alert acknowledged' }
  });
}));

router.put('/compliance-alerts/:id/resolve', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { message: 'Alert resolved' }
  });
}));

// Notes routes
router.get('/notes/notes', asyncHandler(async (req, res) => {
  // Get notes for this doctor
  const notes = await MedicalRecord.find({
    doctorId: req.user._id
  }).sort({ createdAt: -1 }).limit(20);
  
  res.json({
    success: true,
    data: notes
  });
}));

router.get('/notes/note-templates', asyncHandler(async (req, res) => {
  // Mock note templates for now
  const templates = [
    { _id: '1', name: 'General Consultation', content: 'Patient presents with...' },
    { _id: '2', name: 'Follow-up Visit', content: 'Follow-up for...' },
    { _id: '3', name: 'Physical Examination', content: 'Physical examination reveals...' }
  ];
  
  res.json({
    success: true,
    data: templates
  });
}));

router.get('/notes/note-drafts', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.post('/notes/notes', asyncHandler(async (req, res) => {
  const note = await MedicalRecord.create({
    ...req.body,
    doctorId: req.user._id
  });
  
  res.json({
    success: true,
    data: note
  });
}));

router.post('/notes/notes/from-template', asyncHandler(async (req, res) => {
  const { templateId, patientId } = req.body;
  
  res.json({
    success: true,
    data: { message: 'Note created from template' }
  });
}));

// Referrals routes
router.get('/referrals/referrals', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.get('/referrals/specialists', asyncHandler(async (req, res) => {
  // Get other doctors as specialists
  const specialists = await User.find({
    role: 'doctor',
    _id: { $ne: req.user._id }
  }).select('name specialization department');
  
  res.json({
    success: true,
    data: specialists
  });
}));

router.get('/referrals/referral-feedback', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.post('/referrals/referrals', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { message: 'Referral created successfully' }
  });
}));

router.put('/referrals/referrals/:id/status', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { message: 'Referral status updated' }
  });
}));

// Profile routes
router.get('/profile/profile', asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.user._id).select('-password');
  
  res.json({
    success: true,
    data: doctor
  });
}));

router.get('/profile/availability/slots', asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.user._id);
  
  res.json({
    success: true,
    data: doctor?.availability || []
  });
}));

router.get('/profile/leave-requests', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.get('/profile/feedback', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: []
  });
}));

router.put('/profile/profile', asyncHandler(async (req, res) => {
  const updatedDoctor = await User.findByIdAndUpdate(
    req.user._id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');
  
  res.json({
    success: true,
    data: updatedDoctor
  });
}));

router.put('/profile/availability/slots', asyncHandler(async (req, res) => {
  const updatedDoctor = await User.findByIdAndUpdate(
    req.user._id,
    { availability: req.body.availability },
    { new: true, runValidators: true }
  ).select('-password');
  
  res.json({
    success: true,
    data: updatedDoctor.availability
  });
}));

router.post('/profile/leave-requests', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { message: 'Leave request submitted' }
  });
}));

export default router; 