# Appointment Not Found - Quick Fix Guide

## 🔴 Problem

**Error:** "Appointment not found" (404) when trying to start consultation

**Cause:** The appointment shown in the dashboard doesn't exist in the database

**Appointment ID:** `6009d2962e74e5e8d577`

---

## 🎯 Why This Happens

### Scenario 1: Stale Dashboard Data
- Dashboard is showing cached/old data
- Appointment was deleted from database
- Dashboard hasn't refreshed yet

### Scenario 2: Database Mismatch
- Frontend and backend using different databases
- Data not synced properly
- Test data vs production data

### Scenario 3: Appointment Deleted
- Appointment was cancelled/deleted
- Dashboard still showing it
- Need to refresh

---

## ✅ Immediate Solutions

### Solution 1: Refresh the Page

**Quick Fix:**
1. Click the refresh button (🔄) in the consultation panel header
2. Or press `F5` to reload the page
3. Dashboard will fetch fresh data from database

### Solution 2: Check Database

**Verify appointment exists:**
```bash
# MongoDB shell
mongosh

# Switch to your database
use tiet-medicare

# Find the appointment
db.appointments.findOne({ _id: ObjectId("6009d2962e74e5e8d577") })
```

**If appointment doesn't exist:**
- It was deleted or never created
- Need to create a new appointment
- Dashboard showing stale data

### Solution 3: Create New Appointment

**If appointment is missing, create a new one:**
```javascript
POST /api/appointments
{
  "name": "yes sir",
  "email": "patient@example.com",
  "patientId": "valid_patient_id",
  "doctorId": "valid_doctor_id",
  "date": "2025-11-05",
  "time": "11:45",
  "service": "General Checkup",
  "contactNumber": "1234567890",
  "status": "scheduled"
}
```

---

## 🔧 Enhanced Error Handling

### What Was Added

**1. Appointment Existence Check:**
```typescript
// Before updating, verify appointment exists
const checkResponse = await axios.get(`/api/appointments`);
const appointmentExists = allAppointments.some(apt => apt._id === appointment._id);

if (!appointmentExists) {
  toast.error('This appointment no longer exists. Please refresh.');
  return;
}
```

**2. Better Error Messages:**
- ✅ "Appointment not found. It may have been deleted. Please refresh the page."
- ✅ Shows appointment ID in panel header for debugging
- ✅ Refresh button in panel header

**3. Automatic Detection:**
- Checks if appointment exists before trying to update
- Shows clear message if not found
- Suggests refreshing the page

---

## 🛠️ Debugging Steps

### Step 1: Check Console Logs

Look for:
```
ConsultationPanel received appointment: {
  _id: "6009d2962e74e5e8d577",
  patientName: "yes sir",
  ...
}
```

### Step 2: Verify in Database

```bash
# Check if appointment exists
db.appointments.findOne({ _id: ObjectId("6009d2962e74e5e8d577") })

# If null, appointment doesn't exist
# If returns data, appointment exists
```

### Step 3: Check API Response

```bash
# Test the endpoint directly
curl http://localhost:5000/api/appointments/6009d2962e74e5e8d577

# Should return appointment data or 404
```

### Step 4: Check Dashboard Data Source

```javascript
// In browser console
console.log('Dashboard appointments:', dashboardData?.todayAppointments);

// Check if appointments have valid IDs
dashboardData?.todayAppointments.forEach(apt => {
  console.log('Appointment:', apt._id, apt.patientName);
});
```

---

## 🔄 Data Sync Issues

### Problem: Dashboard Shows Old Data

**Cause:** Dashboard cache not refreshing

**Solution:**
```typescript
// Force refresh dashboard
const { refetch } = useQuery({
  queryKey: ['doctorDashboardOverview'],
  queryFn: doctorService.getDashboardOverview,
  refetchInterval: 30000,  // Refresh every 30 seconds
  refetchOnWindowFocus: true,  // Refresh when window focused
});

// Manual refresh
refetch();
```

### Problem: Database Not Synced

**Cause:** Multiple databases or environments

**Solution:**
1. Check `.env` file for `MONGODB_URI`
2. Verify backend is connected to correct database
3. Check if using local vs cloud database

---

## 📊 Prevention

### 1. Always Validate Before Use

```typescript
// Check appointment exists before opening panel
const verifyAppointment = async (appointmentId) => {
  try {
    const response = await axios.get(`/api/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      toast.error('Appointment not found. Refreshing...');
      window.location.reload();
    }
    return null;
  }
};
```

### 2. Auto-Refresh Dashboard

```typescript
// Refresh dashboard every 30 seconds
refetchInterval: 30000,

// Refresh when window gets focus
refetchOnWindowFocus: true,

// Refresh on mount
refetchOnMount: true
```

### 3. Show Appointment Status

```tsx
// Show if appointment is stale
{appointment.updatedAt && (
  <p className="text-xs text-gray-500">
    Last updated: {new Date(appointment.updatedAt).toLocaleString()}
  </p>
)}
```

---

## 🚨 Emergency Fix

### If Stuck with Invalid Appointments

**Option 1: Clear and Recreate**
```bash
# MongoDB shell
db.appointments.deleteMany({ status: "scheduled" })

# Then create new appointments through the UI
```

**Option 2: Fix Existing Data**
```bash
# Update all appointments to ensure they have required fields
db.appointments.updateMany(
  {},
  {
    $set: {
      patientId: ObjectId("valid_patient_id"),
      doctorId: ObjectId("valid_doctor_id")
    }
  }
)
```

**Option 3: Refresh Frontend**
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
# Or clear localStorage
localStorage.clear();
window.location.reload();
```

---

## ✅ Verification Checklist

After fixing:

- [ ] Refresh the page
- [ ] Check console for appointment data
- [ ] Verify appointment ID is 24 hex characters
- [ ] Check appointment exists in database
- [ ] Try starting consultation again
- [ ] Verify error message is clear
- [ ] Check refresh button works

---

## 📞 Still Having Issues?

### Collect This Information:

1. **Appointment ID:** `6009d2962e74e5e8d577`
2. **Error Message:** "Appointment not found"
3. **Database Check Result:** Does appointment exist?
4. **Console Logs:** Full error details
5. **Environment:** Local/Production
6. **Database URI:** Which database is being used?

### Common Root Causes:

1. ✅ **Stale dashboard data** - Solution: Refresh page
2. ✅ **Deleted appointment** - Solution: Create new one
3. ✅ **Wrong database** - Solution: Check .env file
4. ✅ **Cache issue** - Solution: Clear cache
5. ✅ **Network error** - Solution: Check backend logs

---

## 🎯 Summary

**The Issue:**
- Appointment `6009d2962e74e5e8d577` shown in dashboard
- But doesn't exist in database
- Returns 404 when trying to update

**The Fix:**
1. ✅ Added appointment existence check
2. ✅ Better error messages
3. ✅ Refresh button in panel
4. ✅ Shows appointment ID for debugging
5. ✅ Suggests refreshing page

**Next Steps:**
1. Click refresh button (🔄) in consultation panel
2. Or press F5 to reload page
3. Dashboard will fetch fresh data
4. Try consultation again with valid appointment

---

*Last Updated: November 5, 2025*  
*Version: 1.0.3*
