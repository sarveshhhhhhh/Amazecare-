# PAmazeCare - Hospital Management System Frontend

A comprehensive frontend application for hospital management that perfectly integrates with your ASP.NET Core backend API.

## 🏥 Overview

PAmazeCare is a modern, responsive hospital management system frontend built with vanilla JavaScript, HTML5, and CSS3. It provides a complete interface for managing patients, doctors, appointments, medical records, prescriptions, and administrative functions.

## ✨ Features

### **Authentication & Authorization**
- Secure login and registration system
- Role-based access control (Admin, Doctor, Patient)
- JWT token management
- Session persistence

### **Dashboard**
- Real-time statistics display
- Quick action buttons
- Recent activities feed
- Role-specific content

### **Patient Management**
- Complete CRUD operations
- Paginated patient lists
- Patient profile management
- Search and filter capabilities

### **Doctor Management**
- Doctor registration and profiles
- Specialty management
- Schedule management
- Performance metrics

### **Appointment System**
- Appointment booking interface
- Calendar integration
- Status management (Scheduled, Completed, Cancelled)
- Patient-doctor matching

### **Medical Records**
- Digital medical record management
- Diagnosis tracking
- Treatment history
- Doctor notes and observations

### **Prescription Management**
- Digital prescription creation
- Medication tracking
- Dosage management
- Prescription history

### **Administrative Features**
- User management
- System configuration
- Reports and analytics
- Audit trails

## 🚀 Backend Integration

This frontend is specifically designed to work with your ASP.NET Core backend API. All endpoints are perfectly matched:

### **API Endpoints Supported:**
- **Authentication:** `/api/Auth/login`, `/api/Auth/register`
- **Patients:** `/api/Patient/*` (all CRUD operations + pagination)
- **Doctors:** `/api/Doctor/*` (all CRUD operations + pagination)
- **Appointments:** `/api/Appointment/*` (including cancellation)
- **Medical Records:** `/api/MedicalRecord/*`
- **Prescriptions:** `/api/Prescription/*`
- **Test Management:** `/api/TestMaster/*`, `/api/RecommendedTest/*`
- **Dosage Master:** `/api/DosageMaster/*`
- **Admin:** `/api/Admin/*`

### **DTO Compatibility:**
All frontend forms and data structures match your backend DTOs:
- `LoginDto`, `RegisterDto`
- `PatientDto`, `CreatePatientDto`
- `DoctorDto`, `CreateDoctorDto`
- `AppointmentDto`, `CreateAppointmentDto`, `UpdateAppointmentDto`
- `MedicalRecordDto`, `CreateMedicalRecordDto`
- `PrescriptionDto`, `CreatePrescriptionDto`
- And all other DTOs from your backend

## 📁 File Structure

```
PAmazeCare/
├── index.html          # Main HTML file with all pages
├── styles.css          # Complete CSS styling
├── config.js           # API configuration and endpoints
├── api.js              # API service layer
├── app.js              # Main application logic
└── README.md           # This documentation
```

## 🛠️ Setup Instructions

### **Prerequisites**
- Your ASP.NET Core backend running on `http://localhost:5120`
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (optional, can run locally)

### **Quick Start**
1. Ensure your backend API is running on `http://localhost:5120`
2. Open `index.html` in a web browser, or
3. Serve the files using a local web server:
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8080
   ```

### **Configuration**
If your backend runs on a different port, update the `API_BASE_URL` in `config.js`:
```javascript
const API_BASE_URL = 'http://localhost:YOUR_PORT/api';
```

## 🎨 UI/UX Features

### **Modern Design**
- Clean, professional medical interface
- Glass morphism design elements
- Responsive layout for all devices
- Intuitive navigation

### **Color Scheme**
- Primary: Medical blue (#2563eb)
- Secondary: Medical green (#10b981)
- Accent: Medical orange (#f59e0b)
- Status colors for different states

### **Interactive Elements**
- Smooth animations and transitions
- Loading states and progress indicators
- Toast notifications for user feedback
- Modal dialogs for forms

### **Accessibility**
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Semantic HTML structure

## 🔧 Technical Details

### **Architecture**
- **Frontend Framework:** Vanilla JavaScript (ES6+)
- **Styling:** CSS3 with CSS Variables
- **HTTP Client:** Fetch API
- **State Management:** Local storage + in-memory state
- **Authentication:** JWT token-based

### **Key Classes**
- `PAmazeCareApp`: Main application controller
- `ApiService`: HTTP request handler
- Global utility functions for UI interactions

### **Browser Support**
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🔐 Security Features

- JWT token storage and management
- Automatic token refresh handling
- Role-based route protection
- Input validation and sanitization
- CORS-ready configuration

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop:** Full dashboard experience
- **Tablet:** Optimized layout with collapsible sidebar
- **Mobile:** Touch-friendly interface with mobile navigation

## 🚦 User Roles & Permissions

### **Admin**
- Full system access
- User management
- System configuration
- All CRUD operations

### **Doctor**
- Patient management
- Appointment scheduling
- Medical records
- Prescription management
- Test ordering

### **Patient**
- View appointments
- Access medical records
- View prescriptions
- Profile management

## 🔄 Data Flow

1. **Authentication:** User logs in → JWT token stored → API calls include token
2. **Data Loading:** API calls → Backend controllers → Database → Response → Frontend display
3. **CRUD Operations:** Form submission → API call → Backend processing → Database update → Frontend refresh

## 🐛 Error Handling

- Network error handling with user-friendly messages
- Form validation with real-time feedback
- API error responses properly displayed
- Loading states during async operations

## 🚀 Performance Optimizations

- Lazy loading of data
- Pagination for large datasets
- Efficient DOM manipulation
- Minimal external dependencies
- Optimized CSS and JavaScript

## 🔮 Future Enhancements

The current implementation provides a solid foundation. Future modules can be easily added:
- Advanced reporting and analytics
- Real-time notifications
- File upload capabilities
- Print functionality
- Export features

## 🤝 Backend Compatibility

This frontend is specifically designed for your backend with these controllers:
- `AdminController`
- `AppointmentController`
- `AuthController`
- `DoctorController`
- `DosageMasterController`
- `MedicalRecordController`
- `PatientController`
- `PrescriptionController`
- `RecommendedTestController`
- `TestMasterController`

All API calls match your exact endpoint signatures and DTO structures.

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Verify backend API is running and accessible
3. Ensure CORS is properly configured on backend
4. Check network tab for API call details

## 🎯 Getting Started

1. **Start your backend API** on `http://localhost:5120`
2. **Open the frontend** by loading `index.html`
3. **Register a new user** or use existing credentials
4. **Explore the dashboard** and various modules
5. **Test CRUD operations** with the backend integration

The system is now ready for production use with your complete hospital management backend!
