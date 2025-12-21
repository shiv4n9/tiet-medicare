# Consultation Flow - UI Guide

## 🎨 Visual Walkthrough

### 1. Doctor Dashboard - Initial View

```
┌─────────────────────────────────────────────────────────────┐
│  🏥 TIET Medicare - Doctor Dashboard                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Today's Stats                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ 📅 Today │ │ ✅ Seen  │ │ ⏰ Pending│ │ 🚨 Alerts│     │
│  │    8     │ │    3     │ │    5     │ │    0     │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                              │
│  📋 Today's Schedule                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 09:00  👤 John Doe                                   │  │
│  │        25 years • Male • General Checkup             │  │
│  │        📞 123-456-7890                               │  │
│  │        [💬 Chat] [🩺 Consult] [✅ Complete] [❌ Cancel]│  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 11:45  👤 Jane Smith                                 │  │
│  │        30 years • Female • Follow-up                 │  │
│  │        📞 098-765-4321                               │  │
│  │        [💬 Chat] [🩺 Consult] [✅ Complete] [❌ Cancel]│  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  🩺 Clinical Tools                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ 💊 Rx    │ │ 🧪 Labs  │ │ 👥 Refer │                   │
│  │ Active   │ │ Active   │ │ Active   │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Click "Consult" Button - Consultation Panel Opens

```
┌─────────────────────────────────────────────────────────────┐
│  🩺 Consultation Panel                              [✕]     │
├─────────────────────────────────────────────────────────────┤
│  👤 John Doe                                                │
│  25 years • Male • General Checkup                          │
│  🟡 Not Started                                             │
│  [▶️ Start Consultation]                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ⚠️ Start Consultation to Enable Clinical Tools            │
│                                                              │
│  Click "Start Consultation" to begin and access             │
│  prescriptions, lab orders, and referrals.                  │
│                                                              │
│  🔒 Clinical tools are currently disabled                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. After Clicking "Start Consultation"

```
┌─────────────────────────────────────────────────────────────┐
│  🩺 Consultation Panel                              [✕]     │
├─────────────────────────────────────────────────────────────┤
│  👤 John Doe                                                │
│  25 years • Male • General Checkup                          │
│  🟢 In Progress                                             │
├─────────────────────────────────────────────────────────────┤
│  [💊 Prescription] [🧪 Lab Orders] [👥 Referral]           │
├─────────────────────────────────────────────────────────────┤
│  💊 Create Prescription                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Medication Name                                      │  │
│  │ [e.g., Amoxicillin________________] (Press Enter)   │  │
│  │                                                      │  │
│  │ Added Medications:                                   │  │
│  │ ┌────────────────────────────────────────────────┐  │  │
│  │ │ Amoxicillin                              [✕]   │  │  │
│  │ │ 500mg - Twice daily for 5 days                 │  │  │
│  │ └────────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │ Instructions                                         │  │
│  │ [Take after meals_____________________________]     │  │
│  │ [____________________________________________]     │  │
│  │                                                      │  │
│  │ [💾 Save Prescription]                              │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Ready to complete consultation                             │
│  [Cancel] [✅ Complete Consultation]                        │
└─────────────────────────────────────────────────────────────┘
```

### 4. Lab Orders Tab

```
┌─────────────────────────────────────────────────────────────┐
│  🩺 Consultation Panel                              [✕]     │
├─────────────────────────────────────────────────────────────┤
│  👤 John Doe                                                │
│  25 years • Male • General Checkup                          │
│  🟢 In Progress                                             │
├─────────────────────────────────────────────────────────────┤
│  [💊 Prescription] [🧪 Lab Orders] [👥 Referral]           │
├─────────────────────────────────────────────────────────────┤
│  🧪 Order Lab Tests                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Test Name                                            │  │
│  │ [e.g., Complete Blood Count_______] (Press Enter)   │  │
│  │                                                      │  │
│  │ Ordered Tests:                                       │  │
│  │ ┌────────────────────────────────────────────────┐  │  │
│  │ │ Complete Blood Count                     [✕]   │  │  │
│  │ │ Blood Test - routine                           │  │  │
│  │ └────────────────────────────────────────────────┘  │  │
│  │ ┌────────────────────────────────────────────────┐  │  │
│  │ │ Lipid Profile                            [✕]   │  │  │
│  │ │ Blood Test - routine                           │  │  │
│  │ └────────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │ Clinical Notes                                       │  │
│  │ [Routine checkup, patient reports fatigue_____]     │  │
│  │ [____________________________________________]     │  │
│  │                                                      │  │
│  │ [💾 Save Lab Order]                                 │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Ready to complete consultation                             │
│  [Cancel] [✅ Complete Consultation]                        │
└─────────────────────────────────────────────────────────────┘
```

### 5. Referral Tab

```
┌─────────────────────────────────────────────────────────────┐
│  🩺 Consultation Panel                              [✕]     │
├─────────────────────────────────────────────────────────────┤
│  👤 John Doe                                                │
│  25 years • Male • General Checkup                          │
│  🟢 In Progress                                             │
├─────────────────────────────────────────────────────────────┤
│  [💊 Prescription] [🧪 Lab Orders] [👥 Referral]           │
├─────────────────────────────────────────────────────────────┤
│  👥 Create Referral                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Specialist                                           │  │
│  │ [Doctor ID or name_________________________]        │  │
│  │                                                      │  │
│  │ Reason for Referral                                  │  │
│  │ [Patient requires cardiology consultation____]      │  │
│  │ [for persistent chest pain___________________]      │  │
│  │ [____________________________________________]     │  │
│  │                                                      │  │
│  │ Priority                                             │  │
│  │ [Routine ▼]                                         │  │
│  │   • Routine                                          │  │
│  │   • Urgent                                           │  │
│  │   • Emergency                                        │  │
│  │                                                      │  │
│  │ [💾 Save Referral]                                  │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Ready to complete consultation                             │
│  [Cancel] [✅ Complete Consultation]                        │
└─────────────────────────────────────────────────────────────┘
```

### 6. After Completing Consultation - Success Toast

```
┌─────────────────────────────────────────────────────────────┐
│  🏥 TIET Medicare - Doctor Dashboard                        │
├─────────────────────────────────────────────────────────────┤
│                                          ┌──────────────┐   │
│                                          │ ✅ Success!  │   │
│                                          │ Consultation │   │
│                                          │ completed    │   │
│                                          └──────────────┘   │
│  📊 Today's Stats                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ 📅 Today │ │ ✅ Seen  │ │ ⏰ Pending│ │ 🚨 Alerts│     │
│  │    8     │ │    4     │ │    4     │ │    0     │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                              │
│  📋 Today's Schedule                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 11:45  👤 Jane Smith                                 │  │
│  │        30 years • Female • Follow-up                 │  │
│  │        📞 098-765-4321                               │  │
│  │        [💬 Chat] [🩺 Consult] [✅ Complete] [❌ Cancel]│  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 7. Patient Dashboard - Before Update

```
┌─────────────────────────────────────────────────────────────┐
│  🏥 Patient Portal - Dashboard                              │
├─────────────────────────────────────────────────────────────┤
│  📊 Quick Stats                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ 📅 Appts │ │ 💊 Active│ │ 📄 Records│ │ 🧪 Pending│    │
│  │    2     │ │    0     │ │    5     │ │    0     │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                              │
│  💊 Active Prescriptions                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 💊 No active prescriptions                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  📄 Recent Medical Records                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📄 No medical records available                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 8. Patient Dashboard - After Real-Time Update (5 seconds later)

```
┌─────────────────────────────────────────────────────────────┐
│  🏥 Patient Portal - Dashboard                    🔄 Live   │
├─────────────────────────────────────────────────────────────┤
│  📊 Quick Stats                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ 📅 Appts │ │ 💊 Active│ │ 📄 Records│ │ 🧪 Pending│    │
│  │    2     │ │    1     │ │    6     │ │    2     │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                              │
│  🔔 Today's Appointments                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ✅ You have 1 appointment today                      │  │
│  │ ┌────────────────────────────────────────────────┐  │  │
│  │ │ Dr. Smith                                      │  │  │
│  │ │ 09:00 - General Checkup                        │  │  │
│  │ │ [💬 Chat with Doctor]                          │  │  │
│  │ └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  💊 Active Prescriptions                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ┌────────────────────────────────────────────────┐  │  │
│  │ │ Amoxicillin                            🟢 Active│  │  │
│  │ │ 500mg - Twice daily                            │  │  │
│  │ │ Duration: 5 days                               │  │  │
│  │ └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  📄 Recent Medical Records                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ┌────────────────────────────────────────────────┐  │  │
│  │ │ Dr. Smith                    Nov 5, 2025       │  │  │
│  │ │ General Checkup - Routine examination          │  │  │
│  │ │ [👁️ View Details]                              │  │  │
│  │ └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  💡 Health Insights                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 💊 Active Medications                                │  │
│  │ You have 1 active prescription. Remember to take     │  │
│  │ your medications as prescribed.                      │  │
│  │                                                      │  │
│  │ 🧪 Pending Lab Results                               │  │
│  │ You have 2 lab tests pending. Results will be        │  │
│  │ available soon.                                      │  │
│  │                                                      │  │
│  │ ✅ All Clear                                         │  │
│  │ Your recent lab results are within normal range.    │  │
│  │ Keep up the good work!                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Color Coding

### Status Colors
- 🟢 **Green** - Active, Completed, Normal, Success
- 🟡 **Yellow** - Pending, In Progress, Warning
- 🔵 **Blue** - Scheduled, Confirmed, Info
- 🔴 **Red** - Cancelled, Abnormal, Error, Critical
- ⚪ **Gray** - Disabled, Inactive

### Button Colors
- **Purple** (🩺 Consult) - Primary consultation action
- **Blue** (💬 Chat) - Communication
- **Green** (✅ Complete) - Success action
- **Red** (❌ Cancel) - Destructive action
- **Orange** (👥 Referral) - Referral action

## 📱 Responsive Design

### Desktop View (1920px)
```
┌─────────────────────────────────────────────────────────────┐
│  Full width layout with sidebar                             │
│  4-column stats grid                                        │
│  Side-by-side panels                                        │
└─────────────────────────────────────────────────────────────┘
```

### Tablet View (768px)
```
┌───────────────────────────────────┐
│  Collapsible sidebar              │
│  2-column stats grid              │
│  Stacked panels                   │
└───────────────────────────────────┘
```

### Mobile View (375px)
```
┌─────────────────┐
│  Hamburger menu │
│  1-column layout│
│  Stacked cards  │
│  Bottom nav     │
└─────────────────┘
```

## 🎭 Animations

### Consultation Panel
- **Open**: Scale from 0.9 to 1.0, fade in
- **Close**: Scale to 0.9, fade out
- **Tab Switch**: Slide transition
- **Button Hover**: Scale 1.05, lift shadow

### Dashboard Updates
- **New Item**: Slide in from left, fade in
- **Status Change**: Color transition
- **Refresh**: Rotate icon 360°
- **Toast**: Slide in from top-right

### Loading States
- **Skeleton**: Pulse animation
- **Spinner**: Rotate animation
- **Progress**: Fill animation

## 🔔 Notifications

### Toast Positions
```
┌─────────────────────────────────────┐
│                    [Toast] ← Top Right
│
│
│
│
│
│
│
│
│
│
└─────────────────────────────────────┘
```

### Toast Types
- ✅ **Success** - Green background, checkmark icon
- ❌ **Error** - Red background, X icon
- ⚠️ **Warning** - Yellow background, warning icon
- ℹ️ **Info** - Blue background, info icon

## 🎯 Interactive Elements

### Buttons
```
┌──────────────┐
│ [Button Text]│  ← Default
└──────────────┘

┌──────────────┐
│ [Button Text]│  ← Hover (lifted, darker)
└──────────────┘

┌──────────────┐
│ [Button Text]│  ← Active (pressed down)
└──────────────┘

┌──────────────┐
│ [Button Text]│  ← Disabled (grayed out)
└──────────────┘
```

### Input Fields
```
┌────────────────────────┐
│ [Placeholder text___]  │  ← Empty
└────────────────────────┘

┌────────────────────────┐
│ [User input text___]   │  ← Filled
└────────────────────────┘

┌────────────────────────┐
│ [Focused input___]     │  ← Focused (blue border)
└────────────────────────┘

┌────────────────────────┐
│ [Error input___]       │  ← Error (red border)
│ ⚠️ Error message       │
└────────────────────────┘
```

## 🎨 Theme Support

### Light Mode
- Background: White (#FFFFFF)
- Text: Dark Gray (#1F2937)
- Borders: Light Gray (#E5E7EB)
- Accents: Medical Blue (#3B82F6)

### Dark Mode
- Background: Dark Gray (#1F2937)
- Text: White (#FFFFFF)
- Borders: Gray (#374151)
- Accents: Medical Blue (#60A5FA)

## 📐 Layout Grid

```
┌─────────────────────────────────────────────────────────────┐
│  Header (Fixed)                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌──────────────────────────────────────────┐ │
│  │ Sidebar │  │ Main Content Area                        │ │
│  │         │  │                                          │ │
│  │ Nav     │  │ Stats Grid (4 columns)                   │ │
│  │ Links   │  │                                          │ │
│  │         │  │ Content Cards                            │ │
│  │         │  │                                          │ │
│  │         │  │                                          │ │
│  └─────────┘  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎬 User Flow Animation

```
Doctor Opens Dashboard
        ↓
Sees Appointment List
        ↓
Clicks "Consult" Button
        ↓
Panel Slides In (0.3s)
        ↓
Clicks "Start Consultation"
        ↓
Status Badge Changes to Green (0.2s)
        ↓
Tabs Become Enabled (0.1s)
        ↓
Adds Prescription
        ↓
Card Slides In (0.2s)
        ↓
Clicks "Complete"
        ↓
Success Toast Appears (0.3s)
        ↓
Panel Slides Out (0.3s)
        ↓
Dashboard Refreshes (0.5s)
        ↓
Patient Dashboard Updates (Real-time)
```

## 🎨 Design System

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Border Radius
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- 2xl: 24px
- full: 9999px

### Shadow Levels
- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.1)
- lg: 0 10px 15px rgba(0,0,0,0.1)
- xl: 0 20px 25px rgba(0,0,0,0.1)
- 2xl: 0 25px 50px rgba(0,0,0,0.25)

## 🎯 Accessibility

### Keyboard Navigation
- Tab: Move between elements
- Enter: Activate buttons
- Escape: Close modals
- Arrow Keys: Navigate lists

### Screen Reader Support
- ARIA labels on all interactive elements
- Semantic HTML structure
- Focus indicators
- Alt text on images

### Color Contrast
- Text: 4.5:1 minimum ratio
- Large Text: 3:1 minimum ratio
- Interactive Elements: 3:1 minimum ratio

## 🎉 Conclusion

This UI guide provides a complete visual reference for the consultation flow system. The design is:

✅ **Intuitive** - Clear visual hierarchy
✅ **Responsive** - Works on all devices
✅ **Accessible** - WCAG 2.1 compliant
✅ **Beautiful** - Modern, medical-themed design
✅ **Functional** - Efficient workflow
✅ **Consistent** - Unified design system

Use this guide as a reference when implementing or customizing the UI!
