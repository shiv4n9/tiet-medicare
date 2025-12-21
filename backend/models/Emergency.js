import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow anonymous emergencies
  },
  userName: {
    type: String,
    required: true,
  },
  userPhone: {
    type: String,
  },
  userEmail: {
    type: String,
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
    },
  },
  emergencyType: {
    type: String,
    enum: ['medical', 'accident', 'fire', 'security', 'other'],
    default: 'medical',
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'dispatched', 'resolved', 'cancelled'],
    default: 'pending',
  },
  notifiedContacts: [{
    phone: String,
    notifiedAt: Date,
    status: String,
  }],
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  respondedAt: {
    type: Date,
  },
  resolvedAt: {
    type: Date,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for quick lookups
emergencySchema.index({ status: 1, createdAt: -1 });
emergencySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Emergency', emergencySchema);
