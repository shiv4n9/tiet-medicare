import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import LabOrder from '../models/LabOrder.js';
import LabTest from '../models/LabTest.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @desc    Get all lab orders
// @route   GET /api/doctor/lab-orders
// @access  Private (Doctor only)
const getLabOrders = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    patientId, 
    status, 
    startDate, 
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  const query = { doctorId: req.user._id };
  
  if (patientId) query.patientId = patientId;
  if (status) query.status = status;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endOfDay;
    }
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const [orders, total] = await Promise.all([
    LabOrder.find(query)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name')
      .populate('tests.testId', 'name category')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit)),
    LabOrder.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get a single lab order
// @route   GET /api/doctor/lab-orders/:id
// @access  Private (Doctor only)
const getLabOrder = asyncHandler(async (req, res) => {
  const order = await LabOrder.findById(req.params.id)
    .populate('patientId', 'name age gender bloodGroup')
    .populate('doctorId', 'name specialization')
    .populate('tests.testId', 'name category referenceRanges')
    .populate('collectionDetails.collectedBy', 'name')
    .populate('resultDelivery.deliveredBy', 'name');

  if (!order) {
    res.status(404);
    throw new Error('Lab order not found');
  }

  // Verify the requesting doctor has access to this order
  if (order.doctorId._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this lab order');
  }

  res.json({
    success: true,
    data: order
  });
});

// @desc    Create a new lab order
// @route   POST /api/doctor/lab-orders
// @access  Private (Doctor only)
const createLabOrder = asyncHandler(async (req, res) => {
  const { 
    patientId, 
    appointmentId, 
    tests, 
    clinicalNotes, 
    diagnosisCode,
    priority = 'routine',
    collectionDetails = {}
  } = req.body;

  // Validate required fields
  if (!patientId || !tests || !Array.isArray(tests) || tests.length === 0) {
    res.status(400);
    throw new Error('Patient ID and at least one test are required');
  }

  // Verify all test IDs exist
  const testIds = tests.map(test => test.testId);
  const existingTests = await LabTest.find({ 
    _id: { $in: testIds },
    isActive: true 
  });

  if (existingTests.length !== testIds.length) {
    res.status(400);
    throw new Error('One or more tests not found or inactive');
  }

  // Map test details for the order
  const testDetails = tests.map(test => {
    const existingTest = existingTests.find(t => t._id.toString() === test.testId);
    return {
      testId: test.testId,
      name: existingTest.name,
      category: existingTest.category,
      priority: test.priority || priority,
      notes: test.notes,
      status: 'ordered'
    };
  });

  // Create the lab order
  const labOrder = await LabOrder.create({
    patientId,
    doctorId: req.user._id,
    appointmentId,
    tests: testDetails,
    clinicalNotes,
    diagnosisCode,
    collectionDetails,
    status: 'ordered'
  });

  // Create notification for lab staff
  await Notification.create({
    recipientType: 'lab',
    type: 'new_lab_order',
    title: 'New Lab Order',
    message: `New lab order #${labOrder.orderNumber} has been created.`,
    priority: priority === 'stat' ? 'high' : 'medium',
    metadata: {
      labOrderId: labOrder._id,
      doctorId: req.user._id,
      patientId
    }
  });

  // Create notification for patient
  await Notification.create({
    recipientId: patientId,
    senderId: req.user._id,
    type: 'lab_order_created',
    title: 'Lab Test Ordered',
    message: `Your doctor has ordered ${testDetails.length} lab test(s).`,
    metadata: {
      labOrderId: labOrder._id,
      doctorId: req.user._id
    },
    priority: 'medium'
  });

  res.status(201).json({
    success: true,
    data: await labOrder.populate('patientId', 'name')
      .populate('tests.testId', 'name category')
  });
});

// @desc    Update lab order status
// @route   PUT /api/doctor/lab-orders/:id/status
// @access  Private (Doctor only)
const updateLabOrderStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.body;
  
  const order = await LabOrder.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Lab order not found');
  }

  // Verify the requesting doctor has access to this order
  if (order.doctorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this lab order');
  }

  // Validate status transition
  const allowedStatuses = ['ordered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowedStatuses.join(', ')}`);
  }

  // Update order status
  order.status = status;
  
  if (status === 'cancelled') {
    order.cancellationReason = cancellationReason || 'No reason provided';
    order.cancelledBy = req.user._id;
    order.cancelledAt = new Date();
    
    // Update all test statuses to cancelled
    order.tests.forEach(test => {
      if (test.status !== 'completed') {
        test.status = 'cancelled';
      }
    });
  }

  await order.save();

  // Create notification for lab staff if order is cancelled
  if (status === 'cancelled') {
    await Notification.create({
      recipientType: 'lab',
      type: 'lab_order_cancelled',
      title: 'Lab Order Cancelled',
      message: `Lab order #${order.orderNumber} has been cancelled by the doctor.`,
      priority: 'high',
      metadata: {
        labOrderId: order._id,
        doctorId: req.user._id,
        patientId: order.patientId
      }
    });
  }

  res.json({
    success: true,
    data: await order.populate('patientId', 'name')
      .populate('tests.testId', 'name category')
  });
});

// @desc    Get all lab tests
// @route   GET /api/doctor/test-templates
// @access  Private (Doctor only)
const getTestTemplates = asyncHandler(async (req, res) => {
  const { 
    search, 
    category, 
    page = 1, 
    limit = 20,
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;
  
  const query = { isActive: true };
  
  if (search) {
    query.$text = { $search: search };
  }
  
  if (category) {
    query.category = category;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const [tests, total] = await Promise.all([
    LabTest.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit)),
    LabTest.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: tests,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get lab results
// @route   GET /api/doctor/lab-results
// @access  Private (Doctor only)
const getLabResults = asyncHandler(async (req, res) => {
  const { 
    patientId, 
    testId, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 10 
  } = req.query;
  
  const query = { 
    'tests.status': 'completed',
    'tests.result': { $exists: true, $ne: null }
  };
  
  if (patientId) query.patientId = patientId;
  if (testId) query['tests.testId'] = testId;
  
  if (startDate || endDate) {
    query['tests.result.completedAt'] = {};
    if (startDate) query['tests.result.completedAt'].$gte = new Date(startDate);
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      query['tests.result.completedAt'].$lte = endOfDay;
    }
  }

  const orders = await LabOrder.find(query)
    .populate('patientId', 'name age gender')
    .populate('tests.testId', 'name category referenceRanges')
    .sort({ 'tests.result.completedAt': -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  // Flatten the results for easier frontend consumption
  const results = [];
  orders.forEach(order => {
    order.tests.forEach(test => {
      if (test.status === 'completed' && test.result) {
        results.push({
          _id: test._id,
          orderId: order._id,
          orderNumber: order.orderNumber,
          patient: order.patientId,
          testId: test.testId,
          testName: test.name,
          category: test.category,
          result: test.result,
          orderedBy: order.doctorId,
          orderedDate: order.createdAt,
          completedDate: test.result.completedAt
        });
      }
    });
  });

  const total = results.length;
  const paginatedResults = results.slice(
    (parseInt(page) - 1) * parseInt(limit),
    parseInt(page) * parseInt(limit)
  );

  res.json({
    success: true,
    data: paginatedResults,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router.get('/lab-orders', getLabOrders);
router.get('/lab-orders/:id', getLabOrder);
router.post('/lab-orders', createLabOrder);
router.put('/lab-orders/:id/status', updateLabOrderStatus);
router.get('/test-templates', getTestTemplates);
router.get('/lab-results', getLabResults);

export default router;
