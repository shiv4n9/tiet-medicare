import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, authorize } from '../middleware/authMiddleware.js';
import AuditLog from '../models/Audit.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get audit logs
// @route   GET /api/audit/logs
// @access  Private (Admin)
router.get('/logs', authorize('admin'), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 50, 
    action, 
    entity, 
    userId, 
    startDate, 
    endDate,
    search
  } = req.query;
  
  const query = {};
  
  // Apply filters
  if (action) query.action = action;
  if (entity) query.entity = entity;
  if (userId) query.userId = userId;
  
  // Date range filter
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  // Text search
  if (search) {
    query.$text = { $search: search };
  }
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { timestamp: -1 },
    populate: [
      { path: 'userId', select: 'name email role' },
      { path: 'metadata.relatedEntities.entityId', select: 'name email' }
    ]
  };
  
  const logs = await AuditLog.paginate(query, options);
  
  res.json({
    success: true,
    data: logs
  });
}));

// @desc    Get audit log by ID
// @route   GET /api/audit/logs/:id
// @access  Private (Admin)
router.get('/logs/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const log = await AuditLog.findById(req.params.id)
    .populate('userId', 'name email role')
    .populate('metadata.relatedEntities.entityId', 'name email');
    
  if (!log) {
    res.status(404);
    throw new Error('Audit log not found');
  }
  
  res.json({
    success: true,
    data: log
  });
}));

// @desc    Get audit summary
// @route   GET /api/audit/summary
// @access  Private (Admin)
router.get('/summary', authorize('admin'), asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const match = {};
  
  // Date range filter
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = new Date(startDate);
    if (endDate) match.timestamp.$lte = new Date(endDate);
  }
  
  const summary = await AuditLog.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          action: '$action',
          entity: '$entity',
          status: '$status'
        },
        count: { $sum: 1 },
        lastOccurred: { $max: '$timestamp' }
      }
    },
    {
      $group: {
        _id: {
          action: '$_id.action',
          entity: '$_id.entity'
        },
        total: { $sum: '$count' },
        byStatus: {
          $push: {
            status: '$_id.status',
            count: '$count',
            lastOccurred: '$lastOccurred'
          }
        },
        lastOccurred: { $max: '$lastOccurred' }
      }
    },
    {
      $project: {
        _id: 0,
        action: '$_id.action',
        entity: '$_id.entity',
        total: 1,
        byStatus: 1,
        lastOccurred: 1
      }
    },
    { $sort: { total: -1 } }
  ]);
  
  // Get user activity summary
  const userActivity = await AuditLog.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$userId',
        actions: { $addToSet: '$action' },
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        email: '$user.email',
        role: '$user.role',
        actionCount: '$count',
        uniqueActions: { $size: '$actions' },
        lastActivity: 1
      }
    },
    { $sort: { actionCount: -1 } },
    { $limit: 10 }
  ]);
  
  // Get system health metrics
  const systemHealth = await AuditLog.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
        },
        total: { $sum: 1 },
        success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
        error: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } },
        avgProcessingTime: { $avg: '$processingTime' }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        total: 1,
        success: 1,
        error: 1,
        successRate: { $multiply: [{ $divide: ['$success', '$total'] }, 100] },
        avgProcessingTime: 1
      }
    }
  ]);
  
  res.json({
    success: true,
    data: {
      summary,
      userActivity,
      systemHealth
    }
  });
}));

export default router;
