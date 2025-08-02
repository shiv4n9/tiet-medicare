import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
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
  type: {
    type: String,
    enum: ['progress', 'consultation', 'procedure', 'followup', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['draft', 'finalized', 'signed', 'amended'],
    default: 'draft'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  signedBy: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    title: String,
    signature: String,
    signedAt: Date
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }],
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lockedAt: Date,
  metadata: {
    lastModified: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
noteSchema.index({ patientId: 1, type: 1 });
noteSchema.index({ doctorId: 1, status: 1 });
noteSchema.index({ isTemplate: 1, type: 1 });
noteSchema.index({ 'tags': 1 });
noteSchema.index({ title: 'text', content: 'text' });

// Virtual for note summary (first 100 chars of content)
noteSchema.virtual('summary').get(function() {
  return this.content.substring(0, 100) + (this.content.length > 100 ? '...' : '');
});

// Pre-save hook to update metadata
noteSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('status')) {
    this.metadata.lastModified = new Date();
    this.metadata.modifiedBy = this.doctorId;
    
    // Increment version if content changes
    if (this.isModified('content') && !this.isNew) {
      this.version += 1;
    }
  }
  
  if (this.isNew) {
    this.metadata.createdBy = this.doctorId;
  }
  
  next();
});

// Method to create a new version of the note
noteSchema.methods.createNewVersion = async function(updatedBy) {
  const newNote = this.toObject();
  delete newNote._id;
  delete newNote.createdAt;
  delete newNote.updatedAt;
  
  const newVersion = new this.constructor(newNote);
  newVersion.previousVersions = [...this.previousVersions, this._id];
  newVersion.version = this.version + 1;
  newVersion.metadata = {
    ...newVersion.metadata,
    createdBy: this.metadata.createdBy,
    modifiedBy: updatedBy,
    lastModified: new Date()
  };
  
  return newVersion.save();
};

const Note = mongoose.model('Note', noteSchema);

export default Note;
