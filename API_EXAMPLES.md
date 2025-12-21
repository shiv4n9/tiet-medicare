# Consultation Flow API - Request Examples

## 🔐 Authentication

All requests require a JWT token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📋 Complete Consultation Flow Examples

### 1. Start Consultation

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/appointments/673456789abcdef012345678 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "in_progress",
    "startedAt": "2025-11-05T10:30:00Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "673456789abcdef012345678",
    "patientName": "John Doe",
    "patientAge": 25,
    "patientGender": "Male",
    "doctor": "Dr. Smith",
    "status": "in_progress",
    "startedAt": "2025-11-05T10:30:00.000Z",
    "date": "2025-11-05T00:00:00.000Z",
    "time": "09:00"
  }
}
```

### 2. Create Prescription

**Request:**
```bash
curl -X POST http://localhost:5000/api/prescriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "patientId": "673456789abcdef012345679",
    "appointmentId": "673456789abcdef012345678",
    "medications": [
      {
        "medicationId": "673456789abcdef012345680",
        "dosage": "500mg",
        "frequency": "Twice daily",
        "duration": "5 days",
        "instructions": "Take after meals",
        "quantity": 10
      },
      {
        "medicationId": "673456789abcdef012345681",
        "dosage": "10mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "instructions": "Take before bedtime",
        "quantity": 30
      }
    ],
    "instructions": "Complete the full course of antibiotics. Take pain medication as needed.",
    "notes": "Patient reports mild headache and fever"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "673456789abcdef012345682",
    "patientId": {
      "_id": "673456789abcdef012345679",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25,
      "gender": "Male"
    },
    "doctorId": {
      "_id": "673456789abcdef012345683",
      "name": "Dr. Smith",
      "specialization": "General Medicine"
    },
    "appointmentId": "673456789abcdef012345678",
    "medications": [
      {
        "medicationId": {
          "_id": "673456789abcdef012345680",
          "name": "Amoxicillin",
          "genericName": "Amoxicillin",
          "category": "Antibiotic"
        },
        "dosage": "500mg",
        "frequency": "Twice daily",
        "duration": "5 days",
        "instructions": "Take after meals",
        "quantity": 10,
        "isActive": true
      },
      {
        "medicationId": {
          "_id": "673456789abcdef012345681",
          "name": "Ibuprofen",
          "genericName": "Ibuprofen",
          "category": "Pain Reliever"
        },
        "dosage": "10mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "instructions": "Take before bedtime",
        "quantity": 30,
        "isActive": true
      }
    ],
    "instructions": "Complete the full course of antibiotics. Take pain medication as needed.",
    "notes": "Patient reports mild headache and fever",
    "status": "active",
    "createdAt": "2025-11-05T10:35:00.000Z",
    "updatedAt": "2025-11-05T10:35:00.000Z"
  }
}
```

### 3. Create Lab Order

**Request:**
```bash
curl -X POST http://localhost:5000/api/labs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "patientId": "673456789abcdef012345679",
    "appointmentId": "673456789abcdef012345678",
    "tests": [
      {
        "testId": "673456789abcdef012345684",
        "name": "Complete Blood Count",
        "category": "Hematology",
        "priority": "routine",
        "notes": "Check for infection"
      },
      {
        "testId": "673456789abcdef012345685",
        "name": "Lipid Profile",
        "category": "Chemistry",
        "priority": "routine",
        "notes": "Annual checkup"
      }
    ],
    "clinicalNotes": "Patient reports fatigue and dizziness. Routine annual checkup.",
    "diagnosisCode": "R53.83"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "673456789abcdef012345686",
    "orderNumber": "LAB-202511000001",
    "patientId": {
      "_id": "673456789abcdef012345679",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25,
      "gender": "Male"
    },
    "doctorId": {
      "_id": "673456789abcdef012345683",
      "name": "Dr. Smith",
      "specialization": "General Medicine"
    },
    "appointmentId": "673456789abcdef012345678",
    "tests": [
      {
        "testId": "673456789abcdef012345684",
        "name": "Complete Blood Count",
        "category": "Hematology",
        "priority": "routine",
        "status": "ordered",
        "notes": "Check for infection"
      },
      {
        "testId": "673456789abcdef012345685",
        "name": "Lipid Profile",
        "category": "Chemistry",
        "priority": "routine",
        "status": "ordered",
        "notes": "Annual checkup"
      }
    ],
    "clinicalNotes": "Patient reports fatigue and dizziness. Routine annual checkup.",
    "diagnosisCode": "R53.83",
    "status": "ordered",
    "createdAt": "2025-11-05T10:40:00.000Z",
    "updatedAt": "2025-11-05T10:40:00.000Z"
  }
}
```

### 4. Create Referral

**Request:**
```bash
curl -X POST http://localhost:5000/api/referrals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "patientId": "673456789abcdef012345679",
    "appointmentId": "673456789abcdef012345678",
    "referredToDoctorId": "673456789abcdef012345687",
    "referredToFacility": {
      "name": "City Cardiology Center",
      "address": {
        "street": "123 Medical Plaza",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "USA"
      },
      "contact": {
        "phone": "+1-555-0123",
        "email": "info@citycardiology.com"
      }
    },
    "reasonForReferral": "Patient reports persistent chest pain and shortness of breath. Requires cardiology evaluation for possible coronary artery disease.",
    "clinicalInformation": {
      "diagnosis": "Chest pain, unspecified",
      "relevantHistory": "Hypertension for 5 years, family history of heart disease",
      "currentMedications": [
        {
          "name": "Lisinopril",
          "dosage": "10mg",
          "frequency": "Once daily"
        }
      ],
      "allergies": ["Penicillin"],
      "recentLabResults": ["Elevated cholesterol"],
      "imagingResults": []
    },
    "requestedServices": [
      {
        "type": "consultation",
        "description": "Cardiology consultation and evaluation",
        "urgency": "urgent"
      },
      {
        "type": "diagnostic-test",
        "description": "ECG and stress test",
        "urgency": "urgent"
      }
    ],
    "priority": "urgent",
    "notes": "Patient is anxious about symptoms. Please expedite appointment."
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "673456789abcdef012345688",
    "referralNumber": "REF-202511000001",
    "patientId": {
      "_id": "673456789abcdef012345679",
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25,
      "gender": "Male"
    },
    "referringDoctorId": {
      "_id": "673456789abcdef012345683",
      "name": "Dr. Smith",
      "specialization": "General Medicine"
    },
    "referredToDoctorId": {
      "_id": "673456789abcdef012345687",
      "name": "Dr. Johnson",
      "specialization": "Cardiology"
    },
    "referredToFacility": {
      "name": "City Cardiology Center",
      "address": {
        "street": "123 Medical Plaza",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "USA"
      },
      "contact": {
        "phone": "+1-555-0123",
        "email": "info@citycardiology.com"
      }
    },
    "reasonForReferral": "Patient reports persistent chest pain and shortness of breath. Requires cardiology evaluation for possible coronary artery disease.",
    "clinicalInformation": {
      "diagnosis": "Chest pain, unspecified",
      "relevantHistory": "Hypertension for 5 years, family history of heart disease",
      "currentMedications": [
        {
          "name": "Lisinopril",
          "dosage": "10mg",
          "frequency": "Once daily"
        }
      ],
      "allergies": ["Penicillin"],
      "recentLabResults": ["Elevated cholesterol"],
      "imagingResults": []
    },
    "requestedServices": [
      {
        "type": "consultation",
        "description": "Cardiology consultation and evaluation",
        "urgency": "urgent"
      },
      {
        "type": "diagnostic-test",
        "description": "ECG and stress test",
        "urgency": "urgent"
      }
    ],
    "status": "pending",
    "priority": "urgent",
    "notes": "Patient is anxious about symptoms. Please expedite appointment.",
    "metadata": {
      "createdBy": "673456789abcdef012345683",
      "lastModified": "2025-11-05T10:45:00.000Z",
      "version": 1,
      "isActive": true
    },
    "createdAt": "2025-11-05T10:45:00.000Z",
    "updatedAt": "2025-11-05T10:45:00.000Z"
  }
}
```

### 5. Complete Consultation

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/appointments/673456789abcdef012345678 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "completed",
    "completedAt": "2025-11-05T11:00:00Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "673456789abcdef012345678",
    "patientName": "John Doe",
    "patientAge": 25,
    "patientGender": "Male",
    "doctor": "Dr. Smith",
    "status": "completed",
    "startedAt": "2025-11-05T10:30:00.000Z",
    "completedAt": "2025-11-05T11:00:00.000Z",
    "date": "2025-11-05T00:00:00.000Z",
    "time": "09:00"
  }
}
```

### 6. Get Patient Dashboard

**Request:**
```bash
curl -X GET http://localhost:5000/api/patients/673456789abcdef012345679/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prescriptions": {
      "active": [
        {
          "_id": "673456789abcdef012345682",
          "medications": [
            {
              "medicationId": {
                "name": "Amoxicillin"
              },
              "dosage": "500mg",
              "frequency": "Twice daily",
              "duration": "5 days"
            }
          ],
          "doctorId": {
            "name": "Dr. Smith",
            "specialization": "General Medicine"
          },
          "status": "active",
          "createdAt": "2025-11-05T10:35:00.000Z"
        }
      ],
      "all": [],
      "count": {
        "active": 1,
        "total": 1
      }
    },
    "labOrders": {
      "pending": [
        {
          "_id": "673456789abcdef012345686",
          "orderNumber": "LAB-202511000001",
          "tests": [
            {
              "name": "Complete Blood Count",
              "status": "ordered"
            },
            {
              "name": "Lipid Profile",
              "status": "ordered"
            }
          ],
          "doctorId": {
            "name": "Dr. Smith"
          },
          "status": "ordered",
          "createdAt": "2025-11-05T10:40:00.000Z"
        }
      ],
      "all": [],
      "count": {
        "pending": 1,
        "total": 1
      }
    },
    "referrals": {
      "active": [
        {
          "_id": "673456789abcdef012345688",
          "referralNumber": "REF-202511000001",
          "referringDoctorId": {
            "name": "Dr. Smith"
          },
          "referredToDoctorId": {
            "name": "Dr. Johnson",
            "specialization": "Cardiology"
          },
          "reasonForReferral": "Patient reports persistent chest pain...",
          "status": "pending",
          "priority": "urgent",
          "createdAt": "2025-11-05T10:45:00.000Z"
        }
      ],
      "all": [],
      "count": {
        "active": 1,
        "total": 1
      }
    },
    "medicalRecords": {
      "recent": [],
      "count": 0
    },
    "appointments": {
      "upcoming": [],
      "all": [],
      "count": {
        "upcoming": 0,
        "total": 0
      }
    },
    "healthInsights": [
      {
        "type": "info",
        "title": "Active Medications",
        "message": "You have 1 active prescription. Remember to take your medications as prescribed.",
        "icon": "pill"
      },
      {
        "type": "warning",
        "title": "Pending Lab Results",
        "message": "You have 1 lab test pending. Results will be available soon.",
        "icon": "activity"
      }
    ],
    "lastUpdated": "2025-11-05T11:00:00.000Z"
  }
}
```

## 📊 Query Parameters

### Get Prescriptions with Filters

```bash
# Get all prescriptions for a patient
curl -X GET "http://localhost:5000/api/prescriptions?patientId=673456789abcdef012345679" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get only active prescriptions
curl -X GET "http://localhost:5000/api/prescriptions?patientId=673456789abcdef012345679&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get all prescriptions by doctor
curl -X GET "http://localhost:5000/api/prescriptions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Lab Orders with Filters

```bash
# Get all lab orders for a patient
curl -X GET "http://localhost:5000/api/labs?patientId=673456789abcdef012345679" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get only pending lab orders
curl -X GET "http://localhost:5000/api/labs?patientId=673456789abcdef012345679&status=ordered" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Referrals with Filters

```bash
# Get all referrals for a patient
curl -X GET "http://localhost:5000/api/referrals?patientId=673456789abcdef012345679" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get only pending referrals
curl -X GET "http://localhost:5000/api/referrals?patientId=673456789abcdef012345679&status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔄 Update Operations

### Update Prescription Status

```bash
curl -X PATCH http://localhost:5000/api/prescriptions/673456789abcdef012345682 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "completed",
    "notes": "Patient completed full course"
  }'
```

### Update Lab Order Status

```bash
curl -X PATCH http://localhost:5000/api/labs/673456789abcdef012345686 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "completed",
    "tests": [
      {
        "testId": "673456789abcdef012345684",
        "status": "completed",
        "result": {
          "value": "Normal",
          "abnormalFlag": "normal",
          "completedAt": "2025-11-06T10:00:00Z"
        }
      }
    ]
  }'
```

### Update Referral Status

```bash
curl -X PATCH http://localhost:5000/api/referrals/673456789abcdef012345688/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "accepted",
    "notes": "Appointment scheduled for Nov 10, 2025"
  }'
```

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Prescription can only be created during active consultation"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authorized, token failed"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Only doctors can create prescriptions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Patient not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Server error",
  "message": "Database connection failed"
}
```

## 🧪 Testing with Postman

### Import Collection

Create a Postman collection with these requests:

1. **Login** - POST `/api/auth/login`
2. **Start Consultation** - PATCH `/api/appointments/:id`
3. **Create Prescription** - POST `/api/prescriptions`
4. **Create Lab Order** - POST `/api/labs`
5. **Create Referral** - POST `/api/referrals`
6. **Complete Consultation** - PATCH `/api/appointments/:id`
7. **Get Patient Dashboard** - GET `/api/patients/:id/dashboard`

### Environment Variables

```json
{
  "baseUrl": "http://localhost:5000/api",
  "token": "{{jwt_token}}",
  "patientId": "673456789abcdef012345679",
  "doctorId": "673456789abcdef012345683",
  "appointmentId": "673456789abcdef012345678"
}
```

## 🔐 Authentication Flow

### 1. Login as Doctor

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "673456789abcdef012345683",
    "name": "Dr. Smith",
    "email": "doctor@example.com",
    "role": "doctor",
    "specialization": "General Medicine",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Use Token in Subsequent Requests

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- IDs are MongoDB ObjectIds (24 hex characters)
- Status values are case-sensitive
- Consultation must be `in_progress` to create clinical data
- Patient can only view their own data
- Doctor can only create data for their patients

## 🎯 Quick Test Script

```bash
#!/bin/bash

# Set variables
BASE_URL="http://localhost:5000/api"
TOKEN="YOUR_JWT_TOKEN"
APPOINTMENT_ID="YOUR_APPOINTMENT_ID"
PATIENT_ID="YOUR_PATIENT_ID"

# Start consultation
curl -X PATCH "$BASE_URL/appointments/$APPOINTMENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"in_progress","startedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'

# Create prescription
curl -X POST "$BASE_URL/prescriptions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "patientId":"'$PATIENT_ID'",
    "appointmentId":"'$APPOINTMENT_ID'",
    "medications":[{"medicationId":"med123","dosage":"500mg","frequency":"Twice daily","duration":"5 days","quantity":10}],
    "instructions":"Take after meals"
  }'

# Complete consultation
curl -X PATCH "$BASE_URL/appointments/$APPOINTMENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"completed","completedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'

# Get patient dashboard
curl -X GET "$BASE_URL/patients/$PATIENT_ID/dashboard" \
  -H "Authorization: Bearer $TOKEN"
```

## 🎉 Success!

You now have complete API examples for the entire consultation flow. Use these as a reference for integration and testing!
