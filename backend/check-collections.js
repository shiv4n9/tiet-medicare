import 'dotenv/config';
import { connectDB } from './config/database.js';
import mongoose from 'mongoose';

const checkCollections = async () => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    
    console.log('🔍 Checking all collections...');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check if there are multiple appointment-related collections
    const appointmentCollections = collections.filter(c => 
      c.name.toLowerCase().includes('appointment')
    );
    
    console.log('Appointment collections:', appointmentCollections.map(c => c.name));
    
    // Check each appointment collection
    for (const collection of appointmentCollections) {
      console.log(`\n--- ${collection.name} ---`);
      const docs = await db.collection(collection.name).find({}).limit(5).toArray();
      console.log(`Found ${docs.length} documents`);
      
      docs.forEach((doc, index) => {
        console.log(`  ${index + 1}. ID: ${doc._id} (${doc._id.toString().length} chars)`);
        console.log(`     Patient: ${doc.patientName || doc.name}`);
        console.log(`     Doctor: ${doc.doctor}`);
        console.log(`     Status: ${doc.status}`);
        
        // Check for the problematic ID
        if (doc._id.toString().includes('6467b2db147d7d2a6e427775')) {
          console.log('     🚨 FOUND PROBLEMATIC ID!');
        }
      });
    }
    
    // Also check if there's any document with the problematic ID pattern
    console.log('\n🔍 Searching for problematic ID pattern...');
    for (const collection of appointmentCollections) {
      const problematicDocs = await db.collection(collection.name).find({
        _id: { $regex: /6467b2db147d7d2a6e427775/ }
      }).toArray();
      
      if (problematicDocs.length > 0) {
        console.log(`Found ${problematicDocs.length} problematic docs in ${collection.name}`);
        problematicDocs.forEach(doc => {
          console.log(`  - ${doc._id}: ${doc.patientName || doc.name}`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkCollections();