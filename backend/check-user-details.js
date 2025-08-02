import mongoose from 'mongoose';
import User from './models/User.js';

const checkUserDetails = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/medicare');
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'achyutsidhantofficial@gmail.com' });
    
    if (user) {
      console.log('User found with full details:');
      console.log('- _id:', user._id);
      console.log('- name:', user.name);
      console.log('- email:', user.email);
      console.log('- role:', user.role);
      console.log('- isActive:', user.isActive);
      console.log('- authProvider:', user.authProvider);
      console.log('- createdAt:', user.createdAt);
      console.log('- updatedAt:', user.updatedAt);
      
      // Check if role is actually in the database
      const userDoc = user.toObject();
      console.log('\nAll fields in user document:', Object.keys(userDoc));
      console.log('Role field exists:', 'role' in userDoc);
      console.log('Role value:', userDoc.role);
    } else {
      console.log('User not found');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUserDetails(); 