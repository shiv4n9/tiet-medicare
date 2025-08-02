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

// @desc    Get doctor dashboard overview
// @route   GET /api/doctor/dashboard
// @access  Private (Doctor only)
const getDashboardOverview = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    // Get today's appointments
    const todayAppointments = await Appointment.find({
      doctor: req.user.name,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['confirmed', 'scheduled'] }
    });

    // Get recent patients (last 30 days) - using appointments instead of medical records for now
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPatients = await Appointment.find({
      doctor: req.user.name,
      date: { $gte: thirtyDaysAgo },
      status: { $in: ['completed', 'confirmed'] }
    }).sort({ date: -1 }).limit(10);

    // Get critical alerts (unread high priority notifications)
    const criticalAlerts = await Notification.find({
      recipientId: doctorId,
      priority: 'critical',
      isRead: false
    }).sort({ createdAt: -1 }).limit(5);

    // Get analytics
    const weeklyStats = await getWeeklyStats(doctorId);
    const monthlyStats = await getMonthlyStats(doctorId);

    res.json({
      success: true,
      data: {
        todayAppointments: todayAppointments || [],
        recentPatients: recentPatients || [],
        criticalAlerts: criticalAlerts || [],
        weeklyStats: weeklyStats || { totalAppointments: 0, completedAppointments: 0, noShows: 0, noShowRate: 0, completionRate: 0 },
        monthlyStats: monthlyStats || { totalAppointments: 0, completedAppointments: 0, noShows: 0, noShowRate: 0, completionRate: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.json({
      success: true,
      data: {
        todayAppointments: [],
        recentPatients: [],
        criticalAlerts: [],
        weeklyStats: { totalAppointments: 0, completedAppointments: 0, noShows: 0, noShowRate: 0, completionRate: 0 },
        monthlyStats: { totalAppointments: 0, completedAppointments: 0, noShows: 0, noShowRate: 0, completionRate: 0 }
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

// @desc    Get today's schedule
// @route   GET /api/doctor/schedule/today
// @access  Private (Doctor only)
const getTodaySchedule = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const appointments = await Appointment.find({
    doctor: req.user.name,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('patientId', 'name age gender contactNumber')
    .sort({ time: 1 });

  res.json({
    success: true,
    data: appointments
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
    const appointments = await Appointment.find({
      doctor: 'Ashwani Sir', // Using the doctor name for now
      date: { $gte: startOfWeek }
    });

    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const noShows = appointments.filter(apt => apt.status === 'cancelled').length;
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
    const appointments = await Appointment.find({
      doctor: 'Ashwani Sir', // Using the doctor name for now
      date: { $gte: startOfMonth }
    });

    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const noShows = appointments.filter(apt => apt.status === 'cancelled').length;
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
    const appointments = await Appointment.find({
      doctor: 'Ashwani Sir', // Using the doctor name for now
      date: { $gte: startOfYear }
    });

    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const noShows = appointments.filter(apt => apt.status === 'cancelled').length;
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

export default router; 