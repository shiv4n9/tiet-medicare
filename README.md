# TIET Medicare 🏥

A comprehensive healthcare management system built with modern web technologies, designed to streamline medical operations and improve patient care.

## ✨ Features

### 🏥 Core Healthcare Features
- **Patient Management** - Complete patient records and history
- **Appointment Scheduling** - Smart booking system with availability tracking
- **Doctor Dashboard** - Comprehensive tools for medical professionals
- **Medical Records** - Secure digital health records
- **Lab Test Management** - Order tracking and results management
- **Prescription Management** - Digital prescription system
- **Real-time Messaging** - Secure communication between staff
- **Emergency Tracking** - Critical patient monitoring
- **Mental Health Support** - Integrated wellness features

### 🔐 Security & Compliance
- **Role-based Access Control** - Patient, Doctor, Admin roles
- **JWT Authentication** - Secure token-based authentication
- **Audit Trail** - Complete activity logging
- **HIPAA Compliance** - Healthcare data protection
- **Rate Limiting** - API protection and abuse prevention

### 🚀 Technical Features
- **Responsive Design** - Works on all devices
- **Real-time Updates** - Live data synchronization
- **Search & Filtering** - Advanced data discovery
- **Data Export** - Comprehensive reporting
- **API Documentation** - Complete developer resources

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Express Validator** for input validation
- **Rate Limiting** for API protection
- **Helmet** for security headers

### Frontend
- **React 18** with TypeScript
- **Vite** for lightning-fast builds
- **Tailwind CSS** for modern styling
- **shadcn/ui** component library
- **React Query** for server state management
- **React Router** for navigation
- **Framer Motion** for animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tiet-medicare
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 📁 Project Structure

```
tiet-medicare/
├── 📂 backend/
│   ├── 📂 config/          # Database configuration
│   ├── 📂 middleware/      # Auth, validation, error handling
│   ├── 📂 models/          # MongoDB schemas
│   ├── 📂 routes/          # API endpoints
│   ├── 📂 scripts/         # Utility scripts
│   └── 📄 server.js        # Main server file
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/  # Reusable UI components
│   │   ├── 📂 hooks/       # Custom React hooks
│   │   ├── 📂 pages/       # Route components
│   │   ├── 📂 services/    # API services
│   │   └── 📂 utils/       # Helper functions
│   └── 📂 public/          # Static assets
├── 📄 API_DOCUMENTATION.md # Complete API reference
├── 📄 DEPLOYMENT_GUIDE.md  # Production deployment guide
└── 📄 README.md           # This file
```

## 🔑 User Roles & Permissions

### 👤 Patient
- Book and manage appointments
- View medical records and test results
- Update personal information
- Access prescription history

### 👨‍⚕️ Doctor
- Manage patient appointments
- Create and update medical records
- Order lab tests and prescriptions
- View patient history and notes

### 👨‍💼 Admin
- User management and role assignment
- System configuration and monitoring
- Audit trail and compliance reports
- Complete system access

## 📚 API Documentation

Our RESTful API provides comprehensive endpoints:

- **Authentication** - `/api/auth/*` - User registration, login, profile management
- **Patients** - `/api/patients/*` - Patient CRUD operations
- **Appointments** - `/api/appointments/*` - Scheduling and management
- **Doctors** - `/api/doctor/*` - Doctor-specific operations
- **Lab Tests** - `/api/lab/*` - Laboratory management
- **Admin** - `/api/admin/*` - Administrative functions

📖 **[Complete API Documentation](./API_DOCUMENTATION.md)**

## 🚀 Deployment

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

### Production
```bash
# Backend
cd backend && npm run prod

# Frontend
cd frontend && npm run build
```

🚀 **[Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)**

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Database connection test
npm run check:database

# API health check
npm run health
```

## 🔒 Security Features

- **Input Validation** - Comprehensive data sanitization
- **Rate Limiting** - Protection against abuse
- **CORS Protection** - Secure cross-origin requests
- **Helmet Security** - HTTP security headers
- **JWT Authentication** - Stateless authentication
- **Password Hashing** - bcrypt with salt rounds
- **Role-based Access** - Granular permissions

## 🌟 Key Highlights

- **Modern Architecture** - Clean, scalable codebase
- **Type Safety** - Full TypeScript implementation
- **Responsive Design** - Mobile-first approach
- **Real-time Features** - Live updates and notifications
- **Comprehensive Testing** - Robust test coverage
- **Production Ready** - Deployment guides and monitoring
- **Developer Friendly** - Extensive documentation

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@tietmedicare.com
- 📖 Documentation: [API Docs](./API_DOCUMENTATION.md)
- 🚀 Deployment: [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

**Built with ❤️ for better healthcare management**