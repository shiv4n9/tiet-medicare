# TIET Medicare API Documentation

## Overview
TIET Medicare is a comprehensive healthcare management system with role-based access control for patients, doctors, and administrators.

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## User Roles
- **Patient**: Can book appointments, view their medical records
- **Doctor**: Can manage patients, appointments, prescriptions, and medical records
- **Admin**: Full system access, user management, system configuration

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/register`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### POST `/login`
Authenticate user
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### GET `/me` (Protected)
Get current user profile

#### PUT `/profile` (Protected)
Update user profile

### Patient Routes (`/api/patients`)

#### GET `/` (Protected - Doctor/Admin)
Get all patients with pagination and search

#### POST `/` (Protected)
Create new patient record

#### GET `/:id` (Protected)
Get specific patient details

#### PUT `/:id` (Protected - Doctor/Admin)
Update patient information

#### DELETE `/:id` (Protected - Admin)
Delete patient record

### Appointment Routes (`/api/appointments`)

#### GET `/` (Protected)
Get appointments (filtered by user role)

#### POST `/` (Protected)
Book new appointment

#### GET `/:id` (Protected)
Get specific appointment

#### PUT `/:id` (Protected)
Update appointment

#### DELETE `/:id` (Protected)
Cancel appointment

### Doctor Routes (`/api/doctor`)

#### GET `/profile` (Protected - Doctor)
Get doctor profile

#### PUT `/profile` (Protected - Doctor)
Update doctor profile

#### GET `/patients` (Protected - Doctor)
Get assigned patients

#### GET `/appointments` (Protected - Doctor)
Get doctor's appointments

### Lab Routes (`/api/lab`)

#### GET `/tests` (Protected)
Get available lab tests

#### POST `/orders` (Protected - Doctor)
Create lab order

#### GET `/orders` (Protected)
Get lab orders

#### PUT `/orders/:id` (Protected - Doctor)
Update lab order results

### Admin Routes (`/api/admin`)

#### GET `/users` (Protected - Admin)
Get all users

#### PUT `/users/:id/role` (Protected - Admin)
Update user role

#### GET `/statistics` (Protected - Admin)
Get system statistics

#### GET `/audit-logs` (Protected - Admin)
Get audit trail

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors if applicable
  ]
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting
- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- API endpoints: 30 requests per minute

## Data Models

### User
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "role": "patient|doctor|admin",
  "authProvider": "email|google",
  "isActive": "boolean",
  "lastLogin": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Patient
```json
{
  "_id": "ObjectId",
  "name": "string",
  "age": "number",
  "symptoms": "string",
  "contactNumber": "string",
  "email": "string",
  "address": "string",
  "bloodGroup": "string",
  "gender": "string",
  "medicalHistory": "string",
  "isAdmitted": "boolean",
  "assignedDoctor": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Appointment
```json
{
  "_id": "ObjectId",
  "patientName": "string",
  "patientEmail": "string",
  "appointmentDate": "Date",
  "appointmentTime": "string",
  "department": "string",
  "doctor": "ObjectId",
  "status": "scheduled|completed|cancelled",
  "notes": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- CORS protection
- Role-based access control

## Error Handling
The API includes comprehensive error handling with:
- Validation errors
- Authentication errors
- Authorization errors
- Database errors
- Rate limiting errors

## Testing
Use the provided test scripts in the backend directory:
- `npm run test` - Run authentication tests
- `node test-connection.js` - Test database connection
- `node check-database.js` - Verify database setup