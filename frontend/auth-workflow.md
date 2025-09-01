# PAmazeCare Authentication Workflow

## Overview
This document outlines the complete authentication workflow between the frontend and backend systems.

## Backend Authentication Flow

### 1. Registration Process
**Endpoint:** `POST /api/Auth/register`

**Request Format:**
```json
{
  "FullName": "John Doe",
  "Email": "john@example.com",
  "Password": "password123",
  "UserType": "Patient"
}
```

**Backend Process:**
1. Validates model state (required fields, email format, password length)
2. Normalizes email to lowercase
3. Checks if email already exists in database
4. Hashes password using BCrypt
5. Creates new User entity with normalized email
6. Saves to database via UserRepository

**Response:**
- Success: `200 OK` with success message
- Failure: `400 Bad Request` with error details

### 2. Login Process
**Endpoint:** `POST /api/Auth/login`

**Request Format:**
```json
{
  "Email": "john@example.com",
  "Password": "password123"
}
```

**Backend Process:**
1. Validates model state
2. Normalizes email to lowercase
3. Finds user by normalized email
4. Verifies password using BCrypt
5. Generates JWT token using TokenService
6. Returns AuthResponse with token and user type

**Response:**
```json
{
  "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "UserType": "Patient"
}
```

## Frontend Authentication Flow

### 1. Registration Flow
**Page:** `register.html`

**Process:**
1. User fills registration form
2. Frontend validates password confirmation
3. Sends POST request to `/api/Auth/register`
4. On success: Shows success message and redirects to login
5. On error: Displays appropriate error message

### 2. Login Flow
**Page:** `login.html`

**Process:**
1. User enters email and password
2. Frontend sends POST request to `/api/Auth/login`
3. On success:
   - Stores `authToken` in localStorage
   - Stores `userType` in localStorage
   - Stores user info in `currentUser` localStorage
   - Redirects to appropriate dashboard based on user type
4. On error: Displays error message

### 3. Authentication State Management

**Token Storage:**
- Primary token key: `authToken`
- User type: `userType`
- User info: `currentUser` (JSON string)

**API Service Integration:**
- All API requests include `Authorization: Bearer {token}` header
- Token retrieved from `localStorage.getItem('authToken')`

### 4. Dashboard Routing

**User Type Redirects:**
- `Patient` → `patient-dashboard.html`
- `Doctor` → `doctor-dashboard.html`
- `Admin` → `admin-dashboard.html`

## Security Features

### Backend Security
1. **Password Hashing:** BCrypt with salt
2. **Email Normalization:** Consistent lowercase storage
3. **Input Validation:** Model state validation with data annotations
4. **JWT Tokens:** Secure token generation for authentication
5. **Error Handling:** Consistent error responses without exposing sensitive data

### Frontend Security
1. **Client-side Validation:** Form validation before API calls
2. **Secure Token Storage:** localStorage for token persistence
3. **Route Protection:** Authentication checks on protected pages
4. **Automatic Logout:** Token removal on logout

## API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/Auth/register` | POST | User registration | No |
| `/api/Auth/login` | POST | User login | No |
| `/api/Auth/debug/users` | GET | Debug: List all users | No |

## Error Handling

### Common Error Scenarios
1. **Email Already Exists:** Registration fails with appropriate message
2. **Invalid Credentials:** Login fails with generic error message
3. **Validation Errors:** Form validation errors displayed to user
4. **Network Errors:** Connection issues handled gracefully
5. **Server Errors:** 500 errors show user-friendly messages

### Error Response Format
```json
{
  "Message": "Error description",
  "Errors": ["Detailed error 1", "Detailed error 2"]
}
```

## Testing

### Manual Testing Steps
1. **Registration Test:**
   - Open `register.html`
   - Fill form with valid data
   - Verify account creation
   - Check database for new user

2. **Login Test:**
   - Open `login.html`
   - Use registered credentials
   - Verify token storage
   - Check dashboard redirect

3. **Authentication Test:**
   - Access protected pages without token
   - Verify redirect to login
   - Test logout functionality

### Debug Tools
- `debug-db.html`: View all users in database
- Browser DevTools: Check localStorage and network requests
- Backend console logs: Monitor authentication attempts

## File Structure

```
frontend/
├── login.html              # Login page
├── register.html           # Registration page
├── patient-dashboard.html  # Patient dashboard
├── config.js              # API configuration
├── api.js                 # API service layer
└── auth-workflow.md       # This documentation

backend/
├── Controllers/AuthController.cs
├── Services/Implementations/AuthService.cs
├── Models/Auth/LoginDto.cs
├── Models/Auth/RegisterDto.cs
├── DTOs/AuthResponse.cs
└── Repositories/Implementations/UserRepository.cs
```

## Next Steps

1. Implement additional dashboards (doctor, admin)
2. Add password reset functionality
3. Implement refresh token mechanism
4. Add role-based access control
5. Enhance error logging and monitoring
