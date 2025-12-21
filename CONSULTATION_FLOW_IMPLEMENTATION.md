# Consultation Flow Implementation Guide

## Overview
This implementation provides a complete consultation flow system where clinical tools (Prescriptions, Lab Orders, Referrals) are only available during active consultations, with automatic synchronization to patient dashboards.

## 🎯 Key Features

### 1. Consultation Flow (Doctor Side)

#### Before Consultation
- Doctor clicks "Consult" button on appointment card
- System opens Consultation Panel
- Clinical tools are disabled until consultation starts
- Doctor must click "Start Consultation" to begin

#### During Consultation
When consultation starts:
- Appointment status updates to `in_progress`
- `startedAt` timestamp is recorded
- All clinical tools become enabled:
  - **Prescriptions**: Create and manage medications
  - **Lab Orders**: Order laboratory tests
  - **Referrals**: Refer patients to specialists

#### Completing Consultation
- Doctor must add at least one action (prescription, lab order, or referral)
- Click "Complete Consultation" button
- Appointment status updates to `completed`
- `completedAt` timestamp is recorded
- Clinical tools are disabled again
- Data automatically syncs to patient dashboard

### 2. Backend API Endpoints

#### Appointments
```
PATCH /api/appointments/:id
- Update appointment status (in_progress, completed)
- Record startedAt and completedAt timestamps
```

#### Prescriptions
```
POST /api/prescriptions
- Create new prescription during active consultation
- Requires: patientId, appointmentId, medications, instructions

GET /api/prescriptions?patientId=xxx
- Get prescriptions for a patient
- Filters by status (active, completed, cancelled)

GET /api/prescriptions/:id
- Get single prescription details

PATCH /api/prescriptions/:id
- Update prescription status
```

#### Lab Orders
```
POST /api/labs
- Create new lab order during active consultation
- Requires: patientId, appointmentId, tests, clinicalNotes

GET /api/labs?patientId=xxx
- Get lab orders for a patient
- Filters by status (ordered, in-progress, completed)

GET /api/labs/:id
- Get single lab order details

PATCH /api/labs/:id
- Update lab order status
```

#### Referrals
```
POST /api/referrals
- Create new referral during active consultation
- Requires: patientId, appointmentId, referredToDoctorId, reasonForReferral

GET /api/referrals?patientId=xxx
- Get referrals for a patient
- Filters by status (pending, accepted, completed)

GET /api/referrals/:id
- Get single referral details

PATCH /api/referrals/:id/status
- Update referral status
```

#### Patient Dashboard Sync
```
GET /api/patients/:id/dashboard
- Get aggregated patient dashboard data
- Returns: prescriptions, labOrders, referrals, medicalRecords, appointments, healthInsights
- Auto-generates health insights based on recent data
```

### 3. Real-Time Updates (Socket.IO)

The system uses Socket.IO for real-time synchronization:

```javascript
// When doctor creates prescription
socket.emit('clinical:prescription-created', {
  patientId: 'xxx',
  prescription: { ...prescriptionData }
});

// Patient receives update
socket.on('dashboard:prescription-update', (prescription) => {
  // Update patient dashboard UI
});
```

Events:
- `clinical:prescription-created` → `dashboard:prescription-update`
- `clinical:lab-order-created` → `dashboard:lab-order-update`
- `clinical:referral-created` → `dashboard:referral-update`
- `clinical:medical-record-created` → `dashboard:medical-record-update`

### 4. Frontend Components

#### ConsultationPanel Component
Location: `frontend/src/components/doctor/ConsultationPanel.tsx`

Features:
- Tabbed interface for Prescriptions, Lab Orders, Referrals
- Disabled state until consultation starts
- Real-time validation
- Auto-save functionality
- Complete consultation workflow

Usage:
```tsx
<ConsultationPanel
  appointment={selectedAppointment}
  onClose={() => setSelectedConsultation(null)}
  onComplete={() => {
    refetch();
    setSelectedConsultation(null);
  }}
/>
```

#### Doctor Dashboard Integration
- Added "Consult" button to each appointment card
- Opens ConsultationPanel modal
- Refreshes data after consultation completion

#### Patient Dashboard Updates
- Auto-refreshes every 5 seconds
- Displays active prescriptions
- Shows pending lab results
- Lists recent medical records
- Generates health insights

### 5. Database Models

#### Appointment Model Updates
```javascript
status: {
  type: String,
  enum: ['pending', 'confirmed', 'cancelled', 'completed', 'scheduled', 'no-show', 'in_progress'],
  default: 'pending'
},
startedAt: Date,
completedAt: Date
```

#### Prescription Model
- Links to patient, doctor, and appointment
- Supports multiple medications
- Tracks refill requests
- Status: active, completed, cancelled, expired

#### LabOrder Model
- Auto-generates order numbers
- Supports multiple tests per order
- Tracks collection and results
- Status: draft, ordered, collected, in-progress, completed, cancelled

#### Referral Model
- Auto-generates referral numbers
- Links referring and referred doctors
- Tracks clinical information
- Status: draft, pending, accepted, in-progress, completed, rejected, cancelled

### 6. Security & Authorization

All endpoints are protected with authentication middleware:
- Doctors can only create clinical data during active consultations
- Patients can only view their own data
- Doctors can only view/edit data for their patients
- Appointment status validation prevents unauthorized actions

### 7. Health Insights Generation

The system automatically generates health insights based on:
- Active prescriptions
- Pending lab results
- Upcoming appointments
- Abnormal lab results
- Completed consultations

Example insights:
- "You have 2 active prescriptions. Remember to take your medications as prescribed."
- "You have 1 lab test pending. Results will be available soon."
- "Your next appointment is on Nov 5, 2025 at 10:30 AM with Dr. Smith."
- "Your recent lab results are within normal range. Keep up the good work!"

## 🚀 Usage Flow

### Doctor Workflow
1. View today's appointments on dashboard
2. Click "Consult" button for a patient
3. Click "Start Consultation" in the panel
4. Add prescriptions, lab orders, or referrals as needed
5. Click "Complete Consultation"
6. Data automatically syncs to patient dashboard

### Patient Workflow
1. Log in to patient portal
2. View dashboard with real-time updates
3. See new prescriptions appear automatically
4. Check pending lab results
5. View health insights
6. Access medical records

## 📊 Data Flow

```
Doctor Dashboard
    ↓
Start Consultation (status: in_progress)
    ↓
Create Clinical Data (Prescriptions/Labs/Referrals)
    ↓
Complete Consultation (status: completed)
    ↓
Socket.IO Real-Time Update
    ↓
Patient Dashboard Auto-Refresh
    ↓
Health Insights Generated
```

## 🔧 Configuration

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tiet-medicare
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend API Configuration
```typescript
// frontend/src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

## 📝 Testing

### Test Consultation Flow
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login as doctor
4. Navigate to dashboard
5. Click "Consult" on an appointment
6. Test creating prescriptions, lab orders, referrals
7. Complete consultation
8. Login as patient
9. Verify data appears on patient dashboard

### API Testing with cURL

Create Prescription:
```bash
curl -X POST http://localhost:5000/api/prescriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patientId": "xxx",
    "appointmentId": "yyy",
    "medications": [{
      "medicationId": "zzz",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "quantity": 10
    }],
    "instructions": "Take after meals"
  }'
```

Get Patient Dashboard:
```bash
curl -X GET http://localhost:5000/api/patients/PATIENT_ID/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎨 UI/UX Features

- **Gradient Backgrounds**: Medical-themed color gradients
- **Real-time Indicators**: Live update badges
- **Smooth Animations**: Framer Motion transitions
- **Responsive Design**: Works on all screen sizes
- **Dark Mode Support**: Full dark theme compatibility
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error feedback

## 🔐 Security Best Practices

1. **Authentication**: JWT-based authentication
2. **Authorization**: Role-based access control
3. **Validation**: Input validation on all endpoints
4. **Sanitization**: Data sanitization to prevent XSS
5. **Rate Limiting**: API rate limiting (recommended)
6. **HTTPS**: Use HTTPS in production
7. **CORS**: Configured CORS for allowed origins

## 📈 Performance Optimizations

1. **Parallel Queries**: Use Promise.all for multiple DB queries
2. **Lean Queries**: Use .lean() for read-only operations
3. **Indexes**: Database indexes on frequently queried fields
4. **Pagination**: Limit results to prevent large payloads
5. **Caching**: Consider Redis for frequently accessed data
6. **Socket.IO**: Efficient real-time updates without polling

## 🐛 Troubleshooting

### Clinical tools not enabled
- Verify appointment status is `in_progress`
- Check console for API errors
- Ensure user has doctor role

### Data not syncing to patient dashboard
- Check Socket.IO connection
- Verify patient is logged in
- Check browser console for errors
- Ensure backend is emitting events

### Prescription creation fails
- Verify appointment is in progress
- Check patient ID is valid
- Ensure medication data is complete
- Check backend logs for errors

## 🚀 Future Enhancements

1. **Audit Trail**: Track all clinical actions
2. **E-Prescribing**: Integration with pharmacy systems
3. **Lab Integration**: Direct lab system integration
4. **Telemedicine**: Video consultation integration
5. **AI Insights**: ML-based health recommendations
6. **Mobile App**: Native mobile applications
7. **Analytics**: Advanced reporting and analytics
8. **Compliance**: HIPAA compliance features

## 📚 Additional Resources

- [Appointment Model](backend/models/Appointment.js)
- [Prescription Model](backend/models/Prescription.js)
- [LabOrder Model](backend/models/LabOrder.js)
- [Referral Model](backend/models/Referral.js)
- [Socket Handler](backend/socket/chatHandler.js)
- [Consultation Panel](frontend/src/components/doctor/ConsultationPanel.tsx)

## ✅ Implementation Checklist

- [x] Update Appointment model with in_progress status
- [x] Create Prescription routes and endpoints
- [x] Create Lab Order routes and endpoints
- [x] Create Referral routes and endpoints
- [x] Create Patient Dashboard sync endpoint
- [x] Update Socket.IO handler for real-time updates
- [x] Create ConsultationPanel component
- [x] Integrate ConsultationPanel into Doctor Dashboard
- [x] Update Patient Dashboard for auto-refresh
- [x] Add health insights generation
- [x] Implement authorization checks
- [x] Add validation and error handling
- [x] Create documentation

## 🎉 Conclusion

The consultation flow system is now fully implemented with:
- ✅ Clinical tools available only during active consultations
- ✅ Real-time synchronization to patient dashboards
- ✅ Comprehensive API endpoints
- ✅ Secure authorization and validation
- ✅ Beautiful, responsive UI
- ✅ Health insights generation
- ✅ Socket.IO real-time updates

The system is production-ready and follows best practices for healthcare applications!
