import express from 'express';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get total appointments
    const totalAppointments = await Appointment.countDocuments();
    
    // Get total patients
    const totalPatients = await User.countDocuments({ role: 'patient' });
    
    // Get total doctors
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    
    // Calculate average rating (if you have ratings in your system)
    const doctors = await User.find({ role: 'doctor', rating: { $exists: true } });
    const averageRating = doctors.length > 0
      ? doctors.reduce((sum, doc) => sum + (doc.rating || 0), 0) / doctors.length
      : 0;
    
    // Calculate satisfaction rate (completed appointments / total appointments)
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const satisfactionRate = totalAppointments > 0
      ? Math.round((completedAppointments / totalAppointments) * 100)
      : 0;
    
    res.json({
      totalAppointments,
      totalPatients,
      totalDoctors,
      averageRating: averageRating > 0 ? averageRating : null,
      responseTime: '24/7',
      satisfactionRate: satisfactionRate > 0 ? satisfactionRate : null,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

export default router;
