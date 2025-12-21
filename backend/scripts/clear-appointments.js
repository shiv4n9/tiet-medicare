import 'dotenv/config';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';
import colors from 'colors';

const clearAppointments = async () => {
  try {
    // Connect to MongoDB
    console.log(colors.cyan('Connecting to MongoDB...'));
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(colors.green('✓ Connected to MongoDB'));

    // Count existing records
    const appointmentCount = await Appointment.countDocuments();
    const messageCount = await Message.countDocuments();

    console.log(colors.yellow(`\nFound ${appointmentCount} appointments`));
    console.log(colors.yellow(`Found ${messageCount} messages`));

    if (appointmentCount === 0 && messageCount === 0) {
      console.log(colors.green('\n✓ Database is already clean!'));
      process.exit(0);
    }

    // Confirm deletion
    console.log(colors.red('\n⚠️  WARNING: This will delete ALL appointments and messages!'));
    console.log(colors.yellow('Press Ctrl+C to cancel, or wait 3 seconds to continue...'));
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete all appointments
    console.log(colors.cyan('\nDeleting appointments...'));
    const appointmentResult = await Appointment.deleteMany({});
    console.log(colors.green(`✓ Deleted ${appointmentResult.deletedCount} appointments`));

    // Delete all messages
    console.log(colors.cyan('Deleting messages...'));
    const messageResult = await Message.deleteMany({});
    console.log(colors.green(`✓ Deleted ${messageResult.deletedCount} messages`));

    console.log(colors.green('\n✓ All records cleared successfully!'));
    console.log(colors.cyan('\nDatabase is now clean and ready for fresh data.'));

    process.exit(0);
  } catch (error) {
    console.error(colors.red('Error clearing database:'), error);
    process.exit(1);
  }
};

clearAppointments();
