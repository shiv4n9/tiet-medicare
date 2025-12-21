import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/database.js';
import appointmentRoutes from './routes/appointments.js';
import patientRoutes from './routes/patients.js';
import authRoutes from './routes/auth.js';
import doctorRoutes from './routes/doctor.js';
import labRoutes from './routes/labRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import doctorProfileRoutes from './routes/doctorProfileRoutes.js';
import complianceRoutes from './routes/complianceRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import statsRoutes from './routes/stats.js';
import prescriptionRoutes from './routes/prescriptions.js';
import labOrderRoutes from './routes/labs.js';
import referralNewRoutes from './routes/referrals.js';
import patientDashboardRoutes from './routes/patientDashboard.js';
import emergencyRoutes from './routes/emergency.js';
import User from './models/User.js';
import colors from 'colors';
import { initializeChat } from './socket/chatHandler.js';

// Load environment variables
const PORT = process.env.PORT || 5000;

const app = express();

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - Support both development and production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Check against allowed origins list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow Vercel preview deployments and Netlify
    if (origin.includes('.vercel.app') || origin.includes('.netlify.app')) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Request logging middleware with better formatting
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(colors.cyan(`[${timestamp}] ${req.method} ${req.originalUrl}`));
  
  // Only log body for non-sensitive routes
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    const sensitiveRoutes = ['/api/auth/login', '/api/auth/register'];
    if (!sensitiveRoutes.includes(req.originalUrl)) {
      console.log(colors.gray('Request body:'), req.body);
    }
  }
  next();
});

// Public route for getting available doctors (before auth routes)
app.get('/api/doctors/available', async (req, res) => {
  try {
    const { specialization, department } = req.query;
    
    const query = { 
      role: 'doctor',
      isActive: true
    };
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    const doctors = await User.find(query)
      .select('name email specialization department consultationFee rating totalRatings availability')
      .sort({ rating: -1, name: 1 });

    // Transform the data for frontend
    const transformedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization || 'General Medicine',
      department: doctor.department || 'General',
      consultationFee: doctor.consultationFee || 0,
      rating: doctor.rating || 0,
      totalRatings: doctor.totalRatings || 0,
      availability: doctor.availability || []
    }));

    res.json({
      success: true,
      data: transformedDoctors
    });
  } catch (error) {
    console.error('Error fetching available doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available doctors'
    });
  }
});

// API Routes
console.log('🔗 Registering API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
console.log('✅ Appointments routes registered at /api/appointments');
app.use('/api/patients', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/doctor/notes', noteRoutes);
app.use('/api/doctor/referrals', referralRoutes);
app.use('/api/doctor/profile', doctorProfileRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
// New consultation flow routes
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/labs', labOrderRoutes);
app.use('/api/referrals', referralNewRoutes);
app.use('/api/patients', patientDashboardRoutes);
app.use('/api/emergency', emergencyRoutes);
console.log('✅ Emergency routes registered at /api/emergency');

// Health check endpoint with more details
app.get('/api/health', (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: 'OK',
    message: 'TIET Medicare API is running',
    timestamp: new Date(),
    uptime: process.uptime(),
    dbStatus: dbStates[mongoose.connection.readyState] || 'unknown',
    nodeEnv: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    memoryUsage: process.memoryUsage()
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    
    // Create HTTP server
    const server = createServer(app);
    
    // Setup Socket.IO
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Setup chat handlers
    initializeChat(io);

    console.log(colors.green('✓ Socket.IO initialized'));

    server.listen(PORT, () => {
      console.log(colors.yellow(`Server running on port ${PORT}`));
      console.log(colors.cyan('Allowed origins:'));
      allowedOrigins.forEach(origin => console.log(colors.cyan(`- ${origin}`)));
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(colors.red(`Error: ${err.message}`));
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(colors.red(`Error starting server: ${error.message}`));
    process.exit(1);
  }
};

startServer();

export default app;