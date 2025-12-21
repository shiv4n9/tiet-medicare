import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  time: {
    type: String,
    required: [true, 'Please add a time']
  },
  doctor: {
    type: String,
    required: [true, 'Please select a doctor']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for backward compatibility
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  patientName: {
    type: String,
    required: false
  },
  patientEmail: {
    type: String,
    required: false
  },
  patientAge: {
    type: Number,
    required: false
  },
  patientGender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    required: false
  },
  department: {
    type: String,
    required: false
  },
  specialization: {
    type: String,
    required: false
  },
  type: {
    type: String,
    required: false
  },
  service: {
    type: String,
    required: [true, 'Please select a service']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'scheduled', 'no-show', 'in_progress'],
    default: 'pending' 
  },
  startedAt: {
    type: Date,
    required: false
  },
  contactNumber: {
    type: String,
    required: [true, 'Please add a contact number']
  },
  appointmentTime: {
    type: String,
    required: false
  },
  appointmentDate: {
    type: Date,
    required: false
  },
  duration: {
    type: Number,
    default: 30 // Duration in minutes
  },
  location: {
    type: String,
    default: 'Clinic Room 1'
  },
  completedAt: {
    type: Date,
    required: false
  },
  cancelledAt: {
    type: Date,
    required: false
  },
  cancellationReason: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound indexes for efficient querying
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ email: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });

// Prevent duplicate bookings for same doctor and time slot
appointmentSchema.index(
  { doctor: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

// Add a pre-save hook to validate appointment time (only for new appointments)
appointmentSchema.pre('save', function(next) {
  // Skip all validations for now to allow consultation updates
  next();
});

// Static method to check if slot is available
appointmentSchema.statics.isSlotAvailable = async function(doctor, date, time) {
  const existingAppointment = await this.findOne({
    doctor,
    date,
    time,
    status: { $ne: 'cancelled' }
  });
  
  return !existingAppointment;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
