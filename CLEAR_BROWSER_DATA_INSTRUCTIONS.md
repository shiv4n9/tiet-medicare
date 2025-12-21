# Clear Browser Data Instructions

## 🚨 Immediate Fix Required

The appointment ID corruption is likely caused by browser cache or storage. Follow these steps:

## 1. Clear Browser Cache (CRITICAL)

### Chrome/Edge:
1. Press `Ctrl + Shift + Delete`
2. Select "All time" 
3. Check all boxes:
   - Browsing history
   - Cookies and other site data
   - Cached images and files
   - **Local storage data**
   - **Session storage data**
4. Click "Clear data"

### Alternative (Hard Refresh):
1. Press `Ctrl + Shift + R` (hard refresh)
2. Or press `F12` → Right-click refresh button → "Empty Cache and Hard Reload"

## 2. Clear Application Storage

### Using Developer Tools:
1. Press `F12` to open DevTools
2. Go to "Application" tab
3. Under "Storage":
   - Clear **Local Storage** for localhost:3000
   - Clear **Session Storage** for localhost:3000
   - Clear **IndexedDB** if any
4. Go to "Network" tab
5. Check "Disable cache"

## 3. Restart Browser
1. Close all browser windows
2. Reopen browser
3. Navigate to `localhost:3000/doctor`

## 4. Test the Fix
1. Login as doctor
2. Check browser console for new logs
3. Try "Start Consultation" 
4. Should now show valid 24-character appointment IDs

## 🔍 What to Look For

After clearing cache, you should see in console:
- ✅ Valid appointment IDs (24 characters)
- ✅ "VALID" validation messages
- ✅ Successful consultation start

If you still see:
- ❌ 26-character IDs like `6467b2db147d7d2a6e427775`
- ❌ "INVALID" validation messages
- ❌ 404 errors

Then there's a deeper issue that needs investigation.

## 5. Alternative: Incognito Mode
Try opening the application in incognito/private browsing mode to test with completely clean storage.

## 6. If Issue Persists
If clearing cache doesn't work, the issue might be:
1. Service Worker caching
2. Proxy/CDN caching
3. React Query persistent cache
4. Database sync issue

Let me know if the issue persists after clearing browser data!