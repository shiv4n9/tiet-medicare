import mongoose from 'mongoose';
import User from './models/User.js';

const createAdmin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/tiet-medicare');
    console.log('Connected to MongoDB');
    
    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@tiet-medicare.com',
      password: 'Admin@123',
      role: 'admin',
      isActive: true
    });
    
    await adminUser.save();
    console.log('Admin user created successfully:');
    console.log('- Email: admin@tiet-medicare.com');
    console.log('- Password: Admin@123');
    console.log('- Role: admin');
    
    await mongoose.connection.close();
  } catch (error) {
    if (error.code === 11000) {
      console.log('Admin user already exists');
    } else {
      console.error('Error:', error);
    }
  }
};

createAdmin(); 