import mongoose from 'mongoose';

const noteTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['progress', 'consultation', 'procedure', 'followup', 'general'],
    default: 'general'
  },
  specialty: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUsed: Date,
  usageCount: {
    type: Number,
    default: 0
  },
  variables: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'boolean'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [{
      label: String,
      value: String
    }],
    defaultValue: mongoose.Schema.Types.Mixed
  }],
  sections: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      default: 0
    },
    isCollapsible: {
      type: Boolean,
      default: false
    },
    isCollapsedByDefault: {
      type: Boolean,
      default: false
    }
  }],
  metadata: {
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
noteTemplateSchema.index({ name: 'text', description: 'text', content: 'text', tags: 'text' });
noteTemplateSchema.index({ type: 1, specialty: 1, isPublic: 1 });
noteTemplateSchema.index({ createdBy: 1, isPublic: 1 });

// Pre-save hook to update metadata
noteTemplateSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('sections') || this.isModified('variables')) {
    this.metadata.lastModified = new Date();
    this.metadata.version += 1;
  }
  next();
});

// Method to create a new note from template
noteTemplateSchema.methods.createNote = function(doctorId, patientId, variables = {}) {
  let processedContent = this.content;
  
  // Replace variables in the content
  this.variables.forEach(variable => {
    const value = variables[variable.name] !== undefined 
      ? variables[variable.name] 
      : variable.defaultValue || `[${variable.name}]`;
    
    const regex = new RegExp(`{{\s*${variable.name}\s*}}`, 'g');
    processedContent = processedContent.replace(regex, value);
  });
  
  // Create a new note based on this template
  return {
    title: this.name,
    content: processedContent,
    patientId,
    doctorId,
    type: this.type,
    isTemplate: false,
    templateName: this.name,
    templateId: this._id,
    tags: [...this.tags],
    metadata: {
      createdBy: doctorId,
      lastModified: new Date()
    }
  };
};

// Method to increment usage count
noteTemplateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

const NoteTemplate = mongoose.model('NoteTemplate', noteTemplateSchema);

export default NoteTemplate;
