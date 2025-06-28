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
    enum: ['pending', 'confirmed', 'cancelled', 'completed','scheduled' ],
    default: 'pending' 
  },
  contactNumber: {
    type: String,
    required: [true, 'Please add a contact number']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a compound index for doctor and date
appointmentSchema.index({ doctor: 1, date: 1 });

// Prevent duplicate bookings for same doctor and time slot
appointmentSchema.index(
  { doctor: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

// Add a pre-save hook to validate appointment time
appointmentSchema.pre('save', function(next) {
  const appointmentTime = new Date(this.date);
  const hours = parseInt(this.time.split(':')[0]);
  const minutes = parseInt(this.time.split(':')[1]);
  
  appointmentTime.setHours(hours, minutes, 0, 0);
  
  // Validate if the appointment is in the future
  if (appointmentTime < new Date()) {
    next(new Error('Appointment time must be in the future'));
  }
  
  // Validate if it's within working hours (e.g., 9 AM to 5 PM)
  if (hours < 9 || hours >= 17) {
    next(new Error('Appointments can only be scheduled between 9 AM and 5 PM'));
  }
  
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
