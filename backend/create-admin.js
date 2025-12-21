import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tiet-medicare';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@example.com');
      await mongoose.connection.close();
      return;
    }
    
    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin2025',
      role: 'admin',
      isActive: true
    });
    
    await adminUser.save();
    console.log('Admin user created successfully:');
    console.log('- Email: admin@example.com');
    console.log('- Password: admin2025');
    console.log('- Role: admin');
    
    await mongoose.connection.close();
  } catch (error) {
    if (error.code === 11000) {
      console.log('Admin user already exists');
    } else {
      console.error('Error:', error);
    }
    await mongoose.connection.close();
  }
};

createAdmin(); 