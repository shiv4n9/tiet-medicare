import mongoose from 'mongoose';
import User from './models/User.js';

const listUsers = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/medicare');
    console.log('Connected to MongoDB');
    
    const users = await User.find({}).select('name email role isActive createdAt');
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

listUsers(); 