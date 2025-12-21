import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import Prescription from '../models/Prescription.js';
import LabOrder from '../models/LabOrder.js';
import Referral from '../models/Referral.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// @desc    Get aggregated patient dashboard data
// @route   GET /api/patients/:id/dashboard
// @access  Private (Patient only)
router.get('/:id/dashboard', protect, asyncHandler(async (req, res) => {
  const patientId = req.params.id;

  // Verify authorization
  if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
    res.status(403);
    throw new Error('Not authorized to view this dashboard');
  }

  // Fetch all data in parallel for better performance
  const [prescriptions, labOrders, referrals, medicalRecords, appointments] = await Promise.all([
    Prescription.find({ patientId })
      .populate('doctorId', 'name specialization')
      .populate('medications.medicationId')
      .sort({ createdAt: -1 })
      .limit(10),
    
    LabOrder.find({ patientId })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(10),
    
    Referral.find({ patientId })
      .populate('referringDoctorId', 'name specialization')
      .populate('referredToDoctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(10),
    
    MedicalRecord.find({ patientId })
      .populate('doctorId', 'name specialization')
      .sort({ visitDate: -1 })
      .limit(10),
    
    Appointment.find({ patientId })
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 })
      .limit(10)
  ]);

  // Generate health insights based on recent data
  const healthInsights = [];

  // Check for active prescriptions
  const activePrescriptions = prescriptions.filter(p => p.status === 'active');
  if (activePrescriptions.length > 0) {
    healthInsights.push({
      type: 'info',
      title: 'Active Medications',
      message: `You have ${activePrescriptions.length} active prescription${activePrescriptions.length > 1 ? 's' : ''}. Remember to take your medications as prescribed.`,
      icon: 'pill'
    });
  }

  // Check for pending lab results
  const pendingLabs = labOrders.filter(l => l.status === 'ordered' || l.status === 'in-progress');
  if (pendingLabs.length > 0) {
    healthInsights.push({
      type: 'warning',
      title: 'Pending Lab Results',
      message: `You have ${pendingLabs.length} lab test${pendingLabs.length > 1 ? 's' : ''} pending. Results will be available soon.`,
      icon: 'activity'
    });
  }

  // Check for upcoming appointments
  const upcomingAppointments = appointments.filter(a => {
    const aptDate = new Date(a.date);
    const today = new Date();
    return aptDate >= today && (a.status === 'scheduled' || a.status === 'confirmed');
  });

  if (upcomingAppointments.length > 0) {
    const nextAppointment = upcomingAppointments[0];
    healthInsights.push({
      type: 'success',
      title: 'Upcoming Appointment',
      message: `Your next appointment is on ${new Date(nextAppointment.date).toLocaleDateString()} at ${nextAppointment.time} with Dr. ${nextAppointment.doctor || 'TBD'}.`,
      icon: 'calendar'
    });
  }

  // Check for abnormal lab results
  const abnormalLabs = labOrders.filter(l => 
    l.tests.some(t => t.result?.abnormalFlag && t.result.abnormalFlag !== 'normal')
  );

  if (abnormalLabs.length > 0) {
    healthInsights.push({
      type: 'alert',
      title: 'Attention Required',
      message: 'Some of your recent lab results require attention. Please consult with your doctor.',
      icon: 'alert-triangle'
    });
  } else if (labOrders.filter(l => l.status === 'completed').length > 0) {
    healthInsights.push({
      type: 'success',
      title: 'All Clear',
      message: 'Your recent lab results are within normal range. Keep up the good work!',
      icon: 'check-circle'
    });
  }

  // Aggregate response
  res.json({
    success: true,
    data: {
      prescriptions: {
        active: activePrescriptions,
        all: prescriptions,
        count: {
          active: activePrescriptions.length,
          total: prescriptions.length
        }
      },
      labOrders: {
        pending: pendingLabs,
        all: labOrders,
        count: {
          pending: pendingLabs.length,
          total: labOrders.length
        }
      },
      referrals: {
        active: referrals.filter(r => r.status === 'pending' || r.status === 'accepted'),
        all: referrals,
        count: {
          active: referrals.filter(r => r.status === 'pending' || r.status === 'accepted').length,
          total: referrals.length
        }
      },
      medicalRecords: {
        recent: medicalRecords,
        count: medicalRecords.length
      },
      appointments: {
        upcoming: upcomingAppointments,
        all: appointments,
        count: {
          upcoming: upcomingAppointments.length,
          total: appointments.length
        }
      },
      healthInsights,
      lastUpdated: new Date()
    }
  });
}));

export default router;
