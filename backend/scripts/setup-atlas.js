import readline from 'readline';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import colors from 'colors';

// Interactive setup script for MongoDB Atlas
const setupAtlas = async () => {
  console.log(colors.cyan('🚀 MongoDB Atlas Setup Wizard\n'));
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    console.log(colors.blue('📋 Please provide your MongoDB Atlas connection details:\n'));

    // Get connection string
    const connectionString = await question(colors.yellow('Enter your MongoDB Atlas connection string: '));
    
    if (!connectionString.includes('mongodb+srv://')) {
      console.error(colors.red('❌ Invalid connection string. Atlas connection strings should start with mongodb+srv://'));
      rl.close();
      return;
    }

    // Get JWT secret
    const jwtSecret = await question(colors.yellow('Enter your JWT secret (or press Enter for default): ')) || 'your_super_secret_jwt_key_here_make_it_long_and_random';

    // Get port
    const port = await question(colors.yellow('Enter server port (or press Enter for default 5000): ')) || '5000';

    // Get frontend URL
    const frontendUrl = await question(colors.yellow('Enter frontend URL (or press Enter for default http://localhost:5173): ')) || 'http://localhost:5173';

    // Create .env content
    const envContent = `# Server Configuration
PORT=${port}
NODE_ENV=development

# MongoDB Atlas Configuration
MONGODB_URI=${connectionString}

# JWT Configuration
JWT_SECRET=${jwtSecret}

# CORS Configuration
FRONTEND_URL=${frontendUrl}
`;

    // Write .env file
    const envPath = path.join(process.cwd(), '.env');
    fs.writeFileSync(envPath, envContent);

    console.log(colors.green('\n✅ .env file created successfully!'));
    console.log(colors.cyan(`📁 Location: ${envPath}`));

    // Test connection
    console.log(colors.blue('\n🧪 Testing connection to MongoDB Atlas...'));
    
    // Import and run migration test
    const { default: migrateToAtlas } = await import('../scripts/migrate-to-atlas.js');
    await migrateToAtlas();

    console.log(colors.green('\n🎉 Setup completed successfully!'));
    console.log(colors.cyan('\n📝 Next steps:'));
    console.log(colors.cyan('   1. Start your server: npm run dev'));
    console.log(colors.cyan('   2. Test your application'));
    console.log(colors.cyan('   3. Check the MIGRATION_GUIDE.md for more details'));

  } catch (error) {
    console.error(colors.red(`❌ Setup failed: ${error.message}`));
  } finally {
    rl.close();
  }
};

// Run setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupAtlas();
}

export default setupAtlas; 