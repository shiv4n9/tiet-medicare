import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
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
  medications: [{
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    instructions: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      required: true
    },
    prescribedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  instructions: {
    type: String,
    default: ''
  },
  refillInfo: {
    allowed: {
      type: Boolean,
      default: false
    },
    quantity: {
      type: Number,
      default: 0
    },
    duration: { // in days
      type: Number,
      default: 0
    },
    lastRefillDate: Date
  },
  refillRequests: [{
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reason: String,
    quantityRequested: Number,
    quantityApproved: Number,
    durationRequested: Number,
    durationApproved: Number,
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
prescriptionSchema.index({ patientId: 1, status: 1 });
prescriptionSchema.index({ doctorId: 1, status: 1 });
prescriptionSchema.index({ 'medications.medicationId': 1 });
prescriptionSchema.index({ 'refillRequests.requestedBy': 1 });

// Pre-save hook to update status based on dates
prescriptionSchema.pre('save', function(next) {
  if (this.isModified('refillInfo.lastRefillDate') && this.refillInfo) {
    const lastRefill = this.refillInfo.lastRefillDate;
    const duration = this.refillInfo.duration || 0;
    
    if (lastRefill && duration > 0) {
      const expiryDate = new Date(lastRefill);
      expiryDate.setDate(expiryDate.getDate() + duration);
      
      if (new Date() > expiryDate) {
        this.status = 'expired';
      }
    }
  }
  next();
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
