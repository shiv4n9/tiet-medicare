import express from 'express';
import User from '../models/User.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
  next();
};

// Get all users (admin only)
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    // Get query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status !== undefined ? req.query.status === 'true' : undefined;

    // Build query
    const query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add role filter
    if (role) {
      query.role = role;
    }
    
    // Add status filter
    if (status !== undefined) {
      query.isActive = status;
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching users' 
    });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', protect, isAdmin, async (req, res) => {
  try {
    const { role, specialization } = req.body;
    const { id } = req.params;
    
    // Validate role
    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be one of: patient, doctor, admin' 
      });
    }
    
    // For doctors, ensure specialization is provided
    if (role === 'doctor' && !specialization) {
      return res.status(400).json({ 
        success: false, 
        message: 'Specialization is required for doctor role' 
      });
    }
    
    // Prepare update object
    const updateData = { role };
    if (role === 'doctor') {
      updateData.specialization = specialization;
    } else {
      // Clear specialization if role is not doctor
      updateData.specialization = undefined;
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating user role' 
    });
  }
});

// Toggle user active status (admin only)
router.put('/users/:id/status', protect, isAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const { id } = req.params;
    
    // Update user status
    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while toggling user status' 
    });
  }
});

// Get user statistics (admin only)
router.get('/stats/users', protect, isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      doctors,
      patients,
      admins,
      newUsersLast7Days,
      newUsersLast30Days
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'doctor', isActive: true }),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ 
        createdAt: { 
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
        } 
      }),
      User.countDocuments({ 
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
        } 
      })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        doctors,
        patients,
        admins,
        newUsersLast7Days,
        newUsersLast30Days
      }
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching user statistics' 
    });
  }
});

export default router;
