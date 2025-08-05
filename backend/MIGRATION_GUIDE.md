# MongoDB Atlas Migration Guide

This guide will help you migrate from local MongoDB to MongoDB Atlas for your TIET Medicare application.

## Prerequisites

- Node.js and npm installed
- MongoDB Atlas account (free tier available)
- Your local MongoDB data (if you want to migrate existing data)

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Choose the **FREE** tier (M0) for development

### 1.2 Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to your users
5. Click "Create"

### 1.3 Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a username and password (save these securely)
4. Set privileges to "Read and write to any database"
5. Click "Add User"

### 1.4 Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add specific IP addresses
5. Click "Confirm"

### 1.5 Get Your Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

## Step 2: Update Environment Variables

### 2.1 Create/Update .env File
Create a `.env` file in your backend directory with the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority

# Example:
# MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/medicare?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Important:** Replace `<username>`, `<password>`, `<cluster-url>`, and `<database-name>` with your actual values.

## Step 3: Export Local Data (Optional)

If you have existing data in your local MongoDB that you want to migrate:

```bash
# Export data from local MongoDB
npm run export:local-data
```

This will create an export file in the `exports/` directory.

## Step 4: Test Atlas Connection

```bash
# Test your MongoDB Atlas connection
npm run migrate:test-atlas
```

This script will:
- Verify your connection string
- Test the connection to Atlas
- Check if collections exist
- Provide helpful error messages if something goes wrong

## Step 5: Start Your Application

```bash
# Start the development server
npm run dev
```

You should see output indicating connection to MongoDB Atlas:
```
🔌 Connecting to MongoDB...
✅ MongoDB Connected: cluster0.abc123.mongodb.net
📊 Database: medicare
🌐 Connected to MongoDB Atlas (Cloud)
```

## Step 6: Verify Migration

### 6.1 Check Database Status
```bash
# Check database status
npm run check:database
```

### 6.2 Test Your Application
1. Start your frontend application
2. Try to register a new user
3. Verify the user is created in Atlas
4. Test login functionality

## Troubleshooting

### Common Issues

#### 1. Authentication Failed
**Error:** `Authentication failed`
**Solution:**
- Check your MongoDB Atlas username and password
- Make sure your IP address is whitelisted in Atlas
- Verify your database user has the correct permissions

#### 2. Connection Refused
**Error:** `ENOTFOUND` or `ECONNREFUSED`
**Solution:**
- Check your MongoDB Atlas connection string
- Verify your cluster is running
- Make sure your network access is configured correctly

#### 3. Network Access Issues
**Error:** `Network access denied`
**Solution:**
- Go to Atlas Network Access
- Add your current IP address
- Or temporarily allow access from anywhere (0.0.0.0/0) for development

#### 4. Database User Issues
**Error:** `User not found` or `Insufficient permissions`
**Solution:**
- Go to Atlas Database Access
- Verify your database user exists
- Check that the user has "Read and write to any database" permissions

### Debugging Commands

```bash
# Test Atlas connection
npm run migrate:test-atlas

# Export local data
npm run export:local-data

# Check database status
npm run check:database

# Start server with debug logging
DEBUG=* npm run dev
```

## Security Considerations

### For Development
- Use the free tier for development
- Allow access from anywhere (0.0.0.0/0) for testing
- Use simple passwords (but still secure)

### For Production
- Use a paid tier for better performance
- Restrict network access to specific IP addresses
- Use strong, unique passwords
- Enable MongoDB Atlas security features
- Set up proper backup and monitoring

## Performance Optimization

### Connection Pooling
The application is configured with connection pooling:
- `maxPoolSize: 10` - Maintains up to 10 connections
- `serverSelectionTimeoutMS: 5000` - 5-second timeout for server selection
- `socketTimeoutMS: 45000` - 45-second socket timeout

### Monitoring
- Use MongoDB Atlas monitoring features
- Set up alerts for connection issues
- Monitor database performance

## Rollback Plan

If you need to rollback to local MongoDB:

1. Update your `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/medicare
```

2. Make sure your local MongoDB server is running:
```bash
mongod
```

3. Restart your application:
```bash
npm run dev
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review MongoDB Atlas documentation
3. Check the application logs for detailed error messages
4. Verify your connection string format

## Next Steps

After successful migration:
1. Test all application features
2. Monitor performance
3. Set up proper backup strategies
4. Consider implementing MongoDB Atlas advanced features
5. Update your deployment scripts for production 