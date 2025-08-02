import mongoose from 'mongoose';

const complianceDocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  documentType: {
    type: String,
    enum: ['policy', 'procedure', 'guideline', 'form', 'certificate', 'license', 'other'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'under_review'],
    default: 'draft'
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  reviewDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.effectiveDate;
      },
      message: 'Review date must be after effective date'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  accessLevel: {
    type: String,
    enum: ['public', 'restricted', 'confidential'],
    default: 'restricted'
  },
  requiredAcknowledgement: {
    type: Boolean,
    default: false
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });

const complianceAcknowledgmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComplianceDocument',
    required: true
  },
  acknowledgedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String,
  comments: String
}, { timestamps: true });

const complianceTrainingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  trainingType: {
    type: String,
    enum: ['onboarding', 'annual', 'specialized', 'refresher', 'other'],
    required: true
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComplianceDocument'
  }],
  dueDate: Date,
  completionDeadline: Date,
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  requiredFor: [{
    type: String,
    enum: ['all', 'doctors', 'nurses', 'staff', 'admin']
  }],
  assignedTo: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'overdue'],
      default: 'not_started'
    },
    completedAt: Date,
    score: Number,
    certificateUrl: String
  }],
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });

const complianceAuditSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  auditType: {
    type: String,
    enum: ['scheduled', 'for_cause', 'random', 'compliance_check'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  startDate: Date,
  endDate: Date,
  completedDate: Date,
  auditors: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['lead', 'member', 'reviewer'],
      default: 'member'
    }
  }],
  findings: [{
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    resolution: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    evidence: [{
      name: String,
      url: String,
      fileType: String
    }]
  }],
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });

// Indexes
complianceDocumentSchema.index({ name: 'text', description: 'text', tags: 'text' });
complianceDocumentSchema.index({ documentType: 1, status: 1, accessLevel: 1 });

complianceAcknowledgmentSchema.index({ userId: 1, documentId: 1 }, { unique: true });
complianceAcknowledgmentSchema.index({ documentId: 1, acknowledgedAt: -1 });

complianceTrainingSchema.index({ name: 'text', description: 'text', 'metadata.createdBy': 1 });
complianceTrainingSchema.index({ status: 1, trainingType: 1, dueDate: 1 });

complianceAuditSchema.index({ title: 'text', status: 1, auditType: 1 });
complianceAuditSchema.index({ 'auditors.userId': 1, status: 1 });

// Pre-save hooks
complianceDocumentSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  next();
});

complianceTrainingSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  next();
});

complianceAuditSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
    
    // Auto-close all open findings when audit is completed
    this.findings = this.findings.map(finding => {
      if (finding.status === 'open' || finding.status === 'in_progress') {
        finding.status = 'closed';
        finding.resolvedAt = new Date();
        finding.resolvedBy = this.metadata.updatedBy;
        finding.resolution = 'Closed automatically as part of audit completion';
      }
      return finding;
    });
  }
  next();
});

// Models
const ComplianceDocument = mongoose.model('ComplianceDocument', complianceDocumentSchema);
const ComplianceAcknowledgment = mongoose.model('ComplianceAcknowledgment', complianceAcknowledgmentSchema);
const ComplianceTraining = mongoose.model('ComplianceTraining', complianceTrainingSchema);
const ComplianceAudit = mongoose.model('ComplianceAudit', complianceAuditSchema);

export {
  ComplianceDocument,
  ComplianceAcknowledgment,
  ComplianceTraining,
  ComplianceAudit
};
