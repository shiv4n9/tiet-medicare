# TIET Medi-Care

![TIET Medi-Care Logo](https://via.placeholder.com/150x150)

## Overview

TIET Medi-Care is a secure web-based healthcare platform designed specifically for Thapar Institute of Engineering & Technology students and faculty. The platform revolutionizes campus healthcare by offering digital medical record management, intelligent appointment scheduling, and rapid emergency response features, all integrated with AI and IoT technologies.

## Problem Statement

The current medical service management at Thapar Institute faces several challenges:

- **Manual record-keeping** leading to data inefficiencies and potential loss
- **Lack of a centralized appointment system** causing scheduling difficulties
- **Delayed emergency response** with no quick-access ambulance request system
- **Limited real-time health monitoring** and doctor availability tracking
- **Insufficient access to mental health support** and wellness resources
- **Absence of essential medical equipment** hampering accurate diagnosis

TIET Medi-Care addresses these challenges by providing a comprehensive, secure, AI-driven, and IoT-integrated healthcare platform tailored to the campus community's needs.

## Key Features

### Medical Records & Appointments
- Digital storage and retrieval of medical histories
- Intuitive appointment scheduling interface
- Real-time doctor availability tracking

### AI-Powered Assistance
- Intelligent chatbot for symptom checking and diagnosis guidance
- Automated medicine reminders and dosage tracking
- Predictive health insights and recommendations

### Health Updates & Notifications
- Timely alerts for vaccination drives and health camps
- Important healthcare announcements and advisories
- Personalized health reminders

### Wellness Monitoring
- Integration with personal fitness devices 
- IoT-based environmental monitoring (air quality, etc.)
- Health metrics tracking and visualization

### Mental Health Support
- Access to counseling resources and appointment booking
- Stress management workshop notifications
- Collaboration with Thapar counseling cell and fitness club

### Emergency Response
- One-click ambulance request system
- Real-time ambulance tracking
- Quick access to emergency contacts and protocols

## Project Objectives

1. **Architect a Secure Digital Framework**: Develop a robust, encrypted medical platform ensuring data integrity and confidentiality.
2. **Automate Healthcare Operations**: Streamline appointment scheduling, medical record management, and emergency response.
3. **Integrate AI-Driven Diagnostics**: Deploy an advanced chatbot for symptom analysis and health insights.
4. **Optimize Emergency Response**: Implement real-time ambulance tracking and rapid dispatch protocols.
5. **Leverage IoT for Wellness Monitoring**: Utilize environmental sensors and wearable integration for health assessment.
6. **Enhance User-Centric Accessibility**: Design an intuitive interface ensuring seamless interaction for all users.

## Technology Stack

This project is built with:
- **Vite**: Next generation frontend tooling
- **TypeScript**: For type-safe code
- **React**: UI component library
- **shadcn-ui**: High-quality UI components
- **Tailwind CSS**: Utility-first CSS framework

## Getting Started

### Prerequisites
- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation Options

#### Option 1: Use your preferred IDE
```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/IshanBhardwaj2004/TIET-Medicare.git

# Step 2: Navigate to the project directory.
cd TIET-Medicare

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

#### Option 2: Edit files directly in GitHub
- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon) at the top right of the file view
- Make your changes and commit the changes

#### Option 3: Use GitHub Codespaces
- Navigate to the main page of your repository
- Click on the "Code" button (green button) near the top right
- Select the "Codespaces" tab
- Click on "New codespace" to launch a new Codespace environment
- Edit files directly within the Codespace and commit and push your changes

## Project Structure

```
└── ishanbhardwaj2004-tiet-medicare/
    ├── README.md
    ├── components.json
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.ts
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── public/
    │   ├── robots.txt
    │   └── lovable-uploads/
    └── src/
        ├── App.css
        ├── App.tsx
        ├── index.css
        ├── main.tsx
        ├── vite-env.d.ts
        ├── components/
        │   ├── AnimatedBackground.tsx
        │   ├── AppointmentCard.tsx
        │   ├── BlurEffect.tsx
        │   ├── EmergencyTracking.tsx
        │   ├── FeatureLock.tsx
        │   ├── Features.tsx
        │   ├── Footer.tsx
        │   ├── Hero.tsx
        │   ├── MedicalInterfaceCard.tsx
        │   ├── MentalHealthSupport.tsx
        │   ├── Navbar.tsx
        │   ├── ThemeToggle.tsx
        │   ├── ChatBot/
        │   │   ├── ChatBot.tsx
        │   │   ├── ChatButton.tsx
        │   │   └── ChatInterface.tsx
        │   └── ui/
        │       ├── accordion.tsx
        │       ├── alert-dialog.tsx
        │       ├── alert.tsx
        │       ├── aspect-ratio.tsx
        │       ├── avatar.tsx
        │       ├── badge.tsx
        │       ├── breadcrumb.tsx
        │       ├── button.tsx
        │       ├── calendar.tsx
        │       ├── card.tsx
        │       ├── carousel.tsx
        │       ├── chart.tsx
        │       ├── checkbox.tsx
        │       ├── collapsible.tsx
        │       ├── command.tsx
        │       ├── context-menu.tsx
        │       ├── dialog.tsx
        │       ├── drawer.tsx
        │       ├── dropdown-menu.tsx
        │       ├── form.tsx
        │       ├── hover-card.tsx
        │       ├── input-otp.tsx
        │       ├── input.tsx
        │       ├── label.tsx
        │       ├── menubar.tsx
        │       ├── navigation-menu.tsx
        │       ├── pagination.tsx
        │       ├── popover.tsx
        │       ├── progress.tsx
        │       ├── radio-group.tsx
        │       ├── resizable.tsx
        │       ├── scroll-area.tsx
        │       ├── select.tsx
        │       ├── separator.tsx
        │       ├── sheet.tsx
        │       ├── sidebar.tsx
        │       ├── skeleton.tsx
        │       ├── slider.tsx
        │       ├── sonner.tsx
        │       ├── switch.tsx
        │       ├── table.tsx
        │       ├── tabs.tsx
        │       ├── textarea.tsx
        │       ├── toast.tsx
        │       ├── toaster.tsx
        │       ├── toggle-group.tsx
        │       ├── toggle.tsx
        │       ├── tooltip.tsx
        │       ├── use-toast.ts
        │       └── auth/
        │           └── GoogleAuth.tsx
        ├── hooks/
        │   ├── use-mobile.tsx
        │   ├── use-toast.ts
        │   ├── useAuth.tsx
        │   └── useTheme.tsx
        ├── lib/
        │   └── utils.ts
        ├── pages/
        │   ├── Auth.tsx
        │   ├── Index.tsx
        │   └── NotFound.tsx
        └── utils/
            └── appointmentStorage.ts
```

## Key Components

- **Authentication**: User registration and login functionality with Google Auth integration
- **Appointment Management**: Schedule, view, and manage medical appointments
- **Emergency Tracking**: Real-time ambulance request and tracking system
- **ChatBot**: AI-powered medical assistant for symptom checking
- **Mental Health Support**: Resources and scheduling for counseling services
- **Theme Toggling**: Light and dark mode support for better accessibility

## Contributing

We welcome contributions to TIET Medi-Care! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thapar Institute of Engineering & Technology
- Thapar Counselling Cell
- Thapar Fitness Club
- All contributors and supporters of the TIET Medi-Care initiative
