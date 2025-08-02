import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'hematology', 'biochemistry', 'microbiology', 'serology', 'immunology',
      'endocrinology', 'toxicology', 'molecular', 'urinalysis', 'coagulation',
      'blood-bank', 'blood-gas', 'cytology', 'histopathology', 'genetic', 'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  specimenType: {
    type: String,
    required: true,
    enum: [
      'blood', 'urine', 'stool', 'sputum', 'saliva', 'cerebrospinal-fluid',
      'tissue', 'swab', 'semen', 'ascitic-fluid', 'pleural-fluid',
      'synovial-fluid', 'pericardial-fluid', 'other'
    ]
  },
  containerType: {
    type: String,
    required: true
  },
  volumeRequired: {
    value: Number,
    unit: {
      type: String,
      enum: ['ml', 'mg', 'g', 'μl', 'other'],
      default: 'ml'
    }
  },
  storageRequirements: {
    temperature: {
      type: String,
      enum: ['room-temp', 'refrigerated', 'frozen', 'dry-ice', 'other']
    },
    specialInstructions: String
  },
  fastingRequired: {
    type: Boolean,
    default: false
  },
  specialInstructions: String,
  turnaroundTime: {
    value: Number,
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks'],
      default: 'hours'
    },
    statAvailable: {
      type: Boolean,
      default: false
    }
  },
  referenceRanges: [{
    ageGroup: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        enum: ['years', 'months', 'days'],
        default: 'years'
      }
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'both']
    },
    range: {
      lower: Number,
      upper: Number,
      unit: String,
      criticalLow: Number,
      criticalHigh: Number
    },
    interpretation: String
  }],
  methodology: String,
  cptCodes: [{
    code: String,
    description: String
  }],
  loincCode: String,
  isActive: {
    type: Boolean,
    default: true
  },
  cost: {
    type: Number,
    required: true
  },
  isPanel: {
    type: Boolean,
    default: false
  },
  panelTests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest'
  }],
  preparationInstructions: String,
  clinicalSignificance: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Text index for search functionality
labTestSchema.index({
  name: 'text',
  code: 'text',
  description: 'text',
  category: 'text',
  subcategory: 'text',
  'cptCodes.code': 'text',
  loincCode: 'text'
}, {
  weights: {
    name: 10,
    code: 8,
    'cptCodes.code': 6,
    loincCode: 6,
    description: 3,
    category: 2,
    subcategory: 2
  },
  name: 'labtest_search'
});

// Compound indexes for common queries
labTestSchema.index({ category: 1, isActive: 1 });
labTestSchema.index({ 'specimenType': 1, isActive: 1 });
labTestSchema.index({ isPanel: 1, isActive: 1 });

// Pre-save hook to update lastUpdated timestamp
labTestSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Virtual for panel test count
labTestSchema.virtual('testCount').get(function() {
  return this.isPanel ? this.panelTests.length : 1;
});

const LabTest = mongoose.model('LabTest', labTestSchema);

export default LabTest;
