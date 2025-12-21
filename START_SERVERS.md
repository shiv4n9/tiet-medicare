# Quick Start Guide - TIET Medicare

## Start Both Servers

### Option 1: Manual Start (Recommended for Development)

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

Wait for:
```
✓ Socket.IO initialized
Server running on port 5000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Wait for:
```
VITE ready in XXXms
Local: http://localhost:5173/
```

### Option 2: Using npm scripts

You can also use the dev scripts:

**Backend (with auto-reload):**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Verify Everything is Running

### 1. Backend Health Check
Open browser: http://localhost:5000/api/health

Should see:
```json
{
  "status": "OK",
  "message": "TIET Medicare API is running",
  "dbStatus": "connected"
}
```

### 2. Frontend
Open browser: http://localhost:5173

Should see the TIET Medicare homepage

### 3. Socket.IO Connection
1. Login as a patient
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for: `Socket connected: <socket-id>`

## Test Features

### Test Chat
1. Login as patient
2. Go to Patient Dashboard
3. Find an appointment with a doctor
4. Click "Chat" button
5. Send a test message
6. Check if message appears

### Test Video Call
1. Login as patient
2. Go to Patient Dashboard
3. Find an appointment with a doctor
4. Click "Video" button
5. Should open Jitsi Meet interface

## Common Issues

### Backend won't start
- Check if MongoDB is accessible
- Verify `.env` file exists with correct values
- Check if port 5000 is available

### Frontend won't start
- Check if `.env` file exists with `VITE_API_URL=http://localhost:5000`
- Verify all dependencies are installed: `npm install`
- Check if port 5173 is available

### Socket.IO not connecting
- Ensure backend is running first
- Check browser console for errors
- Verify CORS settings in backend

### Chat not working
- Check if user is logged in (token in localStorage)
- Verify Socket.IO connection in console
- Check backend logs for errors

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## Stop Servers

Press `Ctrl + C` in each terminal to stop the servers.

## Production Deployment

For production, use:

**Backend:**
```bash
cd backend
npm run prod
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Useful Commands

### Backend
- `npm start` - Start server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm run health` - Check server health

### Frontend
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Success Checklist

- [ ] Backend starts without errors
- [ ] MongoDB connection successful
- [ ] Socket.IO initialized message appears
- [ ] Frontend loads at http://localhost:5173
- [ ] Can login as patient/doctor
- [ ] Socket.IO connects (check console)
- [ ] Chat messages send/receive
- [ ] Video call opens

---

**Ready to go!** 🚀

If all checks pass, your TIET Medicare application is running successfully with full chat and video capabilities.
