import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  startTime: { type: String, required: true, match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  endTime: { type: String, required: true, match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  isRecurring: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  maxAppointments: { type: Number, min: 1, default: 1 },
  appointmentDuration: { type: Number, default: 30, min: 5, max: 240 },
  breakTime: { startTime: String, endTime: String }
});

const leaveRequestSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['vacation', 'sick-leave', 'conference', 'training', 'personal', 'other'],
    required: true
  },
  notes: { type: String, trim: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectionReason: String
}, { timestamps: true });

const feedbackResponseSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  isAnonymous: { type: Boolean, default: false },
  responseDate: { type: Date, default: Date.now },
  responseToFeedback: { comment: String, respondedAt: Date }
}, { timestamps: true });

const doctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  title: {
    type: String,
    enum: ['Dr.', 'Prof.', 'Assoc. Prof.', 'Asst. Prof.', 'Mr.', 'Ms.', 'Mrs.'],
    default: 'Dr.'
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: true
  },
  dateOfBirth: Date,
  languages: [{
    language: { type: String, required: true, trim: true },
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'professional', 'native'],
      default: 'professional'
    }
  }],
  contact: {
    phone: { type: String, trim: true },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      coordinates: { type: [Number], index: '2dsphere' }
    }
  },
  professional: {
    licenseNumber: { type: String, trim: true, required: true },
    licenseExpiryDate: Date,
    licenseDocument: String,
    specialty: { type: String, required: true, trim: true },
    subSpecialties: [{ type: String, trim: true }],
    qualifications: [{
      degree: { type: String, required: true, trim: true },
      institution: { type: String, required: true, trim: true },
      year: Number,
      country: String,
      certificate: String
    }],
    experience: [{
      position: { type: String, required: true, trim: true },
      hospital: { type: String, required: true, trim: true },
      startDate: Date,
      endDate: Date,
      isCurrent: Boolean,
      description: String
    }],
    memberships: [{
      organization: String,
      membershipNumber: String,
      startDate: Date,
      endDate: Date,
      isCurrent: Boolean
    }],
    awards: [{
      name: String,
      year: Number,
      description: String
    }],
    publications: [{
      title: String,
      journal: String,
      year: Number,
      url: String,
      authors: [String]
    }],
    bio: String,
    consultationFee: { type: Number, min: 0, required: true },
    followUpFee: { type: Number, min: 0 },
    videoConsultationFee: { type: Number, min: 0 },
    homeVisitFee: { type: Number, min: 0 },
    services: [{
      name: String,
      description: String,
      duration: Number,
      price: Number
    }],
    isAvailableForHomeVisits: { type: Boolean, default: false },
    homeVisitRadius: { type: Number, default: 0 },
    isAvailableForVideoCalls: { type: Boolean, default: false },
    videoCallPlatforms: [{
      type: String,
      enum: ['zoom', 'google-meet', 'microsoft-teams', 'skype', 'other']
    }]
  },
  availability: {
    timezone: { type: String, default: 'UTC' },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    slots: [availabilitySlotSchema],
    isAvailableOnHolidays: { type: Boolean, default: false },
    isAvailableOnWeekends: { type: Boolean, default: false },
    bufferTime: { type: Number, default: 5, min: 0, max: 60 },
    advanceBookingPeriod: { type: Number, default: 90, min: 1, max: 365 },
    sameDayAppointments: { type: Boolean, default: true },
    maxAppointmentsPerDay: { type: Number, min: 1, default: 20 },
    autoConfirmAppointments: { type: Boolean, default: true }
  },
  leaveRequests: [leaveRequestSchema],
  feedback: {
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalRatings: { type: Number, default: 0 },
    feedbackResponses: [feedbackResponseSchema],
    responseRate: { type: Number, min: 0, max: 100, default: 0 },
    responseTime: { type: Number, default: 24 },
    testimonials: [{
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: String,
      isApproved: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  documents: [{
    name: String,
    type: { type: String, enum: ['license', 'certificate', 'id-proof', 'resume', 'other'] },
    fileUrl: String,
    uploadDate: { type: Date, default: Date.now },
    expiryDate: Date,
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date
  }],
  settings: {
    notifications: {
      email: {
        newAppointment: { type: Boolean, default: true },
        appointmentReminder: { type: Boolean, default: true },
        newMessage: { type: Boolean, default: true },
        newFeedback: { type: Boolean, default: true }
      },
      push: {
        newAppointment: { type: Boolean, default: true },
        appointmentReminder: { type: Boolean, default: true },
        newMessage: { type: Boolean, default: true }
      }
    },
    privacy: {
      showProfile: { type: String, enum: ['public', 'patients-only', 'private'], default: 'public' },
      showContactInfo: { type: String, enum: ['public', 'patients-only', 'private'], default: 'patients-only' },
      showSchedule: { type: String, enum: ['public', 'patients-only', 'private'], default: 'public' }
    }
  },
  isActive: { type: Boolean, default: true },
  lastActive: Date,
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, { timestamps: true });

// Indexes
doctorProfileSchema.index({ 'contact.address.coordinates': '2dsphere' });
doctorProfileSchema.index({ 'professional.specialty': 'text', 'professional.subSpecialties': 'text' });

// Pre-save hook to update timestamps
doctorProfileSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  next();
});

// Method to check doctor availability
// Method to check doctor availability
doctorProfileSchema.methods.isAvailable = async function(dateTime, duration = 30) {
  const date = new Date(dateTime);
  const day = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const time = date.toTimeString().slice(0, 5);
  
  // Check if doctor is on leave
  const isOnLeave = this.leaveRequests.some(leave => {
    return (
      leave.status === 'approved' &&
      date >= new Date(leave.startDate) &&
      date <= new Date(leave.endDate)
    );
  });
  
  if (isOnLeave) return false;
  
  // Check if within working hours
  const slot = this.availability.slots.find(s => 
    s.day === day && 
    s.isActive &&
    time >= s.startTime && 
    time <= s.endTime
  );
  
  if (!slot) return false;
  
  // Check if there's enough time for the appointment
  const [endHour, endMinute] = slot.endTime.split(':').map(Number);
  const [startHour, startMinute] = time.split(':').map(Number);
  
  const slotEndTime = new Date(date);
  slotEndTime.setHours(endHour, endMinute, 0, 0);
  
  const appointmentEndTime = new Date(date.getTime() + duration * 60000);
  
  return appointmentEndTime <= slotEndTime;
};

// Method to add a leave request
doctorProfileSchema.methods.requestLeave = async function(leaveData) {
  const leaveRequest = {
    ...leaveData,
    status: 'pending',
    requestedAt: new Date()
  };
  
  this.leaveRequests.push(leaveRequest);
  await this.save();
  return leaveRequest;
};

// Method to add feedback
doctorProfileSchema.methods.addFeedback = async function(feedbackData) {
  const feedback = {
    ...feedbackData,
    responseDate: new Date()
  };
  
  this.feedback.feedbackResponses.push(feedback);
  
  // Update average rating
  const ratings = this.feedback.feedbackResponses.map(f => f.rating);
  this.feedback.averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  this.feedback.totalRatings = ratings.length;
  
  await this.save();
  return feedback;
};

// Method to respond to feedback
doctorProfileSchema.methods.respondToFeedback = async function(feedbackId, response) {
  const feedback = this.feedback.feedbackResponses.id(feedbackId);
  if (!feedback) throw new Error('Feedback not found');
  
  feedback.responseToFeedback = {
    comment: response.comment,
    respondedAt: new Date()
  };
  
  await this.save();
  return feedback;
};

// Method to add availability slot
doctorProfileSchema.methods.addAvailabilitySlot = async function(slotData) {
  const existingSlot = this.availability.slots.find(s => 
    s.day === slotData.day && 
    s.startTime === slotData.startTime &&
    s.endTime === slotData.endTime
  );
  
  if (existingSlot) {
    throw new Error('A slot with the same time already exists');
  }
  
  this.availability.slots.push(slotData);
  await this.save();
  return this.availability.slots[this.availability.slots.length - 1];
};

// Method to remove availability slot
doctorProfileSchema.methods.removeAvailabilitySlot = async function(slotId) {
  const slotIndex = this.availability.slots.findIndex(s => s._id.toString() === slotId);
  
  if (slotIndex === -1) {
    throw new Error('Slot not found');
  }
  
  this.availability.slots.splice(slotIndex, 1);
  await this.save();
  return true;
};

// Method to update availability slot
doctorProfileSchema.methods.updateAvailabilitySlot = async function(slotId, updates) {
  const slot = this.availability.slots.id(slotId);
  
  if (!slot) {
    throw new Error('Slot not found');
  }
  
  Object.assign(slot, updates, { _id: slot._id });
  await this.save();
  return slot;
};

// Method to get available time slots for a date
doctorProfileSchema.methods.getAvailableSlots = async function(date, duration = 30) {
  const slots = [];
  const dateObj = new Date(date);
  const day = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Get all slots for the day
  const daySlots = this.availability.slots.filter(slot => 
    slot.day === day && 
    slot.isActive
  );
  
  // For each slot, generate time slots based on duration
  for (const slot of daySlots) {
    let [startHour, startMinute] = slot.startTime.split(':').map(Number);
    const [endHour, endMinute] = slot.endTime.split(':').map(Number);
    
    let currentTime = new Date(dateObj);
    currentTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(dateObj);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    const bufferTime = this.availability.bufferTime || 0;
    
    while (currentTime.getTime() + (duration + bufferTime) * 60000 <= endTime.getTime()) {
      // Skip if current time is in the past
      if (currentTime > new Date()) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(currentTime.getTime() + duration * 60000)
        });
      }
      
      // Move to next slot
      currentTime.setMinutes(currentTime.getMinutes() + duration + bufferTime);
    }
  }
  
  return slots;
};

// Method to check if a specific time slot is available
doctorProfileSchema.methods.isSlotAvailable = async function(startTime, duration = 30) {
  const slots = await this.getAvailableSlots(startTime, duration);
  const targetTime = new Date(startTime).getTime();
  
  return slots.some(slot => {
    return slot.start.getTime() === targetTime;
  });
};

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);

export default DoctorProfile;
