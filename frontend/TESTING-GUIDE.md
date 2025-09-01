# PAmazeCare Authentication Testing Guide

## Quick Start Testing

### 1. Start Your Backend Server
```bash
# Navigate to your project root
cd c:\Users\sarve\source\repos\PAmazeCare

# Run the backend (ensure it's on localhost:5120)
dotnet run
```

### 2. Test Authentication Flow

**Option A: Manual Testing**
1. Open `register.html` in your browser
2. Create a new patient account
3. Open `login.html` and sign in
4. Verify redirect to `patient-dashboard.html`

**Option B: Automated Testing**
1. Open `test-authentication.html` in your browser
2. Run all test scenarios with one click
3. Review detailed test results

## Complete Testing Checklist

### ✅ Registration Tests
- [ ] Valid registration with proper data
- [ ] Duplicate email rejection
- [ ] Invalid email format rejection
- [ ] Short password rejection (< 6 chars)
- [ ] Empty fields validation
- [ ] Case sensitivity (emails normalized to lowercase)
- [ ] Whitespace handling (trimmed properly)
- [ ] Special characters in names/emails
- [ ] Long input validation (name > 100 chars)

### ✅ Login Tests
- [ ] Valid login with correct credentials
- [ ] Invalid password rejection
- [ ] Nonexistent user rejection
- [ ] Empty fields validation
- [ ] Email case insensitivity
- [ ] Token generation and storage
- [ ] User type detection

### ✅ Authentication State Tests
- [ ] Token storage in localStorage
- [ ] Token inclusion in API headers
- [ ] Protected route access control
- [ ] Logout functionality
- [ ] Session persistence across page reloads

### ✅ Dashboard Routing Tests
- [ ] Patient → `patient-dashboard.html`
- [ ] Doctor → `doctor-dashboard.html`
- [ ] Admin → `admin-dashboard.html`
- [ ] Unauthorized access redirects to login
- [ ] Cross-role access prevention

### ✅ Database Integration Tests
- [ ] User creation in database
- [ ] Email uniqueness enforcement
- [ ] Password hashing verification
- [ ] User retrieval by email
- [ ] Debug endpoint functionality

## File Structure Overview

```
frontend/
├── login.html                 # Login page
├── register.html              # Registration page
├── patient-dashboard.html     # Patient dashboard
├── doctor-dashboard.html      # Doctor dashboard
├── admin-dashboard.html       # Admin dashboard
├── test-authentication.html   # Comprehensive test suite
├── debug-db.html             # Database debugging
├── config.js                 # API configuration
├── api.js                    # API service layer
├── auth-workflow.md          # Technical documentation
└── TESTING-GUIDE.md          # This guide
```

## Testing Scenarios

### Scenario 1: New User Registration
1. Open `register.html`
2. Fill form with:
   - Full Name: "John Doe"
   - Email: "john.doe@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
3. Click "Create Account"
4. Verify success message and redirect to login

### Scenario 2: User Login
1. Open `login.html`
2. Enter registered credentials
3. Click "Sign In"
4. Verify token storage and dashboard redirect

### Scenario 3: Role-Based Access
1. Login as different user types
2. Verify correct dashboard access
3. Test cross-role access prevention

### Scenario 4: Error Handling
1. Try registering with existing email
2. Try logging in with wrong password
3. Try accessing protected pages without token
4. Verify appropriate error messages

## Debug Tools

### Database Debugging
- **File**: `debug-db.html`
- **Purpose**: View all users, test email existence
- **Usage**: Open in browser, click "Get All Users"

### Authentication Testing
- **File**: `test-authentication.html`
- **Purpose**: Automated testing of all scenarios
- **Usage**: Open in browser, run individual or all tests

### Browser DevTools
- **localStorage**: Check stored tokens and user data
- **Network tab**: Monitor API requests/responses
- **Console**: View authentication logs

## Common Issues & Solutions

### Issue: "Network Error" on API calls
**Solution**: Ensure backend is running on `localhost:5120`

### Issue: Registration succeeds but login fails
**Solution**: Check email normalization (should be lowercase)

### Issue: Token not being stored
**Solution**: Check browser console for JavaScript errors

### Issue: Dashboard not loading after login
**Solution**: Verify token and userType in localStorage

### Issue: CORS errors
**Solution**: Ensure backend CORS is configured for frontend origin

## API Endpoints Reference

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|--------------|
| `/api/Auth/register` | POST | User registration | `{FullName, Email, Password, UserType}` |
| `/api/Auth/login` | POST | User login | `{Email, Password}` |
| `/api/Auth/debug/users` | GET | List all users | None |

## Expected Response Formats

### Registration Success
```json
{
  "Message": "Registration successful."
}
```

### Login Success
```json
{
  "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "UserType": "Patient"
}
```

### Error Response
```json
{
  "Message": "Error description",
  "Errors": ["Detailed error 1", "Detailed error 2"]
}
```

## Performance Testing

### Load Testing
- Test multiple simultaneous registrations
- Test concurrent login attempts
- Monitor database performance

### Security Testing
- Test SQL injection attempts
- Test XSS prevention
- Verify password hashing
- Test token security

## Automated Testing Script

```javascript
// Run this in browser console for quick testing
async function runQuickTest() {
    console.log('Starting authentication test...');
    
    // Test registration
    try {
        const regResponse = await apiService.register({
            FullName: "Test User " + Date.now(),
            Email: "test" + Date.now() + "@example.com",
            Password: "password123",
            UserType: "Patient"
        });
        console.log('✅ Registration:', regResponse);
    } catch (e) {
        console.log('❌ Registration:', e.message);
    }
    
    // Test login
    try {
        const loginResponse = await apiService.login({
            email: "test@example.com",
            password: "password123"
        });
        console.log('✅ Login:', loginResponse);
    } catch (e) {
        console.log('❌ Login:', e.message);
    }
}

// Run the test
runQuickTest();
```

## Next Steps After Testing

1. **Fix any identified issues**
2. **Implement additional features**:
   - Password reset functionality
   - Email verification
   - Remember me option
   - Session timeout
3. **Enhance security**:
   - Rate limiting
   - Account lockout
   - Audit logging
4. **Add monitoring**:
   - Authentication metrics
   - Error tracking
   - Performance monitoring

## Support

If you encounter issues during testing:
1. Check browser console for errors
2. Verify backend server is running
3. Review network requests in DevTools
4. Check database connectivity
5. Validate API endpoint configurations

## Testing Completion

Mark each test as complete:
- [ ] All registration scenarios tested
- [ ] All login scenarios tested
- [ ] All dashboard routing tested
- [ ] All error scenarios tested
- [ ] All edge cases tested
- [ ] Database integration verified
- [ ] Security measures validated

Your authentication system is ready for production when all tests pass! 🎉
