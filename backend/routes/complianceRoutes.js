import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
  ComplianceDocument, 
  ComplianceAcknowledgment, 
  ComplianceTraining, 
  ComplianceAudit 
} from '../models/Compliance.js';
import AuditLog from '../models/Audit.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Document routes
router.get('/documents', getComplianceDocuments);
router.get('/documents/:id', getComplianceDocument);
router.post('/documents', authorize('admin'), createComplianceDocument);
router.put('/documents/:id', authorize('admin'), updateComplianceDocument);
router.delete('/documents/:id', authorize('admin'), deleteComplianceDocument);
router.post('/documents/:id/acknowledge', acknowledgeDocument);

// Training routes
router.get('/trainings', getComplianceTrainings);
router.get('/trainings/:id', getComplianceTraining);
router.post('/trainings', authorize('admin'), createComplianceTraining);
router.put('/trainings/:id', authorize('admin'), updateComplianceTraining);
router.put('/trainings/:id/status', updateTrainingStatus);

// Audit routes
router.get('/audits', authorize('admin'), getComplianceAudits);
router.get('/audits/:id', getComplianceAudit);
router.post('/audits', authorize('admin'), createComplianceAudit);
router.put('/audits/:id', updateComplianceAudit);
router.post('/audits/:id/findings', addAuditFinding);
router.put('/audits/:auditId/findings/:findingId', updateAuditFinding);

// Document controllers
async function getComplianceDocuments(req, res) {
  const { type, status, search } = req.query;
  const query = {};
  
  if (type) query.documentType = type;
  if (status) query.status = status;
  if (search) query.$text = { $search: search };
  
  // Apply role-based access
  if (req.user.role !== 'admin') {
    query.$or = [
      { accessLevel: 'public' },
      { accessLevel: 'restricted', 'metadata.createdBy': req.user._id }
    ];
  }
  
  const docs = await ComplianceDocument.find(query)
    .populate('metadata.createdBy', 'name email')
    .populate('metadata.updatedBy', 'name email');
  
  res.json({ success: true, data: docs });
}

async function getComplianceDocument(req, res) {
  const doc = await ComplianceDocument.findById(req.params.id)
    .populate('metadata.createdBy', 'name email')
    .populate('metadata.updatedBy', 'name email');
  
  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  // Check access
  if (doc.accessLevel === 'confidential' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this document');
  }
  
  res.json({ success: true, data: doc });
}

async function createComplianceDocument(req, res) {
  const doc = new ComplianceDocument({
    ...req.body,
    'metadata.createdBy': req.user._id,
    'metadata.updatedBy': req.user._id
  });
  
  await doc.save();
  
  // Log action
  await AuditLog.log({
    action: 'create_compliance_document',
    entity: 'ComplianceDocument',
    entityId: doc._id,
    userId: req.user._id,
    userRole: req.user.role,
    details: { documentType: doc.documentType }
  });
  
  res.status(201).json({ success: true, data: doc });
}

async function updateComplianceDocument(req, res) {
  const doc = await ComplianceDocument.findById(req.params.id);
  
  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  Object.assign(doc, req.body, { 'metadata.updatedBy': req.user._id });
  await doc.save();
  
  // Log action
  await AuditLog.log({
    action: 'update_compliance_document',
    entity: 'ComplianceDocument',
    entityId: doc._id,
    userId: req.user._id,
    userRole: req.user.role,
    details: { documentType: doc.documentType }
  });
  
  res.json({ success: true, data: doc });
}

async function deleteComplianceDocument(req, res) {
  const doc = await ComplianceDocument.findById(req.params.id);
  
  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  await doc.deleteOne();
  
  // Log action
  await AuditLog.log({
    action: 'delete_compliance_document',
    entity: 'ComplianceDocument',
    entityId: doc._id,
    userId: req.user._id,
    userRole: req.user.role,
    details: { documentType: doc.documentType }
  });
  
  res.json({ success: true, message: 'Document deleted successfully' });
}

async function acknowledgeDocument(req, res) {
  const doc = await ComplianceDocument.findById(req.params.id);
  
  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  const acknowledgment = new ComplianceAcknowledgment({
    documentId: doc._id,
    userId: req.user._id,
    acknowledgedAt: new Date(),
    ipAddress: req.ip
  });
  
  await acknowledgment.save();
  
  res.json({ success: true, data: acknowledgment });
}

// Training controllers
async function getComplianceTrainings(req, res) {
  const { status, type } = req.query;
  const query = {};
  
  if (status) query.status = status;
  if (type) query.trainingType = type;
  
  const trainings = await ComplianceTraining.find(query)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');
  
  res.json({ success: true, data: trainings });
}

async function getComplianceTraining(req, res) {
  const training = await ComplianceTraining.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');
  
  if (!training) {
    res.status(404);
    throw new Error('Training not found');
  }
  
  res.json({ success: true, data: training });
}

async function createComplianceTraining(req, res) {
  const training = new ComplianceTraining({
    ...req.body,
    createdBy: req.user._id
  });
  
  await training.save();
  
  // Log action
  await AuditLog.log({
    action: 'create_compliance_training',
    entity: 'ComplianceTraining',
    entityId: training._id,
    userId: req.user._id,
    userRole: req.user.role,
    details: { trainingType: training.trainingType }
  });
  
  res.status(201).json({ success: true, data: training });
}

async function updateComplianceTraining(req, res) {
  const training = await ComplianceTraining.findById(req.params.id);
  
  if (!training) {
    res.status(404);
    throw new Error('Training not found');
  }
  
  Object.assign(training, req.body);
  await training.save();
  
  // Log action
  await AuditLog.log({
    action: 'update_compliance_training',
    entity: 'ComplianceTraining',
    entityId: training._id,
    userId: req.user._id,
    userRole: req.user.role,
    details: { trainingType: training.trainingType }
  });
  
  res.json({ success: true, data: training });
}

async function updateTrainingStatus(req, res) {
  const training = await ComplianceTraining.findById(req.params.id);
  
  if (!training) {
    res.status(404);
    throw new Error('Training not found');
  }
  
  training.status = req.body.status;
  training.completedAt = req.body.status === 'completed' ? new Date() : null;
  await training.save();
  
  res.json({ success: true, data: training });
}

// Audit controllers
async function getComplianceAudits(req, res) {
  const { status, type, startDate, endDate } = req.query;
  const query = {};
  
  if (status) query.status = status;
  if (type) query.auditType = type;
  if (startDate || endDate) {
    query.auditDate = {};
    if (startDate) query.auditDate.$gte = new Date(startDate);
    if (endDate) query.auditDate.$lte = new Date(endDate);
  }
  
  const audits = await ComplianceAudit.find(query)
    .populate('auditor', 'name email')
    .populate('createdBy', 'name email');
  
  res.json({ success: true, data: audits });
}

async function getComplianceAudit(req, res) {
  const audit = await ComplianceAudit.findById(req.params.id)
    .populate('auditor', 'name email')
    .populate('createdBy', 'name email')
    .populate('findings.assignedTo', 'name email');
  
  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }
  
  res.json({ success: true, data: audit });
}

async function createComplianceAudit(req, res) {
  const audit = new ComplianceAudit({
    ...req.body,
    createdBy: req.user._id
  });
  
  await audit.save();
  
  // Log action
  await AuditLog.log({
    action: 'create_compliance_audit',
    entity: 'ComplianceAudit',
    entityId: audit._id,
    userId: req.user._id,
    userRole: req.user.role,
    details: { auditType: audit.auditType }
  });
  
  res.status(201).json({ success: true, data: audit });
}

async function updateComplianceAudit(req, res) {
  const audit = await ComplianceAudit.findById(req.params.id);
  
  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }
  
  Object.assign(audit, req.body);
  await audit.save();
  
  // Log action
  await AuditLog.log({
    action: 'update_compliance_audit',
    entity: 'ComplianceAudit',
    entityId: audit._id,
    userId: req.user._id,
    userRole: req.user.role,
    details: { auditType: audit.auditType }
  });
  
  res.json({ success: true, data: audit });
}

async function addAuditFinding(req, res) {
  const audit = await ComplianceAudit.findById(req.params.id);
  
  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }
  
  const finding = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date(),
    createdBy: req.user._id
  };
  
  audit.findings.push(finding);
  await audit.save();
  
  res.json({ success: true, data: finding });
}

async function updateAuditFinding(req, res) {
  const audit = await ComplianceAudit.findById(req.params.auditId);
  
  if (!audit) {
    res.status(404);
    throw new Error('Audit not found');
  }
  
  const finding = audit.findings.id(req.params.findingId);
  
  if (!finding) {
    res.status(404);
    throw new Error('Finding not found');
  }
  
  Object.assign(finding, req.body, { updatedAt: new Date() });
  await audit.save();
  
  res.json({ success: true, data: finding });
}

// Export router
export default router;
