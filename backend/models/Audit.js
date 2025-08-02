import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true
  },
  entity: {
    type: String,
    required: true,
    trim: true
  },
  entityId: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    required: true,
    enum: ['admin', 'doctor', 'nurse', 'patient', 'staff', 'system']
  },
  userIp: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  details: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    changes: mongoose.Schema.Types.Mixed
  },
  metadata: {
    requestId: String,
    correlationId: String,
    sessionId: String,
    deviceId: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      },
      city: String,
      region: String,
      country: String,
      postalCode: String
    },
    tags: [String]
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  severity: {
    type: String,
    enum: ['info', 'low', 'medium', 'high', 'critical'],
    default: 'info'
  },
  relatedEntities: [{
    entity: String,
    entityId: mongoose.Schema.Types.Mixed
  }],
  source: {
    type: String,
    enum: ['web', 'mobile', 'api', 'system', 'cron', 'integration'],
    default: 'web'
  },
  clientInfo: {
    appVersion: String,
    os: String,
    osVersion: String,
    browser: String,
    browserVersion: String,
    deviceType: String,
    screenResolution: String
  },
  processingTime: Number, // in milliseconds
  error: {
    message: String,
    code: String,
    stack: String
  },
  retentionPeriod: {
    type: Number, // in days
    default: 365
  }
}, { 
  timestamps: true,
  expireAfterSeconds: 31536000 // 1 year default retention
});

// Indexes for common query patterns
auditLogSchema.index({ action: 1, entity: 1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ 'metadata.location': '2dsphere' });
auditLogSchema.index({ 'metadata.tags': 1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });

// Text index for search
auditLogSchema.index({
  'action': 'text',
  'entity': 'text',
  'details': 'text',
  'error.message': 'text',
  'metadata.tags': 'text'
});

// Pre-save hook to set default retention period based on severity
auditLogSchema.pre('save', function(next) {
  // Set different retention periods based on severity
  const retentionPeriods = {
    critical: 365 * 10, // 10 years
    high: 365 * 5,      // 5 years
    medium: 365 * 3,    // 3 years
    low: 365,           // 1 year
    info: 180           // 6 months
  };
  
  this.retentionPeriod = retentionPeriods[this.severity] || 365;
  
  // Set default status based on error presence
  if (this.error && this.error.message && this.status === 'success') {
    this.status = 'failed';
  }
  
  next();
});

// Static method to log an audit entry
auditLogSchema.statics.log = async function(entry) {
  try {
    const auditEntry = new this(entry);
    await auditEntry.save();
    return auditEntry;
  } catch (error) {
    console.error('Failed to log audit entry:', error);
    // Consider implementing a dead-letter queue or alternative logging mechanism
  }
};

// Method to get audit summary
auditLogSchema.statics.getSummary = async function({
  startDate,
  endDate = new Date(),
  groupBy = 'action',
  filter = {}
}) {
  const match = {
    timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
    ...filter
  };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: `$${groupBy}`,
        count: { $sum: 1 },
        lastOccurred: { $max: '$timestamp' },
        users: { $addToSet: '$userId' },
        entities: { $addToSet: { entity: '$entity', count: 1 } }
      }
    },
    { $sort: { count: -1 } },
    {
      $project: {
        _id: 0,
        [groupBy]: '$_id',
        count: 1,
        lastOccurred: 1,
        uniqueUsers: { $size: '$users' },
        uniqueEntities: { $size: '$entities' }
      }
    }
  ]);
};

// Method to search audit logs with pagination
auditLogSchema.statics.search = async function({
  query = {},
  page = 1,
  limit = 20,
  sort = { timestamp: -1 },
  select = {}
}) {
  const skip = (page - 1) * limit;
  
  const [results, total] = await Promise.all([
    this.find(query)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email role')
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    data: results,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

// Method to get user activity summary
auditLogSchema.statics.getUserActivity = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
        },
        date: { $first: '$timestamp' },
        actions: {
          $push: {
            action: '$action',
            entity: '$entity',
            timestamp: '$timestamp'
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
        actions: 1
      }
    }
  ]);
};

// Method to get system health metrics
auditLogSchema.statics.getSystemHealth = async function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
        },
        date: { $first: '$timestamp' },
        total: { $sum: 1 },
        success: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        avgProcessingTime: { $avg: '$processingTime' },
        bySeverity: {
          $push: {
            severity: '$severity',
            count: 1
          }
        },
        byAction: {
          $push: {
            action: '$action',
            count: 1
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        total: 1,
        success: 1,
        failed: 1,
        successRate: {
          $multiply: [
            { $divide: ['$success', '$total'] },
            100
          ]
        },
        avgProcessingTime: 1,
        severityBreakdown: {
          $arrayToObject: {
            $map: {
              input: '$bySeverity',
              as: 's',
              in: { k: '$$s.severity', v: '$$s.count' }
            }
          }
        },
        topActions: {
          $slice: [
            {
              $reduce: {
                input: '$byAction',
                initialValue: [],
                in: {
                  $let: {
                    vars: {
                      existing: {
                        $filter: {
                          input: '$$value',
                          as: 'e',
                          cond: { $eq: ['$$e.action', '$$this.action'] }
                        }
                      }
                    },
                    in: {
                      $concatArrays: [
                        { $filter: {
                          input: '$$value',
                          as: 'e',
                          cond: { $ne: ['$$e.action', '$$this.action'] }
                        }},
                        [{
                          action: '$$this.action',
                          count: {
                            $add: [
                              { $ifNull: [{ $arrayElemAt: ['$$existing.count', 0] }, 0] },
                              1
                            ]
                          }
                        }]
                      ]
                    }
                  }
                }
              }
            },
            5
          ]
        }
      }
    },
    { $sort: { date: 1 } }
  ]);
};

// Create model
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
