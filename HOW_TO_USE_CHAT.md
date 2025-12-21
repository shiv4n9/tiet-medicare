# How to Use Chat Feature - Quick Guide

## For Patients

### Step 1: Login
1. Go to the application
2. Click "Login" or "Sign In"
3. Enter your patient credentials
4. You'll be redirected to the Patient Dashboard

### Step 2: Find Chat Buttons

The chat button appears in **THREE locations** on your dashboard:

#### Location 1: Today's Appointments Banner (Top of Page)
```
┌─────────────────────────────────────────────────┐
│ 🔔 You have 1 appointment today                 │
│                                                  │
│  Dr. Smith                                       │
│  10:00 AM - Cardiology                          │
│                          [💬 Chat] [📹 Video]   │
└─────────────────────────────────────────────────┘
```
- **When**: If you have appointments scheduled for today
- **Button**: Blue "Chat" button on the right side

#### Location 2: Upcoming Appointments Card (Overview Tab)
```
┌─────────────────────────────────────────────────┐
│ 📅 Upcoming Appointments                         │
│                                                  │
│  Dr. Smith                                       │
│  Cardiology                                      │
│  🕐 Nov 5, 2025 at 10:00 AM                     │
│  [scheduled]                                     │
│  [💬 Chat with Doctor]                          │
└─────────────────────────────────────────────────┘
```
- **Tab**: Overview (default tab)
- **Section**: "Upcoming Appointments" card (left side)
- **Button**: "Chat with Doctor" button below each appointment

#### Location 3: All Appointments Tab
```
┌─────────────────────────────────────────────────┐
│ All Appointments              [+ Book Appointment]│
│                                                  │
│  👤 Dr. Smith                                    │
│     Cardiology                                   │
│     🕐 Nov 5, 2025 at 10:00 AM                  │
│     [scheduled]                                  │
│                                                  │
│                    [💬 Chat with Doctor]        │
│                    [👁 Details]                  │
└─────────────────────────────────────────────────┘
```
- **Tab**: Click "Appointments" tab
- **Button**: Blue "Chat with Doctor" button on each appointment card

### Step 3: Start Chatting
1. Click any "Chat" or "Chat with Doctor" button
2. A chat window will open at the bottom-right of your screen
3. Type your message in the text box
4. Press Enter or click the Send button (➤)
5. Your doctor will receive the message in real-time

### Chat Window Features
```
┌─────────────────────────────────────┐
│ 💬 Dr. Smith              [×]       │
│ 🟢 Online                           │
├─────────────────────────────────────┤
│                                     │
│  Hello, how can I help you?         │
│                          10:30 AM   │
│                                     │
│  I have a question about...         │
│  10:31 AM                           │
│                                     │
├─────────────────────────────────────┤
│ [Type a message...]          [➤]   │
└─────────────────────────────────────┘
```

## For Doctors

### Step 1: Login
1. Go to the application
2. Click "Login" or "Sign In"
3. Enter your doctor credentials
4. You'll be redirected to the Doctor Dashboard

### Step 2: Find Chat Buttons

The chat button appears on **each appointment card** in Today's Schedule:

```
┌─────────────────────────────────────────────────┐
│ 🕐 Today's Schedule                              │
│                                                  │
│  ⏰ 10:00 AM                                     │
│                                                  │
│  👤 John Doe                                     │
│     25 years • Male • General Checkup           │
│     📞 123-456-7890                             │
│     [scheduled]                                  │
│                                                  │
│  [💬 Chat] [✓ Complete] [× Cancel]             │
└─────────────────────────────────────────────────┘
```

- **Location**: Today's Schedule section
- **Button**: Blue "Chat" button on each appointment
- **Position**: Left side of action buttons

### Step 3: Start Chatting
1. Click the "Chat" button on any appointment
2. A chat window will open at the bottom-right
3. You can see patient's previous messages
4. Type your response and send
5. Patient receives it instantly

## Troubleshooting

### "I don't see any chat buttons"

**Possible Reasons:**

1. **No Appointments**
   - You need to have at least one appointment booked
   - Book an appointment first from "Book Appointment" button

2. **Wrong Dashboard**
   - Make sure you're on the Patient Dashboard (for patients)
   - Or Doctor Dashboard (for doctors)
   - Check the URL: `/patient-dashboard` or `/doctor-dashboard`

3. **Not Logged In**
   - Ensure you're logged in
   - Check if you see your name in the top-right corner

4. **Appointment Data Issue**
   - The appointment might not have doctor information
   - Try booking a new appointment

### "Chat button is there but nothing happens when I click"

**Solutions:**

1. **Check Browser Console**
   - Press F12 to open DevTools
   - Look for any error messages
   - Check if Socket.IO is connected

2. **Verify Backend is Running**
   - Backend should be running on port 5000
   - Check: http://localhost:5000/api/health

3. **Check Socket.IO Connection**
   - Look for "Socket connected" message in console
   - If not connected, restart backend server

4. **Clear Browser Cache**
   - Clear cache and reload page
   - Try in incognito/private mode

### "Messages not sending"

**Solutions:**

1. **Check Internet Connection**
   - Ensure you're connected to the internet

2. **Verify Backend is Running**
   - Backend must be running for real-time chat
   - Restart backend: `cd backend && npm start`

3. **Check Authentication**
   - Make sure you're logged in
   - Token should be in localStorage

4. **Socket.IO Connection**
   - Check if Socket.IO is connected
   - Look for connection errors in console

## Quick Test

### Test as Patient:
1. Login as patient
2. Go to Patient Dashboard
3. Look for "Upcoming Appointments" card
4. You should see "Chat with Doctor" button
5. Click it - chat window should open

### Test as Doctor:
1. Login as doctor
2. Go to Doctor Dashboard
3. Look at "Today's Schedule"
4. Find an appointment
5. Click "Chat" button
6. Chat window should open

## Visual Indicators

### Chat Button States:

**Normal State:**
```
[💬 Chat with Doctor]
```
- Blue background
- White text
- Clickable

**Hover State:**
```
[💬 Chat with Doctor] ← Darker blue
```
- Darker blue background
- Cursor changes to pointer

**Disabled State:**
```
[💬 Chat with Doctor] ← Grayed out
```
- Gray background
- Not clickable
- (Only if no doctor assigned)

## Need More Help?

### Check These Files:
1. `CHAT_ONLY_IMPLEMENTATION.md` - Technical details
2. `SOCKET_IO_SETUP_COMPLETE.md` - Setup guide
3. `START_SERVERS.md` - How to start servers

### Common Commands:

**Start Backend:**
```bash
cd backend
npm start
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

**Check Backend Health:**
```bash
curl http://localhost:5000/api/health
```

## Success Indicators

✅ You should see:
- Chat buttons on appointment cards
- Blue colored buttons
- "Chat with Doctor" or "Chat" text
- MessageSquare icon (💬)

❌ If you don't see:
- Any buttons at all → Check if you have appointments
- Grayed out buttons → Check appointment data
- Error when clicking → Check backend connection

---

**Still having issues?** Check the browser console (F12) for error messages and verify both backend and frontend servers are running.
