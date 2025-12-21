# Consultation Flow - Troubleshooting Guide

## 🔍 Common Issues and Solutions

### Issue 1: "Failed to start consultation" Error

**Symptoms:**
- Click "Start Consultation" button
- Error toast appears: "Failed to start consultation"
- Console shows 404 error or invalid ID error

**Possible Causes:**

#### Cause A: Invalid Appointment ID Format
**Problem:** Appointment ID is not a valid MongoDB ObjectId (should be 24 hex characters)

**Example of Invalid ID:**
```
6909368  ❌ Too short
abc123   ❌ Too short
12345678901234567890123456789  ❌ Too long
```

**Example of Valid ID:**
```
673456789abcdef012345678  ✅ Correct (24 hex characters)
```

**Solution:**
1. Check browser console for appointment data
2. Look for log: "ConsultationPanel received appointment:"
3. Verify `_id` field is 24 hex characters
4. If not, the appointment data from the dashboard is incorrect

**How to Fix:**
- Ensure appointments are created with proper MongoDB ObjectIds
- Check the appointment creation endpoint
- Verify database has correct ID format

#### Cause B: Missing Patient ID
**Problem:** Appointment doesn't have `patientId` field

**Solution:**
- Warning banner will show: "⚠️ Patient ID is missing"
- You can still start consultation, but clinical tools won't work
- Need to link appointment to a patient

**How to Fix:**
- When creating appointments, include `patientId`
- Update existing appointments to add `patientId`

#### Cause C: Appointment Not Found in Database
**Problem:** Appointment ID doesn't exist in database

**Solution:**
1. Check if appointment was deleted
2. Verify database connection
3. Check if using correct database

---

### Issue 2: Clinical Tools Not Working

**Symptoms:**
- Can start consultation
- But cannot save prescriptions/labs/referrals
- Error: "Patient ID is missing"

**Cause:** Appointment missing `patientId`

**Solution:**
1. Check warning banner at top of consultation panel
2. If it says "Patient ID is missing", you need to:
   - Close consultation
   - Update appointment to include `patientId`
   - Reopen consultation

**How to Add Patient ID:**
```javascript
// Update appointment
await axios.patch(`/api/appointments/${appointmentId}`, {
  patientId: "actual_patient_id_here"
});
```

---

### Issue 3: Medical Record Not Created

**Symptoms:**
- Consultation completes successfully
- But no medical record appears in patient dashboard

**Possible Causes:**

#### Cause A: Missing Patient ID or Doctor ID
**Check:** Backend logs should show:
```
Skipping medical record creation - missing patientId or doctorId
```

**Solution:** Ensure appointment has both `patientId` and `doctorId`

#### Cause B: No Clinical Data
**Check:** If no prescriptions, labs, or referrals were created, medical record might be empty

**Solution:** Medical record is still created, but with minimal data

#### Cause C: Database Error
**Check:** Backend logs for errors like:
```
Error creating medical record: [error details]
```

**Solution:** Check database connection and permissions

---

### Issue 4: Real-Time Updates Not Working

**Symptoms:**
- Doctor completes consultation
- Patient dashboard doesn't update automatically

**Possible Causes:**

#### Cause A: Socket.IO Not Connected
**Check:** Browser console for:
```
Socket.IO connection established
```

**Solution:**
1. Verify backend Socket.IO server is running
2. Check CORS configuration
3. Ensure patient is logged in

#### Cause B: Patient Not Online
**Check:** Patient must be logged in and have dashboard open

**Solution:** Patient needs to refresh dashboard manually or wait for auto-refresh (5 seconds)

---

## 🛠️ Debugging Steps

### Step 1: Check Appointment Data

Open browser console and look for:
```
ConsultationPanel received appointment: {
  _id: "673456789abcdef012345678",  // Should be 24 hex chars
  patientId: "673456789abcdef012345679",  // Should exist
  patientName: "John Doe",
  status: "scheduled",
  ...
}
```

**What to Check:**
- ✅ `_id` is 24 hex characters
- ✅ `patientId` exists and is 24 hex characters
- ✅ `status` is valid
- ✅ All required fields present

### Step 2: Check API Request

Look for console log:
```
Starting consultation for appointment: 673456789abcdef012345678
```

Then check response:
```
Consultation started successfully: { success: true, data: {...} }
```

**If you see error:**
```
Error starting consultation: AxiosError
Error response: { success: false, error: "Appointment not found" }
```

This means:
- Appointment ID is invalid
- Appointment doesn't exist in database
- Database connection issue

### Step 3: Check Backend Logs

Look for:
```
PATCH /api/appointments/673456789abcdef012345678
Appointment updated successfully
```

**If you see:**
```
Error: Appointment not found
```

Check:
1. Is appointment ID correct?
2. Does appointment exist in database?
3. Is database connected?

### Step 4: Check Database

Connect to MongoDB and verify:
```javascript
// MongoDB shell
db.appointments.findOne({ _id: ObjectId("673456789abcdef012345678") })
```

Should return appointment document with:
- `_id`: Valid ObjectId
- `patientId`: Valid ObjectId
- `doctorId`: Valid ObjectId
- `status`: Current status

---

## 🔧 Quick Fixes

### Fix 1: Invalid Appointment ID

**Problem:** ID is not 24 hex characters

**Quick Fix:**
```javascript
// Check if ID is valid
const isValid = /^[a-f\d]{24}$/i.test(appointmentId);
if (!isValid) {
  console.error('Invalid ID:', appointmentId);
  // Don't proceed
}
```

### Fix 2: Missing Patient ID

**Quick Fix:**
```javascript
// Add patient ID to appointment
const response = await axios.patch(`/api/appointments/${appointmentId}`, {
  patientId: patientId  // Add this
});
```

### Fix 3: Database Connection

**Quick Fix:**
```bash
# Check if MongoDB is running
mongosh

# Check connection in backend
# Look for: "MongoDB Connected"
```

---

## 📊 Error Messages Reference

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Failed to start consultation" | Generic error | Check console for details |
| "Invalid appointment: Missing ID" | No `_id` field | Check appointment data |
| "Invalid appointment ID format" | ID not 24 hex chars | Fix appointment creation |
| "Appointment not found" | ID doesn't exist in DB | Verify database |
| "Patient ID is missing" | No `patientId` | Add patient ID to appointment |
| "Failed to save prescription" | Missing patient ID or API error | Check patient ID and backend logs |

---

## 🎯 Prevention Tips

### 1. Always Include Required Fields

When creating appointments:
```javascript
const appointment = {
  name: "John Doe",
  email: "john@example.com",
  patientId: "673456789abcdef012345679",  // ✅ Include
  doctorId: "673456789abcdef012345683",   // ✅ Include
  date: "2025-11-05",
  time: "09:00",
  service: "General Consultation",
  status: "scheduled"
};
```

### 2. Validate IDs Before Use

```javascript
const isValidObjectId = (id) => {
  return /^[a-f\d]{24}$/i.test(id);
};

if (!isValidObjectId(appointmentId)) {
  throw new Error('Invalid appointment ID');
}
```

### 3. Add Error Boundaries

```tsx
<ErrorBoundary>
  <ConsultationPanel appointment={appointment} />
</ErrorBoundary>
```

### 4. Log Important Data

```javascript
console.log('Appointment data:', appointment);
console.log('Patient ID:', appointment.patientId);
console.log('Doctor ID:', appointment.doctorId);
```

---

## 🚨 Emergency Fixes

### If Consultation is Stuck

1. **Close the panel**
2. **Refresh the page**
3. **Check appointment status in database**
4. **Manually update if needed:**
   ```javascript
   db.appointments.updateOne(
     { _id: ObjectId("appointment_id") },
     { $set: { status: "scheduled" } }
   );
   ```

### If Medical Record Not Created

1. **Check backend logs for errors**
2. **Manually create medical record:**
   ```javascript
   POST /api/patients/:patientId/medical-records
   {
     "appointmentId": "appointment_id",
     "doctorId": "doctor_id",
     "visitDate": "2025-11-05",
     "chiefComplaint": "General Consultation",
     ...
   }
   ```

---

## 📞 Getting Help

If issues persist:

1. **Check all logs:**
   - Browser console
   - Backend console
   - Database logs

2. **Gather information:**
   - Appointment ID
   - Patient ID
   - Doctor ID
   - Error messages
   - Screenshots

3. **Verify data:**
   - Check database directly
   - Verify IDs are valid
   - Check all required fields

4. **Test with valid data:**
   - Create new appointment with all fields
   - Use valid MongoDB ObjectIds
   - Test with known working data

---

## ✅ Checklist

Before reporting an issue, verify:

- [ ] Appointment ID is 24 hex characters
- [ ] Patient ID exists and is valid
- [ ] Doctor ID exists and is valid
- [ ] Database is connected
- [ ] Backend server is running
- [ ] Frontend can reach backend
- [ ] No CORS errors
- [ ] Socket.IO is connected
- [ ] All required fields present
- [ ] No validation errors

---

*Last Updated: November 5, 2025*  
*Version: 1.0.2*
