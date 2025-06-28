import mongoose from 'mongoose';
import 'dotenv/config';

// Connect to your database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tiet-medicare';

console.log('🔍 Checking TIET Medicare Database...\n');
console.log('Database URI:', MONGODB_URI);

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Database Collections:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });

    // Check if users collection exists
    const usersCollection = collections.find(col => col.name === 'users');
    
    if (usersCollection) {
      console.log('\n👥 Users Collection Found!');
      
      // Get user count
      const userCount = await db.collection('users').countDocuments();
      console.log(`   Total Users: ${userCount}`);
      
      if (userCount > 0) {
        console.log('\n📋 User Data Sample:');
        const users = await db.collection('users').find({}).limit(3).toArray();
        
        users.forEach((user, index) => {
          console.log(`\n   User ${index + 1}:`);
          console.log(`     ID: ${user._id}`);
          console.log(`     Name: ${user.name}`);
          console.log(`     Email: ${user.email}`);
          console.log(`     Auth Provider: ${user.authProvider}`);
          console.log(`     Created: ${user.createdAt}`);
          console.log(`     Last Login: ${user.lastLogin}`);
          // Don't show password for security
          console.log(`     Password: [HIDDEN - Hashed with bcrypt]`);
        });
      } else {
        console.log('\n   No users found in database yet.');
      }
    } else {
      console.log('\n⚠️  Users collection not found yet.');
      console.log('   It will be created when the first user registers.');
    }

    // Check other collections
    const appointmentsCollection = collections.find(col => col.name === 'appointments');
    const patientsCollection = collections.find(col => col.name === 'patients');
    
    if (appointmentsCollection) {
      const appointmentCount = await db.collection('appointments').countDocuments();
      console.log(`\n📅 Appointments: ${appointmentCount} records`);
    }
    
    if (patientsCollection) {
      const patientCount = await db.collection('patients').countDocuments();
      console.log(`🏥 Patients: ${patientCount} records`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📁 DATABASE STRUCTURE');
    console.log('='.repeat(50));
    console.log('Database Name: tiet-medicare');
    console.log('Collections:');
    console.log('  - users (stores user registration data)');
    console.log('  - appointments (stores appointment data)');
    console.log('  - patients (stores patient data)');
    console.log('\n🔐 User Data Security:');
    console.log('  - Passwords are hashed with bcrypt');
    console.log('  - Emails are stored in lowercase');
    console.log('  - JWT tokens are generated for authentication');
    console.log('  - Timestamps are automatically added');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure MongoDB is running');
    console.log('   2. Check your MONGODB_URI in .env file');
    console.log('   3. Ensure the database name is correct');
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkDatabase(); 