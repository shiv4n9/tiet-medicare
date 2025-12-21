import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Fix corrupted appointment IDs
const fixAppointmentIds = async () => {
  try {
    await connectDB();
    
    // Get all appointments
    const appointments = await mongoose.connection.db.collection('appointments').find({}).toArray();
    
    console.log(`Found ${appointments.length} appointments`);
    
    let fixedCount = 0;
    
    for (const appointment of appointments) {
      const idString = appointment._id.toString();
      
      // Check if ID is longer than 24 characters
      if (idString.length > 24) {
        console.log(`Found corrupted ID: ${idString} (${idString.length} chars)`);
        
        // Extract first 24 characters
        const cleanId = idString.substring(0, 24);
        
        // Validate it's a proper hex string
        if (/^[a-f\d]{24}$/i.test(cleanId)) {
          try {
            // Create new ObjectId from clean string
            const newObjectId = new mongoose.Types.ObjectId(cleanId);
            
            // Update the document with clean ID
            await mongoose.connection.db.collection('appointments').updateOne(
              { _id: appointment._id },
              { $set: { _id: newObjectId } }
            );
            
            console.log(`✅ Fixed ID: ${idString} -> ${cleanId}`);
            fixedCount++;
          } catch (error) {
            console.error(`❌ Failed to fix ID ${idString}:`, error.message);
          }
        } else {
          console.error(`❌ Cannot fix ID ${idString}: not valid hex`);
        }
      }
    }
    
    console.log(`\n🎉 Fixed ${fixedCount} appointment IDs`);
    
    // Verify the fix
    const updatedAppointments = await mongoose.connection.db.collection('appointments').find({}).toArray();
    const invalidIds = updatedAppointments.filter(apt => apt._id.toString().length !== 24);
    
    if (invalidIds.length === 0) {
      console.log('✅ All appointment IDs are now valid!');
    } else {
      console.log(`❌ Still have ${invalidIds.length} invalid IDs`);
    }
    
  } catch (error) {
    console.error('Error fixing appointment IDs:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the fix
fixAppointmentIds();