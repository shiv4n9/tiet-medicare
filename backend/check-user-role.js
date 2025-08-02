import mongoose from 'mongoose';
import User from './models/User.js';

const checkUserRole = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/medicare');
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'achyutsidhantofficial@gmail.com' });
    
    if (user) {
      console.log('User found:');
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- Role:', user.role);
      console.log('- Is Active:', user.isActive);
      console.log('- Created:', user.createdAt);
    } else {
      console.log('User not found');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUserRole(); 