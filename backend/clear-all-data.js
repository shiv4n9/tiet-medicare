import 'dotenv/config';
import mongoose from 'mongoose';
import colors from 'colors';

const clearAllData = async () => {
  try {
    console.log(colors.cyan('🔌 Connecting to MongoDB...'));
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(colors.green('✓ Connected to MongoDB'));

    const db = mongoose.connection.db;

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(colors.yellow(`\nFound ${collections.length} collections`));

    // Count documents in each collection
    console.log(colors.cyan('\nCurrent data:'));
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      if (count > 0) {
        console.log(colors.yellow(`  ${collection.name}: ${count} documents`));
      }
    }

    console.log(colors.red('\n⚠️  WARNING: This will delete ALL data from the database!'));
    console.log(colors.yellow('Press Ctrl+C to cancel, or wait 3 seconds to continue...'));
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete data from each collection
    console.log(colors.cyan('\n🗑️  Deleting data...'));
    let totalDeleted = 0;

    for (const collection of collections) {
      const result = await db.collection(collection.name).deleteMany({});
      if (result.deletedCount > 0) {
        console.log(colors.green(`  ✓ ${collection.name}: deleted ${result.deletedCount} documents`));
        totalDeleted += result.deletedCount;
      }
    }

    console.log(colors.green(`\n✅ Successfully deleted ${totalDeleted} total documents!`));
    console.log(colors.cyan('Database is now clean and ready for fresh data.\n'));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(colors.red('❌ Error clearing database:'), error);
    process.exit(1);
  }
};

clearAllData();
