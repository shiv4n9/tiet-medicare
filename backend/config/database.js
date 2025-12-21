import mongoose from 'mongoose';
import colors from 'colors';

// Database configuration
const dbConfig = {
  // Connection options for better performance and reliability
  options: {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  }
};

// Connect to MongoDB
export const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log(colors.cyan('🔌 Connecting to MongoDB...'));
    console.log(colors.gray(`Connection string: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`));
    
    const conn = await mongoose.connect(MONGODB_URI, dbConfig.options);
    
    console.log(colors.green(`✅ MongoDB Connected: ${conn.connection.host}`));
    console.log(colors.cyan(`📊 Database: ${conn.connection.name}`));
    
    // Log connection type
    if (MONGODB_URI.includes('mongodb+srv://')) {
      console.log(colors.blue('🌐 Connected to MongoDB Atlas (Cloud)'));
    } else {
      console.log(colors.yellow('🏠 Connected to Local MongoDB'));
    }
    
    return conn;
  } catch (error) {
    console.error(colors.red(`❌ MongoDB Connection Error: ${error.message}`));
    console.error(colors.red(`Error name: ${error.name}`));
    console.error(colors.red(`Full error:`, error));
    
    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.error(colors.red('💡 Tip: Make sure your local MongoDB server is running'));
      console.error(colors.yellow('💡 Or switch to MongoDB Atlas in your .env file'));
    } else if (error.message.includes('Authentication failed') || error.message.includes('auth')) {
      console.error(colors.red('💡 Tip: Check your MongoDB Atlas username and password'));
      console.error(colors.yellow('💡 Make sure special characters in password are URL encoded'));
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error(colors.red('💡 Tip: Check your MongoDB Atlas connection string'));
      console.error(colors.yellow('💡 Make sure your cluster is running and accessible'));
    } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error(colors.red('💡 Tip: Add your IP address to MongoDB Atlas Network Access'));
      console.error(colors.yellow('💡 Or allow access from anywhere (0.0.0.0/0) for testing'));
    }
    
    console.error(colors.red('\n🔧 To fix MongoDB Atlas connection:'));
    console.error(colors.yellow('1. Go to https://cloud.mongodb.com'));
    console.error(colors.yellow('2. Select your cluster → Network Access'));
    console.error(colors.yellow('3. Click "Add IP Address" → "Allow Access from Anywhere"'));
    console.error(colors.yellow('4. Wait 2-3 minutes for changes to apply'));
    console.error(colors.yellow('5. Restart your backend server\n'));
    
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error(colors.red(`❌ MongoDB Connection Error: ${err.message}`));
});

mongoose.connection.on('disconnected', () => {
  console.log(colors.yellow('⚠️  MongoDB Disconnected'));
});

mongoose.connection.on('reconnected', () => {
  console.log(colors.green('🔄 MongoDB Reconnected'));
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log(colors.yellow('👋 MongoDB connection closed through app termination'));
    process.exit(0);
  } catch (error) {
    console.error(colors.red(`❌ Error closing MongoDB connection: ${error.message}`));
    process.exit(1);
  }
});

export default connectDB; 