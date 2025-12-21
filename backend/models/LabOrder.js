import mongoose from 'mongoose';

const labOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: false // Made optional for compatibility
  },
  patientEmail: {
    type: String,
    required: false // For compatibility with existing system
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  tests: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['routine', 'urgent', 'stat'],
      default: 'routine'
    },
    status: {
      type: String,
      enum: ['ordered', 'in-progress', 'completed', 'cancelled'],
      default: 'ordered'
    },
    notes: String,
    result: {
      value: mongoose.Schema.Types.Mixed,
      unit: String,
      referenceRange: String,
      abnormalFlag: {
        type: String,
        enum: ['normal', 'high', 'low', 'critical-high', 'critical-low', 'abnormal']
      },
      completedAt: Date,
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    }
  }],
  clinicalNotes: String,
  diagnosisCode: String,
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['draft', 'ordered', 'collected', 'in-progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  collectionDetails: {
    collectionDate: Date,
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    collectionSite: String,
    collectionNotes: String
  },
  resultDelivery: {
    method: {
      type: String,
      enum: ['portal', 'email', 'fax', 'mail', 'in-person']
    },
    deliveredAt: Date,
    deliveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recipient: String
  },
  isBilled: {
    type: Boolean,
    default: false
  },
  billingAmount: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentDetails: {
    amount: Number,
    method: String,
    transactionId: String,
    paidAt: Date
  },
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date
}, {
  timestamps: true
});

// Generate order number before saving
labOrderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('LabOrder').countDocuments();
    this.orderNumber = `LAB-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Indexes for better query performance
labOrderSchema.index({ orderNumber: 1 });
labOrderSchema.index({ patientId: 1, status: 1 });
labOrderSchema.index({ doctorId: 1, status: 1 });
labOrderSchema.index({ 'tests.testId': 1 });
labOrderSchema.index({ 'tests.status': 1 });
labOrderSchema.index({ status: 1, 'tests.priority': 1 });

// Virtual for getting completed tests count
labOrderSchema.virtual('completedTests').get(function() {
  return this.tests.filter(test => test.status === 'completed').length;
});

// Virtual for getting total tests count
labOrderSchema.virtual('totalTests').get(function() {
  return this.tests.length;
});

// Method to update test status
labOrderSchema.methods.updateTestStatus = async function(testId, status, userId) {
  const test = this.tests.id(testId);
  if (!test) {
    throw new Error('Test not found in this order');
  }
  
  test.status = status;
  
  if (status === 'completed') {
    test.result = test.result || {};
    test.result.completedAt = new Date();
    test.result.completedBy = userId;
  }
  
  // Update order status if all tests are completed
  if (this.tests.every(t => t.status === 'completed')) {
    this.status = 'completed';
  }
  
  await this.save();
  return this;
};

const LabOrder = mongoose.model('LabOrder', labOrderSchema);

export default LabOrder;
