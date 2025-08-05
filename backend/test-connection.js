import 'dotenv/config';
import mongoose from 'mongoose';
import colors from 'colors';

console.log(colors.cyan('🔌 Testing MongoDB Atlas Connection...\n'));

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error(colors.red('❌ MONGODB_URI not found in environment variables'));
  process.exit(1);
}

console.log(colors.blue('📋 Connection Details:'));
console.log(colors.cyan(`   URI: ${process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`));

// Test connection
async function testConnection() {
  try {
    console.log(colors.blue('\n🔌 Attempting to connect...'));
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(colors.green('✅ Successfully connected to MongoDB Atlas!'));
    console.log(colors.cyan(`📊 Database: ${conn.connection.name}`));
    console.log(colors.cyan(`🌐 Host: ${conn.connection.host}`));
    
    // Test basic operations
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(colors.green(`\n✅ Found ${collections.length} collections`));
    
    if (collections.length > 0) {
      console.log(colors.cyan('\n📋 Collections:'));
      collections.forEach(collection => {
        console.log(colors.cyan(`   - ${collection.name}`));
      });
    }
    
    await mongoose.connection.close();
    console.log(colors.yellow('\n👋 Connection closed'));
    
  } catch (error) {
    console.error(colors.red(`❌ Connection failed: ${error.message}`));
    
    // Provide specific troubleshooting tips
    if (error.message.includes('bad auth')) {
      console.error(colors.red('\n💡 Authentication Error - Possible solutions:'));
      console.error(colors.red('   1. Check your username and password'));
      console.error(colors.red('   2. URL-encode special characters in password'));
      console.error(colors.red('   3. Verify database user permissions'));
      console.error(colors.red('   4. Check if IP is whitelisted in Atlas'));
    } else if (error.message.includes('ENOTFOUND')) {
      console.error(colors.red('\n💡 Network Error - Possible solutions:'));
      console.error(colors.red('   1. Check your connection string'));
      console.error(colors.red('   2. Verify cluster is running'));
      console.error(colors.red('   3. Check network access settings'));
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error(colors.red('\n💡 Connection Refused - Possible solutions:'));
      console.error(colors.red('   1. Check internet connection'));
      console.error(colors.red('   2. Verify IP is whitelisted'));
      console.error(colors.red('   3. Check firewall settings'));
    }
    
    process.exit(1);
  }
}

testConnection(); 