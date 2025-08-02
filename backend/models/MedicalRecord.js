import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
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
  visitDate: {
    type: Date,
    default: Date.now
  },
  chiefComplaint: {
    type: String,
    required: true,
    maxlength: 500
  },
  historyOfPresentIllness: {
    type: String,
    maxlength: 1000
  },
  pastMedicalHistory: {
    type: String,
    maxlength: 1000
  },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    prescribedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  allergies: [{
    allergen: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    }
  }],
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number
  },
  physicalExamination: {
    type: String,
    maxlength: 1000
  },
  diagnosis: [{
    condition: String,
    icd10Code: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    isChronic: {
      type: Boolean,
      default: false
    }
  }],
  treatmentPlan: {
    type: String,
    maxlength: 1000
  },
  prescriptions: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    prescribedDate: {
      type: Date,
      default: Date.now
    }
  }],
  labOrders: [{
    testName: String,
    testType: String,
    orderedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['ordered', 'in-progress', 'completed', 'cancelled'],
      default: 'ordered'
    },
    results: String,
    resultDate: Date
  }],
  referrals: [{
    specialist: String,
    reason: String,
    referredDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: String
  }],
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    date: Date,
    reason: String
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
medicalRecordSchema.index({ patientId: 1, visitDate: -1 });
medicalRecordSchema.index({ doctorId: 1, visitDate: -1 });
medicalRecordSchema.index({ appointmentId: 1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord; 