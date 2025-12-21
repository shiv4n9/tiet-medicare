# Authentication Debug Guide

## The Issue
The consultation is failing because of authentication problems. The user appears to be logged in on the frontend but the API calls are failing.

## Debug Steps

### 1. Check Browser Console
Open browser console (F12) and look for:
- `Starting consultation for appointment: [ID]`
- `Using token: Token present` or `No token`
- Any 401 Unauthorized errors

### 2. Check Local Storage
In browser console, run:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### 3. Check Network Tab
1. Open Network tab in DevTools
2. Click "Start Consultation"
3. Look for the PATCH request to `/api/appointments/[ID]`
4. Check if it has Authorization header
5. Check the response status and error

### 4. Manual Login Test
If no token is found:
1. Go to `/auth` page
2. Log in as a doctor
3. Return to dashboard
4. Try consultation again

## Expected Behavior

✅ **If Authenticated:**
- Token exists in localStorage
- API calls include Authorization header
- Consultation starts successfully

❌ **If Not Authenticated:**
- No token in localStorage
- API calls fail with 401
- Error message: "Please log in to start consultation"

## Quick Fix

If authentication is the issue:
1. **Log out completely**
2. **Clear browser storage** (Application tab → Clear storage)
3. **Log in again as a doctor**
4. **Try consultation**

The clean implementation should work once authentication is properly set up.