import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referralNumber: {
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
  referringDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referredToDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referredToFacility: {
    name: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    contact: {
      phone: String,
      email: String
    }
  },
  reasonForReferral: {
    type: String,
    required: true
  },
  clinicalInformation: {
    diagnosis: String,
    relevantHistory: String,
    currentMedications: [{
      name: String,
      dosage: String,
      frequency: String
    }],
    allergies: [String],
    recentLabResults: [String],
    imagingResults: [String]
  },
  requestedServices: [{
    type: {
      type: String,
      enum: ['consultation', 'procedure', 'diagnostic-test', 'therapy', 'other'],
      required: true
    },
    description: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency'],
      default: 'routine'
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'accepted', 'in-progress', 'completed', 'rejected', 'cancelled', 'expired'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'emergency'],
    default: 'routine'
  },
  appointmentRequired: {
    type: Boolean,
    default: true
  },
  preferredDateRange: {
    from: Date,
    to: Date
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  notes: String,
  attachments: [{
    name: String,
    url: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  feedback: {
    fromReferredDoctor: {
      type: String,
      maxlength: 1000
    },
    fromReferringDoctor: {
      type: String,
      maxlength: 1000
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    submittedAt: Date
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastModified: {
      type: Date,
      default: Date.now
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    version: {
      type: Number,
      default: 1
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
referralSchema.index({ referralNumber: 1 });
referralSchema.index({ patientId: 1, status: 1 });
referralSchema.index({ referringDoctorId: 1, status: 1 });
referralSchema.index({ referredToDoctorId: 1, status: 1 });
referralSchema.index({ status: 1, priority: 1 });
referralSchema.index({ 'referredToFacility.name': 'text', reasonForReferral: 'text' });

// Pre-save hook to generate referral number
referralSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Referral').countDocuments();
    this.referralNumber = `REF-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(count + 1).toString().padStart(6, '0')}`;
  }
  
  // Update last modified timestamp and version
  if (this.isModified()) {
    this.metadata.lastModified = new Date();
    this.metadata.version += 1;
  }
  
  next();
});

// Method to update referral status
referralSchema.methods.updateStatus = async function(newStatus, userId, notes = '') {
  const allowedTransitions = {
    draft: ['pending', 'cancelled'],
    pending: ['accepted', 'rejected', 'cancelled'],
    accepted: ['in-progress', 'completed', 'cancelled'],
    'in-progress': ['completed', 'cancelled'],
    completed: [],
    rejected: [],
    cancelled: [],
    expired: []
  };

  // Check if the status transition is allowed
  if (!allowedTransitions[this.status]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }

  // Update status and add notes if provided
  this.status = newStatus;
  this.metadata.lastModified = new Date();
  this.metadata.modifiedBy = userId;
  
  if (notes) {
    this.notes = this.notes ? `${this.notes}\n\n${new Date().toISOString()}: ${notes}` : `${new Date().toISOString()}: ${notes}`;
  }

  await this.save();
  return this;
};

// Method to add feedback
referralSchema.methods.addFeedback = async function(feedback, userId, isFromReferredDoctor = false) {
  if (this.status !== 'completed' && this.status !== 'in-progress') {
    throw new Error('Feedback can only be added to in-progress or completed referrals');
  }

  if (isFromReferredDoctor) {
    this.feedback = this.feedback || {};
    this.feedback.fromReferredDoctor = feedback.comments || '';
    this.feedback.rating = feedback.rating || null;
    this.feedback.submittedAt = new Date();
  } else {
    // Only allow referring doctor to add feedback after referral is completed
    if (this.status !== 'completed') {
      throw new Error('Referring doctor can only add feedback after referral is completed');
    }
    this.feedback = this.feedback || {};
    this.feedback.fromReferringDoctor = feedback.comments || '';
    this.feedback.submittedAt = new Date();
  }

  await this.save();
  return this;
};

// Virtual for referral duration in days
referralSchema.virtual('durationDays').get(function() {
  if (!this.createdAt || !this.updatedAt) return null;
  const diffTime = Math.abs(this.updatedAt - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;
