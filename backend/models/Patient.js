import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    age: {
      type: Number,
      required: [true, 'Please add an age'],
      min: [0, 'Age must be a positive number'],
      max: [120, 'Age must be less than 120']
    },
    symptoms: {
      type: String,
      required: [true, 'Please describe the symptoms'],
      maxlength: [500, 'Symptoms cannot be more than 500 characters']
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Contact number cannot be longer than 20 characters']
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    address: {
      type: String,
      maxlength: [200, 'Address cannot be more than 200 characters']
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown'
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say'
    },
    medicalHistory: {
      type: String,
      maxlength: [1000, 'Medical history cannot be more than 1000 characters']
    },
    isAdmitted: {
      type: Boolean,
      default: false
    },
    assignedDoctor: {
      type: String,
      default: 'Not assigned'
    }
  },
  {
    timestamps: true
  }
);

// Create a text index for search functionality
patientSchema.index({ name: 'text', symptoms: 'text', medicalHistory: 'text' });

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
