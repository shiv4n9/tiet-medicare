# Chat Feature Troubleshooting Guide

## Current Status

✅ **Fixed Issues:**
1. Chat button now visible on Doctor Dashboard (always shows)
2. Chat button visible on Patient Dashboard (Quick Actions + appointments)
3. Socket.IO connection code added to ChatWindow
4. Correct messages route imported in server.js
5. ChatWindow positioned to avoid Quick Navigation overlap

## ⚠️ IMPORTANT: Restart Backend Server

After the recent changes, you **MUST restart the backend server**:

```bash
# In backend terminal:
# Press Ctrl+C to stop
# Then run:
npm start
```

## How to Test

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

Wait for:
```
✓ Socket.IO initialized
Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Test as Patient

1. Login as patient
2. Go to Patient Dashboard
3. Look for "Quick Actions" card (below stats)
4. Click green "Chat with Doctor" button
5. OR click "Chat with Doctor" on any appointment
6. Chat window should open at bottom-right
7. Type a message and press Enter or click Send

### 3. Test as Doctor

1. Login as doctor
2. Go to Doctor Dashboard
3. Look at "Today's Schedule" section
4. Find an appointment
5. Click blue "Chat" button
6. Chat window should open at bottom-right
7. Type a message and press Enter or click Send

## Common Errors & Solutions

### Error: "Socket not connected"

**Cause:** Backend server not running or Socket.IO not initialized

**Solution:**
1. Check backend terminal - should show "✓ Socket.IO initialized"
2. If not, restart backend: `npm start`
3. Check browser console for connection errors
4. Verify VITE_API_URL in frontend/.env: `VITE_API_URL=http://localhost:5000`

### Error: "404 (Not Found)" on /api/messages/conversation/...

**Cause:** Backend server not restarted after code changes

**Solution:**
1. Stop backend server (Ctrl+C)
2. Restart: `npm start`
3. Refresh browser page
4. Try sending message again

### Error: Chat button not visible

**Patient Dashboard:**
- Check if you have any appointments booked
- Look in "Quick Actions" card (always visible)
- Look in "Upcoming Appointments" section
- Look in "Appointments" tab

**Doctor Dashboard:**
- Check "Today's Schedule" section
- Button should be on every appointment card
- Blue "Chat" button next to "Complete" and "Cancel"

### Error: Chat window overlaps with Quick Navigation

**Solution:** Already fixed - chat window is at `right-24` (96px from right)

### Error: Can't type in chat input

**Cause:** Chat window might be behind another element

**Solution:**
1. Click directly on the input field
2. Check browser console for errors
3. Try closing and reopening chat window

## Verification Checklist

### Backend
- [ ] Backend server running on port 5000
- [ ] Console shows "✓ Socket.IO initialized"
- [ ] No errors in backend console
- [ ] MongoDB connected successfully

### Frontend
- [ ] Frontend running on port 5173
- [ ] Browser console shows "Socket connected: <socket-id>"
- [ ] No 404 errors in Network tab
- [ ] Chat button visible on dashboard

### Chat Functionality
- [ ] Chat window opens when clicking button
- [ ] Can type in input field
- [ ] Send button is clickable
- [ ] Messages appear in chat window
- [ ] No errors in browser console

## Debug Commands

### Check Backend Health
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "OK",
  "dbStatus": "connected"
}
```

### Check Messages Endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/messages/conversation/test-conversation-id
```

### Check Socket.IO Connection
Open browser console and run:
```javascript
// Check if socket is connected
console.log('Socket connected:', socketService.isConnected());

// Get socket instance
console.log('Socket:', socketService.getSocket());
```

## File Locations

### Backend Files
- `backend/server.js` - Main server file with Socket.IO setup
- `backend/routes/messages.js` - Messages API routes
- `backend/socket/chatHandler.js` - Socket.IO event handlers
- `backend/models/Message.js` - Message database model

### Frontend Files
- `frontend/src/components/Chat/ChatWindow.tsx` - Chat UI component
- `frontend/src/services/socketService.ts` - Socket.IO client service
- `frontend/src/pages/PatientDashboard.tsx` - Patient dashboard with chat
- `frontend/src/pages/DoctorDashboardSimplified.tsx` - Doctor dashboard with chat

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## Network Tab Inspection

Open browser DevTools (F12) → Network tab:

**Expected Requests:**
1. `GET /api/messages/conversation/...` → 200 OK
2. `WebSocket connection` → 101 Switching Protocols
3. `POST /api/messages` → 201 Created (when sending)

**If you see 404:**
- Backend not running
- Wrong API URL
- Backend not restarted after changes

**If you see 401:**
- Not logged in
- Token expired
- Check localStorage for 'token'

## Still Not Working?

### 1. Clear Everything
```bash
# Stop both servers
# Clear browser cache
# Clear localStorage
localStorage.clear()

# Restart backend
cd backend
npm start

# Restart frontend
cd frontend
npm run dev
```

### 2. Check Logs
- Backend console for errors
- Browser console for errors
- Network tab for failed requests

### 3. Verify Data
- Check if appointments have patientId/doctorId
- Check if user is properly authenticated
- Check if MongoDB is running

### 4. Test Simple Message
Try sending a simple message like "test" to verify basic functionality.

## Success Indicators

✅ Backend console shows:
```
✓ Socket.IO initialized
Server running on port 5000
Socket connected: <socket-id>
User <user-id> joined
```

✅ Browser console shows:
```
Socket connected: <socket-id>
```

✅ Network tab shows:
```
GET /api/messages/conversation/... → 200 OK
```

✅ Chat window:
- Opens smoothly
- Shows "No messages yet" or existing messages
- Input field is active
- Send button works
- Messages appear instantly

---

**Last Updated:** November 4, 2025
**Status:** Ready for testing after backend restart
