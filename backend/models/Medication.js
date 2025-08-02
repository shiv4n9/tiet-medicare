import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  genericName: {
    type: String,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'analgesic', 'antibiotic', 'antidepressant', 'antihistamine', 
      'anti-inflammatory', 'antiviral', 'beta-blocker', 'blood-thinner',
      'diuretic', 'hormone', 'immunosuppressant', 'laxative',
      'muscle-relaxant', 'sedative', 'stimulant', 'vaccine', 'other'
    ],
    default: 'other'
  },
  form: {
    type: String,
    enum: [
      'tablet', 'capsule', 'syrup', 'injection', 'inhaler', 
      'cream', 'ointment', 'gel', 'drops', 'spray', 'patch', 'suppository'
    ],
    required: true
  },
  strength: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['mg', 'mcg', 'g', 'ml', 'IU', '%', 'other'],
      required: true
    }
  },
  manufacturer: {
    type: String,
    trim: true
  },
  ndc: { // National Drug Code
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  atcCode: { // Anatomical Therapeutic Chemical code
    type: String,
    trim: true,
    uppercase: true
  },
  sideEffects: [{
    type: String,
    trim: true
  }],
  contraindications: [{
    type: String,
    trim: true
  }],
  dosage: {
    type: String,
    trim: true
  },
  storage: {
    type: String,
    default: 'Store at room temperature, away from light and moisture.'
  },
  pregnancyCategory: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'X', 'N'],
    default: 'N' // Not classified
  },
  schedule: {
    type: String,
    enum: ['OTC', 'I', 'II', 'III', 'IV', 'V', 'NA'],
    default: 'NA'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Text index for search functionality
medicationSchema.index({
  name: 'text',
  genericName: 'text',
  description: 'text',
  category: 'text'
}, {
  weights: {
    name: 10,
    genericName: 8,
    description: 5,
    category: 3
  },
  name: 'medication_search'
});

// Compound index for common queries
medicationSchema.index({ category: 1, isActive: 1 });
medicationSchema.index({ 'strength.value': 1, 'strength.unit': 1 });

// Pre-save hook to update lastUpdated timestamp
medicationSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const Medication = mongoose.model('Medication', medicationSchema);

export default Medication;
