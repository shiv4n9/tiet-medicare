# Consultation Flow - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```

Backend will start on `http://localhost:5000`

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will start on `http://localhost:5173`

### 3. Test the Flow

#### As Doctor:
1. Login with doctor credentials
2. Navigate to Doctor Dashboard
3. Find an appointment in "Today's Schedule"
4. Click **"Consult"** button (purple button)
5. Click **"Start Consultation"** in the modal
6. Switch between tabs:
   - **Prescription**: Add medications
   - **Lab Orders**: Order tests
   - **Referrals**: Refer to specialists
7. Click **"Complete Consultation"**

#### As Patient:
1. Login with patient credentials
2. Navigate to Patient Dashboard
3. See new data appear automatically:
   - Active Prescriptions
   - Recent Medical Records
   - Health Insights
4. Data refreshes every 5 seconds

## 📋 API Endpoints Summary

### Start Consultation
```http
PATCH /api/appointments/:id
Content-Type: application/json

{
  "status": "in_progress",
  "startedAt": "2025-11-05T10:30:00Z"
}
```

### Create Prescription
```http
POST /api/prescriptions
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "patientId": "patient_id",
  "appointmentId": "appointment_id",
  "medications": [{
    "medicationId": "med_id",
    "dosage": "500mg",
    "frequency": "Twice daily",
    "duration": "5 days",
    "quantity": 10
  }],
  "instructions": "Take after meals"
}
```

### Create Lab Order
```http
POST /api/labs
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "patientId": "patient_id",
  "appointmentId": "appointment_id",
  "tests": [{
    "testId": "test_id",
    "name": "Complete Blood Count",
    "category": "Blood Test",
    "priority": "routine"
  }],
  "clinicalNotes": "Routine checkup"
}
```

### Create Referral
```http
POST /api/referrals
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "patientId": "patient_id",
  "appointmentId": "appointment_id",
  "referredToDoctorId": "specialist_id",
  "referredToFacility": {
    "name": "Specialist Clinic",
    "contact": { "phone": "", "email": "" }
  },
  "reasonForReferral": "Requires specialist consultation",
  "priority": "routine"
}
```

### Complete Consultation
```http
PATCH /api/appointments/:id
Content-Type: application/json

{
  "status": "completed",
  "completedAt": "2025-11-05T11:00:00Z"
}
```

### Get Patient Dashboard
```http
GET /api/patients/:patientId/dashboard
Authorization: Bearer YOUR_TOKEN
```

## 🎯 Key Features

### Clinical Tools Availability
- ❌ **Before Consultation**: All tools disabled
- ✅ **During Consultation** (in_progress): All tools enabled
- ❌ **After Consultation**: All tools disabled

### Real-Time Sync
- Patient dashboard auto-refreshes every 5 seconds
- Socket.IO events for instant updates
- Health insights generated automatically

### Validation Rules
1. Consultation must be started before creating clinical data
2. At least one action required before completing consultation
3. Only doctors can create prescriptions/labs/referrals
4. Patients can only view their own data

## 🔧 Troubleshooting

### Issue: Clinical tools not showing
**Solution**: Click "Start Consultation" button first

### Issue: Can't complete consultation
**Solution**: Add at least one prescription, lab order, or referral

### Issue: Data not syncing to patient dashboard
**Solution**: 
- Check Socket.IO connection in browser console
- Verify patient is logged in
- Refresh patient dashboard manually

### Issue: API errors
**Solution**:
- Check backend console for error messages
- Verify JWT token is valid
- Ensure MongoDB is running

## 📱 UI Components

### Doctor Dashboard
- **Consult Button**: Opens consultation panel (purple)
- **Chat Button**: Opens chat window (blue)
- **Complete Button**: Marks appointment as done (green)
- **Cancel Button**: Cancels appointment (outline)

### Consultation Panel
- **Tabs**: Switch between Prescription, Lab Orders, Referrals
- **Start Button**: Begins consultation
- **Save Buttons**: Save individual items
- **Complete Button**: Finishes consultation

### Patient Dashboard
- **Quick Stats**: Shows counts at a glance
- **Active Prescriptions**: Lists current medications
- **Recent Records**: Shows medical history
- **Health Insights**: Auto-generated recommendations
- **Auto-Refresh**: Updates every 5 seconds

## 🎨 Status Colors

- 🟢 **Green**: Active, Completed, Normal
- 🟡 **Yellow**: Pending, In Progress
- 🔵 **Blue**: Scheduled, Confirmed
- 🔴 **Red**: Cancelled, Abnormal, Critical

## 📊 Data Flow Diagram

```
┌─────────────────┐
│ Doctor Dashboard│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click "Consult" │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ Start Consultation   │
│ (status: in_progress)│
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Create Clinical Data │
│ - Prescriptions      │
│ - Lab Orders         │
│ - Referrals          │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Complete Consultation│
│ (status: completed)  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Socket.IO Event      │
│ Real-Time Update     │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Patient Dashboard    │
│ Auto-Refresh         │
└──────────────────────┘
```

## 🔐 Security Notes

- All endpoints require authentication
- Role-based access control (RBAC)
- Doctors can only access their patients
- Patients can only view their own data
- Consultation status validation

## 💡 Pro Tips

1. **Use keyboard shortcuts**: Press Enter to add medications/tests quickly
2. **Tab navigation**: Use Tab key to switch between fields
3. **Auto-save**: Data is saved immediately when you click save buttons
4. **Real-time updates**: Patient sees changes within 5 seconds
5. **Health insights**: System generates recommendations automatically

## 📞 Support

For issues or questions:
1. Check backend console logs
2. Check browser console for errors
3. Review API documentation
4. Check Socket.IO connection status

## ✅ Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] Doctor can login
- [ ] Patient can login
- [ ] Consultation panel opens
- [ ] Clinical tools work
- [ ] Data syncs to patient dashboard
- [ ] Health insights appear
- [ ] Real-time updates working

## 🎉 You're Ready!

The consultation flow system is now fully operational. Doctors can seamlessly manage consultations, and patients receive real-time updates on their dashboard. Enjoy the streamlined workflow!
