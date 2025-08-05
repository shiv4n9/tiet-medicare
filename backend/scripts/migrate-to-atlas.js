import mongoose from 'mongoose';
import 'dotenv/config';
import colors from 'colors';

// Migration script to help transition from local MongoDB to MongoDB Atlas
const migrateToAtlas = async () => {
  console.log(colors.cyan('🚀 Starting MongoDB Atlas Migration...\n'));

  try {
    // Check if Atlas URI is configured
    const atlasUri = process.env.MONGODB_URI;
    
    if (!atlasUri) {
      console.error(colors.red('❌ MONGODB_URI not found in environment variables'));
      console.log(colors.yellow('💡 Please set your MongoDB Atlas connection string in .env file'));
      process.exit(1);
    }

    if (!atlasUri.includes('mongodb+srv://')) {
      console.error(colors.red('❌ MONGODB_URI does not appear to be a MongoDB Atlas connection string'));
      console.log(colors.yellow('💡 Atlas connection strings should start with mongodb+srv://'));
      process.exit(1);
    }

    console.log(colors.blue('🔌 Testing MongoDB Atlas connection...'));
    
    // Test Atlas connection
    const conn = await mongoose.connect(atlasUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(colors.green('✅ Successfully connected to MongoDB Atlas!'));
    console.log(colors.cyan(`📊 Database: ${conn.connection.name}`));
    console.log(colors.cyan(`🌐 Host: ${conn.connection.host}`));

    // Test basic operations
    console.log(colors.blue('\n🧪 Testing database operations...'));
    
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(colors.green(`✅ Found ${collections.length} collections in Atlas database`));
    
    if (collections.length > 0) {
      console.log(colors.cyan('\n📋 Collections found:'));
      collections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
    } else {
      console.log(colors.yellow('\n📝 No collections found yet. This is normal for a new Atlas database.'));
    }

    // Test user collection specifically
    const usersCollection = collections.find(col => col.name === 'users');
    if (usersCollection) {
      const userCount = await db.collection('users').countDocuments();
      console.log(colors.green(`\n👥 Users collection found with ${userCount} users`));
    } else {
      console.log(colors.yellow('\n👥 Users collection will be created when first user registers'));
    }

    console.log(colors.green('\n🎉 MongoDB Atlas migration test completed successfully!'));
    console.log(colors.cyan('\n📝 Next steps:'));
    console.log(colors.cyan('   1. Update your .env file with the Atlas connection string'));
    console.log(colors.cyan('   2. Restart your server'));
    console.log(colors.cyan('   3. Test your application with the new database'));

    await mongoose.connection.close();
    console.log(colors.yellow('\n👋 Connection closed'));

  } catch (error) {
    console.error(colors.red(`❌ Migration test failed: ${error.message}`));
    
    // Provide helpful error messages
    if (error.message.includes('Authentication failed')) {
      console.error(colors.red('\n💡 Authentication Error:'));
      console.error(colors.red('   - Check your MongoDB Atlas username and password'));
      console.error(colors.red('   - Make sure your IP address is whitelisted in Atlas'));
      console.error(colors.red('   - Verify your database user has the correct permissions'));
    } else if (error.message.includes('ENOTFOUND')) {
      console.error(colors.red('\n💡 Connection Error:'));
      console.error(colors.red('   - Check your MongoDB Atlas connection string'));
      console.error(colors.red('   - Verify your cluster is running'));
      console.error(colors.red('   - Make sure your network access is configured correctly'));
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error(colors.red('\n💡 Network Error:'));
      console.error(colors.red('   - Check your internet connection'));
      console.error(colors.red('   - Verify your IP is whitelisted in Atlas Network Access'));
    }
    
    process.exit(1);
  }
};

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToAtlas();
}

export default migrateToAtlas; 