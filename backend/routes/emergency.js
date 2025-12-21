import express from 'express';
import jwt from 'jsonwebtoken';
import Emergency from '../models/Emergency.js';
import { sendEmergencySOS, sendSMS } from '../services/smsService.js';
import User from '../models/User.js';

const router = express.Router();

// Function to get emergency contacts (reads env vars at runtime)
const getEmergencyContacts = () => {
  const contacts = [
    process.env.EMERGENCY_CONTACT_1,
    process.env.EMERGENCY_CONTACT_2,
  ].filter(Boolean);
  
  console.log('Emergency contacts configured:', contacts);
  return contacts;
};

// Optional auth middleware for this route
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.log('Optional auth failed:', error.message);
    }
  }
  next();
};

// Protect middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
};

/**
 * @route   POST /api/emergency/sos
 * @desc    Send emergency SOS alert
 * @access  Public (but captures user info if logged in)
 */
router.post('/sos', optionalAuth, async (req, res) => {
  try {
    const { location, emergencyType, description, additionalContacts } = req.body;

    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({
        success: false,
        message: 'Location is required for emergency SOS',
      });
    }

    // Get user info if authenticated
    const userName = req.user?.name || req.body.userName || 'Anonymous User';
    const userPhone = req.user?.phone || req.body.userPhone || '';
    const userEmail = req.user?.email || req.body.userEmail || '';

    // Combine default and additional contacts
    const defaultContacts = getEmergencyContacts();
    const emergencyContacts = [
      ...defaultContacts,
      ...(additionalContacts || []),
    ].filter(Boolean);

    console.log('Sending SOS to contacts:', emergencyContacts);

    // Create emergency record
    const emergency = new Emergency({
      user: req.user?._id,
      userName,
      userPhone,
      userEmail,
      location,
      emergencyType: emergencyType || 'medical',
      description,
      status: 'pending',
    });

    await emergency.save();

    // Send SMS alerts
    const smsResults = await sendEmergencySOS({
      userName,
      userPhone,
      location,
      emergencyType: emergencyType || 'Medical Emergency',
      emergencyContacts,
    });

    // Update emergency with notification results
    emergency.notifiedContacts = smsResults.map(result => ({
      phone: result.contact,
      notifiedAt: new Date(),
      status: result.success ? 'sent' : 'failed',
    }));
    await emergency.save();

    // Emit socket event for real-time dashboard updates
    if (req.app.get('io')) {
      req.app.get('io').emit('emergency:new', {
        id: emergency._id,
        userName,
        location,
        emergencyType,
        createdAt: emergency.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Emergency SOS sent successfully',
      data: {
        emergencyId: emergency._id,
        notificationsSent: smsResults.filter(r => r.success).length,
        notificationsFailed: smsResults.filter(r => !r.success).length,
      },
    });
  } catch (error) {
    console.error('Emergency SOS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send emergency SOS',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/emergency/active
 * @desc    Get all active emergencies (for admin dashboard)
 * @access  Private (Admin/Doctor)
 */
router.get('/active', protect, async (req, res) => {
  try {
    const emergencies = await Emergency.find({
      status: { $in: ['pending', 'acknowledged', 'dispatched'] },
    })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: emergencies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergencies',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/emergency/my
 * @desc    Get user's emergency history
 * @access  Private
 */
router.get('/my', protect, async (req, res) => {
  try {
    const emergencies = await Emergency.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: emergencies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency history',
      error: error.message,
    });
  }
});

/**
 * @route   PATCH /api/emergency/:id/status
 * @desc    Update emergency status
 * @access  Private (Admin/Doctor)
 */
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency not found',
      });
    }

    emergency.status = status;
    if (notes) emergency.notes = notes;

    if (status === 'acknowledged' || status === 'dispatched') {
      emergency.respondedBy = req.user._id;
      emergency.respondedAt = new Date();
    }

    if (status === 'resolved') {
      emergency.resolvedAt = new Date();
    }

    await emergency.save();

    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('emergency:updated', {
        id: emergency._id,
        status,
      });
    }

    res.json({
      success: true,
      message: 'Emergency status updated',
      data: emergency,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update emergency',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/emergency/test-sms
 * @desc    Test SMS sending (for development)
 * @access  Private
 */
router.post('/test-sms', protect, async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const result = await sendSMS(
      phoneNumber,
      message || 'Test message from TIET Medi-Care Emergency System'
    );

    res.json({
      success: result.success,
      message: result.success ? 'Test SMS sent' : 'Failed to send SMS',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test SMS',
      error: error.message,
    });
  }
});

export default router;
