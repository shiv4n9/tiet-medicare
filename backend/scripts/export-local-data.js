import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import colors from 'colors';

// Script to export data from local MongoDB for migration to Atlas
const exportLocalData = async () => {
  console.log(colors.cyan('📤 Exporting data from local MongoDB...\n'));

  try {
    // Connect to local MongoDB
    const localUri = 'mongodb://localhost:27017/medicare';
    console.log(colors.blue('🔌 Connecting to local MongoDB...'));
    
    const conn = await mongoose.connect(localUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(colors.green('✅ Connected to local MongoDB'));
    
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(colors.cyan(`📋 Found ${collections.length} collections`));
    
    // Create export directory
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = path.join(exportDir, `local-data-${timestamp}.json`);
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      database: 'medicare',
      collections: {}
    };
    
    // Export each collection
    for (const collection of collections) {
      console.log(colors.blue(`📤 Exporting collection: ${collection.name}`));
      
      const documents = await db.collection(collection.name).find({}).toArray();
      exportData.collections[collection.name] = documents;
      
      console.log(colors.green(`   ✅ Exported ${documents.length} documents`));
    }
    
    // Write to file
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(colors.green(`\n✅ Data exported successfully to: ${exportPath}`));
    console.log(colors.cyan('\n📝 Export summary:'));
    
    Object.keys(exportData.collections).forEach(collectionName => {
      const count = exportData.collections[collectionName].length;
      console.log(colors.cyan(`   - ${collectionName}: ${count} documents`));
    });
    
    console.log(colors.yellow('\n💡 You can now import this data to MongoDB Atlas if needed'));
    
    await mongoose.connection.close();
    console.log(colors.yellow('\n👋 Connection closed'));

  } catch (error) {
    console.error(colors.red(`❌ Export failed: ${error.message}`));
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error(colors.red('\n💡 Make sure your local MongoDB server is running'));
      console.error(colors.red('   Start MongoDB with: mongod'));
    }
    
    process.exit(1);
  }
};

// Run export if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exportLocalData();
}

export default exportLocalData; 