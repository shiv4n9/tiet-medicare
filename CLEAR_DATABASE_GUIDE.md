# Clear Database Guide

## Quick Commands

### Option 1: Clear ALL Data (Recommended for Fresh Start)
```bash
cd backend
npm run clear:data
```

This will delete:
- ✅ All appointments
- ✅ All messages
- ✅ All users (if any test users)
- ✅ All other collections

### Option 2: Clear Only Appointments & Messages
```bash
cd backend
npm run clear:appointments
```

This will delete:
- ✅ All appointments
- ✅ All messages
- ❌ Keeps users and other data

## Step-by-Step Instructions

### 1. Stop the Backend Server
If your backend is running, stop it first:
- Press `Ctrl + C` in the backend terminal

### 2. Run the Clear Command

**For complete clean slate:**
```bash
cd backend
npm run clear:data
```

**For appointments only:**
```bash
cd backend
npm run clear:appointments
```

### 3. Wait for Confirmation
The script will:
1. Connect to MongoDB
2. Show you how many records exist
3. Wait 3 seconds (you can cancel with Ctrl+C)
4. Delete all records
5. Show confirmation

### 4. Restart Backend
```bash
npm start
```

### 5. Refresh Frontend
- Refresh your browser
- Dashboard should show 0 appointments
- Ready for fresh bookings!

## What Gets Deleted

### `npm run clear:data` (Complete Clean)
```
Collections Cleared:
├── appointments (all booking records)
├── messages (all chat messages)
├── users (all user accounts)
├── medicalrecords (all medical records)
├── prescriptions (all prescriptions)
├── labtests (all lab results)
├── notifications (all notifications)
└── ... (any other collections)
```

### `npm run clear:appointments` (Selective Clean)
```
Collections Cleared:
├── appointments (all booking records)
└── messages (all chat messages)

Collections Kept:
├── users (user accounts preserved)
├── medicalrecords (medical records preserved)
└── ... (other data preserved)
```

## Safety Features

### 3-Second Warning
Both scripts wait 3 seconds before deleting:
```
⚠️  WARNING: This will delete ALL data from the database!
Press Ctrl+C to cancel, or wait 3 seconds to continue...
```

You can press `Ctrl+C` to cancel if you change your mind!

### Confirmation Messages
The script shows:
- How many records exist before deletion
- How many records were deleted
- Success confirmation

## Example Output

```bash
$ npm run clear:data

🔌 Connecting to MongoDB...
✓ Connected to MongoDB

Found 5 collections

Current data:
  appointments: 15 documents
  messages: 42 documents
  users: 3 documents

⚠️  WARNING: This will delete ALL data from the database!
Press Ctrl+C to cancel, or wait 3 seconds to continue...

🗑️  Deleting data...
  ✓ appointments: deleted 15 documents
  ✓ messages: deleted 42 documents
  ✓ users: deleted 3 documents

✅ Successfully deleted 60 total documents!
Database is now clean and ready for fresh data.
```

## After Clearing Data

### What to Do Next:

1. **Restart Backend**
   ```bash
   npm start
   ```

2. **Create New User Accounts**
   - Register new patient account
   - Register new doctor account
   - Or use existing accounts if you used `clear:appointments`

3. **Book Fresh Appointments**
   - Go to "Book Appointment" page
   - Create new bookings
   - Test the chat feature

4. **Verify Clean State**
   - Patient Dashboard should show 0 appointments
   - Doctor Dashboard should show 0 appointments
   - Chat should have no old messages

## Troubleshooting

### Error: "Cannot connect to MongoDB"

**Solution:**
1. Check if MongoDB is running
2. Verify MONGODB_URI in `.env` file
3. Check internet connection (if using MongoDB Atlas)

### Error: "Permission denied"

**Solution:**
```bash
# On Windows:
npm run clear:data

# On Mac/Linux:
sudo npm run clear:data
```

### Script Hangs or Freezes

**Solution:**
1. Press `Ctrl+C` to cancel
2. Check MongoDB connection
3. Try again

### Want to Keep Some Data?

**Option 1:** Use selective clear
```bash
npm run clear:appointments  # Keeps users
```

**Option 2:** Manual deletion via MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database
3. Select specific collections
4. Delete documents manually

## Manual Alternative (MongoDB Shell)

If scripts don't work, use MongoDB shell:

```javascript
// Connect to MongoDB
mongosh "your_connection_string"

// Switch to database
use medicare

// Delete appointments
db.appointments.deleteMany({})

// Delete messages
db.messages.deleteMany({})

// Verify
db.appointments.countDocuments()  // Should return 0
db.messages.countDocuments()      // Should return 0
```

## Backup Before Clearing (Optional)

If you want to keep a backup:

```bash
# Export data before clearing
npm run export:local-data

# Then clear
npm run clear:data

# Data is saved in exports/ folder
```

## Quick Reference

| Command | What It Does | Use When |
|---------|-------------|----------|
| `npm run clear:data` | Deletes everything | Fresh start needed |
| `npm run clear:appointments` | Deletes appointments & messages only | Keep users, clear bookings |
| `npm run export:local-data` | Backup data | Before clearing |
| `npm run check:database` | Check database status | Verify connection |

## Important Notes

⚠️ **Warning:** Deletion is permanent! There's no undo.

✅ **Safe:** Scripts wait 3 seconds - you can cancel

💡 **Tip:** Use `clear:appointments` to keep user accounts

🔄 **Remember:** Restart backend after clearing

---

**Need Help?** Check the console output for specific error messages.
