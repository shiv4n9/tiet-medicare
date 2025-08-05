import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
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
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/admin.js';
import colors from 'colors';

// Load environment variables
const PORT = process.env.PORT || 5000;

const app = express();

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173', // Vite default port
  'http://127.0.0.1:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API is running',
    timestamp: new Date(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
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