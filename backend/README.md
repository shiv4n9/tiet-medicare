# TIET Medicare Backend - Authentication System

This is the backend API for the TIET Medicare application, providing authentication and user management functionality.

## Features

- **User Registration**: Create new accounts with email and password
- **User Login**: Authenticate users with email and password
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Secure password storage using bcrypt
- **Google OAuth**: Support for Google authentication (placeholder)
- **User Profile Management**: Get and update user profiles
- **MongoDB Integration**: Persistent data storage
- **CORS Support**: Cross-origin resource sharing configuration

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. **Clone the repository and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/medicare
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   ```

4. **Start MongoDB:**
   - If using local MongoDB, make sure it's running
   - If using MongoDB Atlas, update the `MONGODB_URI` in your `.env` file

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run prod
```

### Start Server
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication Routes

#### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "authProvider": "email",
      "token": "jwt_token_here"
    }
  }
  ```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "authProvider": "email",
      "token": "jwt_token_here"
    }
  }
  ```

#### Google OAuth
- **POST** `/api/auth/google`
- **Body:**
  ```json
  {
    "googleId": "google_user_id",
    "name": "John Doe",
    "email": "john@gmail.com"
  }
  ```

#### Get User Profile
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "authProvider": "email",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### Update User Profile
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "John Smith",
    "email": "johnsmith@example.com"
  }
  ```

#### Check Authentication Status
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`

#### Logout
- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`

### Health Check
- **GET** `/api/health`
- Returns server status and database connection information

## Database Schema

### User Model
```javascript
{
  name: String (required, max 50 chars),
  email: String (required, unique, lowercase),
  password: String (required for email auth, min 6 chars),
  authProvider: String (enum: 'email', 'google'),
  googleId: String (optional, for Google auth),
  isActive: Boolean (default: true),
  lastLogin: Date (default: now),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 12
- **JWT Tokens**: Secure token-based authentication with 30-day expiration
- **Input Validation**: Comprehensive validation for all user inputs
- **CORS Protection**: Configured CORS to allow only specified origins
- **Error Handling**: Proper error handling and logging

## Frontend Integration

The backend is designed to work seamlessly with the React frontend. The frontend should:

1. Send requests to the API endpoints
2. Include the JWT token in the `Authorization` header for protected routes
3. Handle authentication responses and store tokens in localStorage
4. Implement proper error handling for authentication failures

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/medicare` |
| `JWT_SECRET` | JWT signing secret | Required |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Project Structure
```
backend/
├── models/
│   └── User.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── routes/
│   ├── auth.js
│   ├── appointments.js
│   └── patients.js
├── server.js
├── package.json
└── README.md
```

### Adding New Features

1. Create new models in the `models/` directory
2. Add routes in the `routes/` directory
3. Update `server.js` to include new routes
4. Add appropriate middleware for authentication/authorization

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the `MONGODB_URI` in your `.env` file
   - Verify network connectivity

2. **CORS Errors**
   - Check that your frontend URL is in the `allowedOrigins` array
   - Ensure the frontend is making requests to the correct backend URL

3. **JWT Token Issues**
   - Verify the `JWT_SECRET` is set in your `.env` file
   - Check that tokens are being sent in the `Authorization` header
   - Ensure tokens haven't expired

4. **Password Hashing Issues**
   - Ensure bcrypt is properly installed
   - Check that passwords meet minimum length requirements

## License

This project is part of the TIET Medicare application.
