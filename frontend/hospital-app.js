// PAmazeCare Hospital Management System - Complete Application
class PAmazeCareApp {
    constructor() {
        this.currentUser = null;
        this.currentView = 'login';
        this.cachedData = {};
        this.currentPage = 1;
        this.pageSize = 10;
        this.api = apiService; // Initialize API service
        this.init();
        
        // Debug sidebar elements after page load
        setTimeout(() => {
            this.debugSidebarElements();
        }, 1000);
        
        this.setupKeyboardShortcuts();
    }
    
    debugSidebarElements() {
        console.log('=== SIDEBAR DEBUG ===');
        const patientsNav = document.getElementById('patientsNav');
        const doctorsNav = document.getElementById('doctorsNav');
        const patientSubMenu = document.getElementById('patientSubMenu');
        const doctorSubMenu = document.getElementById('doctorSubMenu');
        
        console.log('Patient Nav Element:', patientsNav);
        console.log('Doctor Nav Element:', doctorsNav);
        console.log('Patient SubMenu:', patientSubMenu);
        console.log('Doctor SubMenu:', doctorSubMenu);
        
        // Force visibility for admin users
        if (this.currentUser && this.currentUser.userType && this.currentUser.userType.toLowerCase() === 'admin') {
            if (patientsNav) {
                patientsNav.style.display = 'block';
                patientsNav.style.visibility = 'visible';
                console.log('Forced Patient Nav to be visible');
            }
            if (doctorsNav) {
                doctorsNav.style.display = 'block';
                doctorsNav.style.visibility = 'visible';
                console.log('Forced Doctor Nav to be visible');
            }
        }
        
        if (patientsNav) {
            console.log('Patient Nav is visible:', patientsNav.offsetWidth > 0 && patientsNav.offsetHeight > 0);
            console.log('Patient Nav computed style:', window.getComputedStyle(patientsNav).display);
        }
        
        if (doctorsNav) {
            console.log('Doctor Nav is visible:', doctorsNav.offsetWidth > 0 && doctorsNav.offsetHeight > 0);
            console.log('Doctor Nav computed style:', window.getComputedStyle(doctorsNav).display);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+L or Cmd+L for logout
            if ((e.ctrlKey || e.metaKey) && e.key === 'l' && this.currentUser) {
                e.preventDefault();
                this.logout();
            }
            
            // Escape key to close modals
            if (e.key === 'Escape') {
                this.closeModal();
                
                // Hide user menu if open
                const userMenu = document.querySelector('.user-menu');
                if (userMenu && userMenu.classList.contains('show')) {
                    userMenu.classList.remove('show');
                }
            }
        });
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        const registerForm = document.getElementById('registerForm');
        if (registerForm) registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-container')) this.closeModal();
        });
    }

    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        
        if (token && user) {
            this.currentUser = JSON.parse(user);
            this.showDashboard();
            this.updateUserInterface();
            this.loadInitialData();
        } else {
            this.showLogin();
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        this.showLoading(true);

        try {
            const formData = new FormData(event.target);
            const credentials = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            const response = await apiService.login(credentials);
            
            console.log('Login API Response:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', response ? Object.keys(response) : 'No response');
            
            if (response && (response.token || response.Token)) {
                const token = response.token || response.Token;
                
                // Create user object from response
                const user = {
                    id: response.userId || response.UserId,
                    email: credentials.email,
                    userType: response.userType || response.UserType,
                    fullName: response.fullName || response.FullName
                };
                
                console.log('Login response userType:', response.userType || response.UserType);
                console.log('Final user object:', user);
                
                // Store authentication data
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('authToken', token);
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                this.currentUser = user;
                this.api.token = token;
                
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.reset();
                }
                
                this.showNotification('Login successful!', 'success');
                
                
                this.showDashboard();
                this.updateUserInterface();
                this.loadInitialData();
            } else {
                console.error('Expected Token field not found in response:', response);
                throw new Error('Invalid login response - Token not found');
            }
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed. Please check your credentials.';
            
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage = 'Invalid email or password.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Cannot connect to server. Please try again later.';
            }
            
            this.showNotification(errorMessage, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        this.showLoading(true);

        try {
            const formData = new FormData(event.target);
            const userData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                password: formData.get('password'),
                userType: formData.get('userType')
            };

            await apiService.register(userData);
            this.showNotification('Registration successful! Please login.', 'success');
            this.showLogin();
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async logout() {
        // Show confirmation dialog
        const confirmed = confirm('Are you sure you want to logout?');
        if (!confirmed) {
            return;
        }

        try {
            // Close any open modals
            this.closeModal();
            
            // Hide user menu if open
            const userMenu = document.querySelector('.user-menu');
            if (userMenu) {
                userMenu.classList.remove('show');
            }
            
            // Clear all stored authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            
            // Reset application state
            this.currentUser = null;
            this.currentView = null;
            
            // Clear any cached data
            this.cachedData = {};
            
            // Show logout notification
            this.showNotification('Logged out successfully', 'success');
            
            // Hide loading overlay if showing
            this.showLoading(false);
            
            // Redirect to login view immediately
            this.showLogin();
            
            // Clear any form data
            const forms = document.querySelectorAll('form');
            forms.forEach(form => form.reset());
            
            // Reset page title
            document.title = 'PAmazeCare - Hospital Management System';
            
        } catch (error) {
            console.error('Error during logout:', error);
            this.showNotification('Error during logout', 'error');
            // Force redirect to login even if there's an error
            this.showLogin();
        }
    }

    showLoginView() {
        this.showLogin();
    }

    hideAllPages() {
        const pages = ['loginPage', 'registerPage', 'patientRegistrationPage', 'dashboardPage', 'patientDashboardPage'];
        pages.forEach(pageId => {
            const page = document.getElementById(pageId);
            if (page) {
                page.classList.remove('active');
                page.style.display = 'none';
            }
        });
    }

    showLogin() {
        this.hideAllPages();
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.classList.add('active');
            loginPage.style.display = 'block';
        }
    }

    showRegister() {
        this.hideAllPages();
        const registerPage = document.getElementById('registerPage');
        if (registerPage) {
            registerPage.classList.add('active');
            registerPage.style.display = 'block';
        }
    }



    showDashboard() {
        this.hideAllPages();
        
        // Route to appropriate dashboard based on user type hierarchy
        const userType = this.currentUser?.userType?.toLowerCase();
        console.log('User type for dashboard routing:', userType);
        console.log('Current user object:', this.currentUser);
        
        // First, hide both dashboards
        const patientDashboard = document.getElementById('patientDashboardPage');
        const adminDashboard = document.getElementById('dashboardPage');
        
        if (patientDashboard) {
            patientDashboard.classList.remove('active');
            patientDashboard.style.display = 'none';
        }
        if (adminDashboard) {
            adminDashboard.classList.remove('active');
            adminDashboard.style.display = 'none';
        }
        
        if (userType === 'patient') {
            // Show ONLY patient dashboard
            console.log('Routing to patient dashboard');
            if (patientDashboard) {
                patientDashboard.classList.add('active');
                patientDashboard.style.display = 'grid';
                this.showPatientView('patientDashboard');
                this.loadPatientDashboardData();
            }
        } else if (userType === 'superadmin' || userType === 'admin' || userType === 'doctor') {
            // Show admin dashboard for SuperAdmin, Admin, and Doctor users
            console.log('Routing to admin dashboard for userType:', userType);
            if (adminDashboard) {
                adminDashboard.classList.add('active');
                adminDashboard.style.display = 'grid';
                this.showView('dashboard');
                
                // Show role-specific UI elements
                this.updateUIForRole(userType);
            }
        } else {
            // Default to patient dashboard for unknown users
            console.log('Unknown userType, defaulting to patient dashboard');
            if (patientDashboard) {
                patientDashboard.classList.add('active');
                patientDashboard.style.display = 'grid';
                this.showPatientView('patientDashboard');
            }
        }
    }

    // Update UI elements based on user role hierarchy
    updateUIForRole(userType) {
        const addAdminBtn = document.querySelector('button[onclick="showAddAdmin()"]');
        const deletePatientBtn = document.querySelector('button[onclick="deletePatientById()"]');
        const managementNavs = {
            patients: document.getElementById('patientsNav'),
            doctors: document.getElementById('doctorsNav'),
            appointments: document.getElementById('appointmentsNav'),
            medicalRecords: document.getElementById('medicalRecordsNav')
        };

        // Role-based UI visibility
        switch(userType) {
            case 'superadmin':
                // SuperAdmin sees everything
                if (addAdminBtn) addAdminBtn.style.display = 'block';
                if (deletePatientBtn) deletePatientBtn.style.display = 'block';
                Object.values(managementNavs).forEach(nav => {
                    if (nav) nav.style.display = 'block';
                });
                break;
                
            case 'admin':
                // Admin sees most things but cannot create SuperAdmins
                if (addAdminBtn) addAdminBtn.style.display = 'block';
                if (deletePatientBtn) deletePatientBtn.style.display = 'block';
                Object.values(managementNavs).forEach(nav => {
                    if (nav) nav.style.display = 'block';
                });
                break;
                
            case 'doctor':
                // Doctor sees limited management options
                if (addAdminBtn) addAdminBtn.style.display = 'none';
                if (deletePatientBtn) deletePatientBtn.style.display = 'none';
                if (managementNavs.patients) managementNavs.patients.style.display = 'block';
                if (managementNavs.appointments) managementNavs.appointments.style.display = 'block';
                if (managementNavs.medicalRecords) managementNavs.medicalRecords.style.display = 'block';
                if (managementNavs.doctors) managementNavs.doctors.style.display = 'none';
                break;
                
            default:
                // Hide all admin functions for unknown roles
                if (addAdminBtn) addAdminBtn.style.display = 'none';
                if (deletePatientBtn) deletePatientBtn.style.display = 'none';
                Object.values(managementNavs).forEach(nav => {
                    if (nav) nav.style.display = 'none';
                });
        }
        
        // Force show navigation elements after role check
        setTimeout(() => {
            Object.values(managementNavs).forEach(nav => {
                if (nav && nav.style.display === 'block') {
                    nav.style.visibility = 'visible';
                }
            });
            }, 100);
    }

    showPatientDashboard() {
        this.hideAllPages();
        document.getElementById('patientDashboardPage').classList.add('active');
        this.showPatientView('patientDashboard');
        this.loadPatientDashboardData();
    }

    async loadRecentActivities() {
        try {
            // Mock recent activities for now - can be replaced with real API call
            const activities = [
                { type: 'appointment', message: 'New appointment scheduled', time: '2 minutes ago' },
                { type: 'patient', message: 'Patient record updated', time: '15 minutes ago' },
                { type: 'doctor', message: 'Doctor profile updated', time: '1 hour ago' }
            ];
            
            this.renderRecentActivities(activities);
        } catch (error) {
            console.error('Error loading recent activities:', error);
        }
    }

    renderRecentActivities(activities) {
        const container = document.getElementById('recentActivities');
        if (!container) return;

        if (!activities || activities.length === 0) {
            container.innerHTML = '<p class="no-data">No recent activities</p>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            appointment: 'calendar-check',
            patient: 'user',
            doctor: 'user-md',
            medical: 'file-medical',
            default: 'bell'
        };
        return icons[type] || icons.default;
    }

    // ==================== PATIENT DASHBOARD FUNCTIONS ====================
    
    showPatientView(viewName) {
        // Hide all patient content views
        const allViews = document.querySelectorAll('#patientDashboardPage .content-view');
        allViews.forEach(view => view.classList.remove('active'));

        // Remove active class from all patient nav items
        const allNavItems = document.querySelectorAll('#patientDashboardPage .nav-item');
        allNavItems.forEach(item => item.classList.remove('active'));

        // Show the target view
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Add active class to corresponding nav item
        const navItem = document.querySelector(`[onclick*="show${viewName.charAt(0).toUpperCase() + viewName.slice(1)}"]`)?.parentElement;
        if (navItem) {
            navItem.classList.add('active');
        }

        this.currentView = viewName;
    }

    async loadPatientDashboardData() {
        try {
            this.showLoading(true);
            
            // Load patient-specific data
            const patientId = this.currentUser?.id || this.currentUser?.userId;
            
            if (patientId) {
                const [appointments, medicalRecords] = await Promise.all([
                    this.api.getPatientAppointments(patientId).catch(() => []),
                    this.api.getPatientMedicalRecords(patientId).catch(() => [])
                ]);

                this.updatePatientDashboardStats({
                    totalAppointments: appointments.length || 0,
                    totalRecords: medicalRecords.length || 0,
                    totalPrescriptions: 0 // Will be implemented later
                });

                this.renderUpcomingAppointments(appointments.slice(0, 5));
                this.renderRecentMedicalRecords(medicalRecords.slice(0, 5));
            }
        } catch (error) {
            console.error('Error loading patient dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    updatePatientDashboardStats(stats) {
        const elements = {
            patientTotalAppointments: document.getElementById('patientTotalAppointments'),
            patientTotalRecords: document.getElementById('patientTotalRecords'),
            patientTotalPrescriptions: document.getElementById('patientTotalPrescriptions')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                const statKey = key.replace('patient', '').replace('Total', '').toLowerCase();
                const value = stats[`total${statKey.charAt(0).toUpperCase() + statKey.slice(1)}`] || 0;
                elements[key].textContent = value.toLocaleString();
            }
        });
    }

    renderUpcomingAppointments(appointments) {
        const container = document.getElementById('upcomingAppointments');
        if (!container) return;

        if (!appointments || appointments.length === 0) {
            container.innerHTML = '<p class="no-data">No upcoming appointments</p>';
            return;
        }

        container.innerHTML = appointments.map(appointment => `
            <div class="appointment-item">
                <div class="appointment-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="appointment-details">
                    <h4>Dr. ${appointment.doctorName || 'Unknown'}</h4>
                    <p>${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}</p>
                    <span class="status ${appointment.status?.toLowerCase()}">${appointment.status || 'Scheduled'}</span>
                </div>
            </div>
        `).join('');
    }

    renderRecentMedicalRecords(records) {
        const container = document.getElementById('recentMedicalRecords');
        if (!container) return;

        if (!records || records.length === 0) {
            container.innerHTML = '<p class="no-data">No medical records found</p>';
            return;
        }

        container.innerHTML = records.map(record => `
            <div class="record-item">
                <div class="record-icon">
                    <i class="fas fa-file-medical"></i>
                </div>
                <div class="record-details">
                    <h4>${record.diagnosis || 'General Checkup'}</h4>
                    <p>Dr. ${record.doctorName || 'Unknown'}</p>
                    <span class="record-date">${new Date(record.createdAt || record.date).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }

    // Patient-specific navigation functions
    async showMyAppointments() {
        this.showPatientView('patientAppointments');
        await this.loadPatientAppointments();
    }

    async showMyMedicalRecords() {
        this.showPatientView('patientMedicalRecords');
        await this.loadPatientMedicalRecords();
    }

    async showBookAppointment() {
        await this.showAddAppointment();
    }

    showPatientProfile() {
        this.showPatientView('patientProfile');
        this.loadPatientProfile();
    }

    async loadPatientAppointments() {
        try {
            this.showLoading(true);
            const patientId = this.currentUser?.id || this.currentUser?.userId;
            
            if (!patientId) {
                this.showNotification('Patient ID not found', 'error');
                return;
            }

            const appointments = await this.api.getPatientAppointments(patientId);
            this.renderPatientAppointmentsTable(appointments);
        } catch (error) {
            console.error('Error loading patient appointments:', error);
            this.showNotification('Error loading appointments', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderPatientAppointmentsTable(appointments) {
        const tbody = document.getElementById('patientAppointmentsTableBody');
        if (!tbody) return;

        if (!appointments || appointments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray-500);">
                        <i class="fas fa-calendar" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        No appointments found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = appointments.map(appointment => `
            <tr>
                <td>${appointment.id}</td>
                <td>Dr. ${appointment.doctorName || 'Unknown'}</td>
                <td>${new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                <td>${appointment.appointmentTime}</td>
                <td><span class="status ${appointment.status?.toLowerCase()}">${appointment.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="app.viewAppointment(${appointment.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${appointment.status === 'Scheduled' ? `
                            <button class="btn btn-sm btn-warning" onclick="app.cancelPatientAppointment(${appointment.id})" title="Cancel">
                                <i class="fas fa-ban"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadPatientMedicalRecords() {
        try {
            this.showLoading(true);
            const patientId = this.currentUser?.id || this.currentUser?.userId;
            
            if (!patientId) {
                this.showNotification('Patient ID not found', 'error');
                return;
            }

            const records = await this.api.getPatientMedicalRecords(patientId);
            this.renderPatientMedicalRecordsTable(records);
        } catch (error) {
            console.error('Error loading patient medical records:', error);
            this.showNotification('Error loading medical records', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderPatientMedicalRecordsTable(records) {
        const tbody = document.getElementById('patientMedicalRecordsTableBody');
        if (!tbody) return;

        if (!records || records.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: var(--gray-500);">
                        <i class="fas fa-file-medical" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        No medical records found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = records.map(record => `
            <tr>
                <td>${record.id}</td>
                <td>Dr. ${record.doctorName || 'Unknown'}</td>
                <td>${record.diagnosis || 'N/A'}</td>
                <td>${new Date(record.createdAt || record.date).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="app.viewMedicalRecord(${record.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadPatientProfile() {
        try {
            const patientId = this.currentUser?.id || this.currentUser?.userId;
            
            if (!patientId) {
                this.showNotification('Patient ID not found', 'error');
                return;
            }

            const patient = await this.api.getPatientById(patientId);
            this.renderPatientProfile(patient);
        } catch (error) {
            console.error('Error loading patient profile:', error);
            this.showNotification('Error loading profile', 'error');
        }
    }

    renderPatientProfile(patient) {
        const container = document.getElementById('patientProfileInfo');
        if (!container || !patient) return;

        container.innerHTML = `
            <div class="profile-details">
                <h3>${patient.fullName || patient.FullName}</h3>
                <p><i class="fas fa-envelope"></i> ${patient.email || patient.Email}</p>
                <p><i class="fas fa-phone"></i> ${patient.contactNumber || patient.ContactNumber || 'Not provided'}</p>
                <p><i class="fas fa-birthday-cake"></i> ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                <p><i class="fas fa-venus-mars"></i> ${patient.gender || patient.Gender || 'Not specified'}</p>
            </div>
        `;
    }

    async cancelPatientAppointment(appointmentId) {
        const confirmed = confirm('Are you sure you want to cancel this appointment?');
        if (!confirmed) return;

        try {
            this.showLoading(true);
            await this.api.cancelAppointment(appointmentId);
            this.showNotification('Appointment cancelled successfully', 'success');
            await this.loadPatientAppointments();
            await this.loadPatientDashboardData();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            this.showNotification('Error cancelling appointment', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Patient-specific placeholder methods
    async showMyPrescriptions() {
        this.showNotification('Prescriptions feature coming soon', 'info');
    }

    // Patient profile editing
    async editPatientProfile() {
        try {
            const patientId = this.currentUser?.id || this.currentUser?.userId;
            if (!patientId) {
                this.showNotification('Patient ID not found', 'error');
                return;
            }

            this.showLoading(true);
            const patient = await this.api.getPatientProfile(patientId);
            this.showEditProfileModal(patient);
        } catch (error) {
            console.error('Error loading patient profile for editing:', error);
            this.showNotification('Error loading profile data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showEditProfileModal(patient) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Profile</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="editProfileForm">
                        <div class="form-group">
                            <label for="editFirstName">First Name</label>
                            <input type="text" id="editFirstName" name="firstName" value="${patient.firstName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="editLastName">Last Name</label>
                            <input type="text" id="editLastName" name="lastName" value="${patient.lastName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="editEmail">Email</label>
                            <input type="email" id="editEmail" name="email" value="${patient.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="editPhone">Phone</label>
                            <input type="tel" id="editPhone" name="phone" value="${patient.phone || ''}">
                        </div>
                        <div class="form-group">
                            <label for="editAddress">Address</label>
                            <textarea id="editAddress" name="address" rows="3">${patient.address || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="editDateOfBirth">Date of Birth</label>
                            <input type="date" id="editDateOfBirth" name="dateOfBirth" value="${patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : ''}">
                        </div>
                        <div class="form-group">
                            <label for="editGender">Gender</label>
                            <select id="editGender" name="gender">
                                <option value="">Select Gender</option>
                                <option value="Male" ${patient.gender === 'Male' ? 'selected' : ''}>Male</option>
                                <option value="Female" ${patient.gender === 'Female' ? 'selected' : ''}>Female</option>
                                <option value="Other" ${patient.gender === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Update Profile</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // Close modal functionality
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => this.closeModal();

        // Form submission
        const form = modal.querySelector('#editProfileForm');
        form.onsubmit = (e) => this.handleProfileUpdate(e, patient.id);

        // Close modal when clicking outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        };
    }

    async handleProfileUpdate(event, patientId) {
        event.preventDefault();
        
        try {
            this.showLoading(true);
            
            const formData = new FormData(event.target);
            const patientData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                dateOfBirth: formData.get('dateOfBirth'),
                gender: formData.get('gender')
            };

            await this.api.updatePatientProfile(patientId, patientData);
            
            this.showNotification('Profile updated successfully!', 'success');
            this.closeModal();
            
            // Refresh profile view if currently viewing it
            if (document.querySelector('.profile-container')) {
                this.loadPatientProfile();
            }
            
        } catch (error) {
            console.error('Error updating patient profile:', error);
            this.showNotification('Error updating profile', 'error');
        }
    }


async handleRegister(event) {
    event.preventDefault();
    this.showLoading(true);

    try {
        const formData = new FormData(event.target);
        const userData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            password: formData.get('password'),
            userType: formData.get('userType')
        };

        await apiService.register(userData);
        this.showNotification('Registration successful! Please login.', 'success');
        this.showLogin();
    } catch (error) {
        console.error('Registration error:', error);
        this.showNotification('Registration failed. Please try again.', 'error');
    } finally {
        this.showLoading(false);
    }
}

async logout() {
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to logout?');
    if (!confirmed) {
        return;
    }

    try {
        // Close any open modals
        this.closeModal();
        
        // Hide user menu if open
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.classList.remove('show');
        }
        
        // Clear all stored authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        // Reset application state
        this.currentUser = null;
        this.currentView = null;
        
        // Clear any cached data
        this.cachedData = {};
        
        // Show logout notification
        this.showNotification('Logged out successfully', 'success');
        
        // Hide loading overlay if showing
        this.showLoading(false);
        
        // Redirect to login view after a brief delay
        setTimeout(() => {
            this.showLogin();
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        this.showNotification('Error during logout', 'error');
    }
}

    showView(viewName) {
        // Hide all content views
        const allViews = document.querySelectorAll('.content-view');
        allViews.forEach(view => view.classList.remove('active'));

        // Remove active class from all nav items
        const allNavItems = document.querySelectorAll('.nav-item');
        allNavItems.forEach(item => item.classList.remove('active'));

        // Show the target view
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Add active class to corresponding nav item
        const navItem = document.querySelector(`[onclick*="show${viewName.charAt(0).toUpperCase() + viewName.slice(1)}"]`)?.parentElement;
        if (navItem) {
            navItem.classList.add('active');
        }

        this.currentView = viewName;
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = `Welcome, ${this.currentUser.email}`;
        }

        this.updateNavigationByRole();
    }

    updateNavigationByRole() {
        const userType = this.currentUser?.userType?.toLowerCase() || 'patient';
        
        const rolePermissions = {
            admin: ['patients', 'doctors', 'appointments', 'medicalrecords', 'prescriptions', 'tests', 'dosage', 'admins'],
            doctor: ['patients', 'appointments', 'medicalrecords', 'prescriptions', 'tests'],
            patient: ['appointments', 'medicalrecords', 'prescriptions']
        };

        const allowedViews = rolePermissions[userType] || rolePermissions.patient;

        document.querySelectorAll('.nav-item').forEach(item => {
            const navId = item.id.replace('Nav', '').toLowerCase();
            if (navId === '' || navId === 'dashboard') return;

            // Skip Patient and Doctor Management - they're handled by CSS
            if (item.id === 'patientsNav' || item.id === 'doctorsNav') {
                return;
            }

            if (allowedViews.includes(navId)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    async loadInitialData() {
        if (!this.currentUser) return;
        
        try {
            await this.loadDashboardData();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async loadDashboardData() {
        try {
            this.showLoading(true);

            const [patients, doctors, appointments] = await Promise.all([
                apiService.getAllPatients().catch(() => []),
                apiService.getAllDoctors().catch(() => []),
                apiService.getAllAppointments().catch(() => [])
            ]);

            this.updateDashboardStats({
                totalPatients: patients.length || 0,
                totalDoctors: doctors.length || 0,
                totalAppointments: appointments.length || 0,
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    updateDashboardStats(stats) {
        const elements = {
            totalPatients: document.getElementById('totalPatients'),
            totalDoctors: document.getElementById('totalDoctors'),
            totalAppointments: document.getElementById('totalAppointments'),
            totalRevenue: document.getElementById('totalRevenue')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (key === 'totalRevenue') {
                    elements[key].textContent = `$${stats[key].toLocaleString()}`;
                } else {
                    elements[key].textContent = stats[key].toLocaleString();
                }
            }
        });
    }

    async showPatients() {
        this.showView('patients');
        await this.loadPatientsData();
    }

    async loadPatientsData(page = 1, pageSize = 10) {
        try {
            this.showLoading(true);
            
            // For admin dashboard, load all patients
            if (this.currentUser?.userType === 'Admin') {
                const patients = await apiService.getAllPatients();
                console.log('All patients loaded:', patients);
                
                if (patients && Array.isArray(patients)) {
                    this.renderPatientsTable(patients);
                    this.renderPagination('patients', patients.length, 1, patients.length);
                } else {
                    console.warn('No patients data received or invalid format');
                    this.renderPatientsTable([]);
                }
            } else {
                // For other users, use paged data
                const response = await apiService.getAllPatientsPaged(page, pageSize);
                
                if (response && response.Items) {
                    this.renderPatientsTable(response.Items);
                    this.renderPagination('patients', response.TotalCount, page, pageSize);
                }
            }
        } catch (error) {
            console.error('Error loading patients:', error);
            this.showNotification('Failed to load patients', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadDashboardData() {
        try {
            this.showLoading(true);

            const [patients, doctors, appointments] = await Promise.all([
                apiService.getAllPatients().catch(() => []),
                apiService.getAllDoctors().catch(() => []),
                apiService.getAllAppointments().catch(() => [])
            ]);

            this.updateDashboardStats({
                totalPatients: patients.length || 0,
                totalDoctors: doctors.length || 0,
                totalAppointments: appointments.length || 0,
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    updateDashboardStats(stats) {
        const elements = {
            totalPatients: document.getElementById('totalPatients'),
            totalDoctors: document.getElementById('totalDoctors'),
            totalAppointments: document.getElementById('totalAppointments'),
            totalRevenue: document.getElementById('totalRevenue')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (key === 'totalRevenue') {
                    elements[key].textContent = `$${stats[key].toLocaleString()}`;
                } else {
                    elements[key].textContent = stats[key].toLocaleString();
                }
            }
        });
    }

    async showPatients() {
        this.showView('patients');
        await this.loadPatientsData();
    }

    async loadPatientsData(page = 1, pageSize = 10) {
        try {
            this.showLoading(true);
            console.log('Loading patients data for user:', this.currentUser);
            
            // For admin dashboard, load all patients using /api/Patient/all
            if (this.currentUser?.userType === 'Admin') {
                console.log('Admin user detected, loading all patients from:', 'http://localhost:5120/api/Patient/all');
                
                const patients = await apiService.getAllPatients();
                console.log('API Response for all patients:', patients);
                
                if (patients && Array.isArray(patients)) {
                    console.log(`Successfully loaded ${patients.length} patients`);
                    this.renderPatientsTable(patients);
                    this.renderPagination('patients', patients.length, 1, patients.length);
                } else {
                    console.warn('No patients data received or invalid format:', patients);
                    this.renderPatientsTable([]);
                    this.showNotification('No patients found or invalid data format', 'warning');
                }
            } else {
                // For other users, use paged data
                console.log('Non-admin user, loading paged patients');
                const response = await apiService.getAllPatientsPaged(page, pageSize);
                console.log('Paged patients response:', response);
                
                if (response && response.Items) {
                    this.renderPatientsTable(response.Items);
                    this.renderPagination('patients', response.TotalCount, page, pageSize);
                } else {
                    this.renderPatientsTable([]);
                    this.showNotification('No patients found', 'info');
                }
            }
        } catch (error) {
            console.error('Error loading patients:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                userType: this.currentUser?.userType,
                token: localStorage.getItem('token') ? 'Present' : 'Missing'
            });
            
            let errorMessage = 'Failed to load patients';
            if (error.message.includes('401')) {
                errorMessage = 'Authentication required. Please login again.';
            } else if (error.message.includes('403')) {
                errorMessage = 'Access denied. Insufficient permissions.';
            } else if (error.message.includes('404')) {
                errorMessage = 'Patient API endpoint not found.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Server error. Please try again later.';
            }
            
            this.showNotification(errorMessage, 'error');
            this.renderPatientsTable([]);
        } finally {
            this.showLoading(false);
        }
    }

    renderPatientsTable(patients) {
        const tbody = document.getElementById('patientsTableBody');
        if (!tbody) return;

        if (!patients || patients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray-500);">
                        <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        No patients found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = patients.map(patient => `
            <tr>
                <td>${patient.id || patient.Id || 'N/A'}</td>
                <td>${patient.fullName || patient.FullName || 'N/A'}</td>
                <td>${patient.email || patient.Email || 'N/A'}</td>
                <td>${patient.contactNumber || patient.ContactNumber || 'N/A'}</td>
                <td>${(patient.dateOfBirth || patient.DateOfBirth) ? new Date(patient.dateOfBirth || patient.DateOfBirth).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="app.viewPatient(${patient.id || patient.Id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="app.editPatient(${patient.id || patient.Id})" title="Edit Patient">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deletePatient(${patient.id || patient.Id})" title="Delete Patient">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async showAddPatient() {
        const modalHtml = `
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-user-plus"></i> Add New Patient</h2>
                    <button class="modal-close" onclick="app.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addPatientForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="patientFullName">Full Name *</label>
                                <div class="input-group">
                                    <i class="fas fa-user"></i>
                                    <input type="text" id="patientFullName" name="fullName" required 
                                           placeholder="Enter patient's full name" minlength="2">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="patientEmail">Email Address *</label>
                                <div class="input-group">
                                    <i class="fas fa-envelope"></i>
                                    <input type="email" id="patientEmail" name="email" required 
                                           placeholder="Enter email address">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="patientPassword">Password *</label>
                                <div class="input-group">
                                    <i class="fas fa-lock"></i>
                                    <input type="password" id="patientPassword" name="password" required 
                                           placeholder="Enter password" minlength="6">
                                    <button type="button" class="password-toggle" onclick="app.togglePasswordVisibility('patientPassword')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="patientContact">Contact Number</label>
                                <div class="input-group">
                                    <i class="fas fa-phone"></i>
                                    <input type="tel" id="patientContact" name="contactNumber" 
                                           placeholder="Enter contact number" pattern="[0-9]{10}">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="patientDOB">Date of Birth *</label>
                                <div class="input-group">
                                    <i class="fas fa-calendar"></i>
                                    <input type="date" id="patientDOB" name="dateOfBirth" required 
                                           max="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="patientGender">Gender</label>
                                <div class="input-group">
                                    <i class="fas fa-venus-mars"></i>
                                    <select id="patientGender" name="gender">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.closeModal()">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="btn btn-primary" onclick="app.savePatient()">
                        <i class="fas fa-save"></i> Save Patient
                    </button>
                </div>
            </div>
        `;
        this.showModal(modalHtml);
    }

    async savePatient() {
        try {
            const form = document.getElementById('addPatientForm');
            
            // Validate form
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            
            // Additional validation
            const fullName = formData.get('fullName')?.trim();
            const email = formData.get('email')?.trim();
            const password = formData.get('password');
            const contactNumber = formData.get('contactNumber')?.trim();
            const dateOfBirth = formData.get('dateOfBirth');

            if (!fullName || fullName.length < 2) {
                this.showNotification('Full name must be at least 2 characters long', 'error');
                return;
            }

            if (!email || !this.isValidEmail(email)) {
                this.showNotification('Please enter a valid email address', 'error');
                return;
            }

            if (!password || password.length < 6) {
                this.showNotification('Password must be at least 6 characters long', 'error');
                return;
            }

            if (!dateOfBirth) {
                this.showNotification('Date of birth is required', 'error');
                return;
            }

            // Check if patient is at least 1 year old
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 1 || birthDate > today) {
                this.showNotification('Please enter a valid date of birth', 'error');
                return;
            }

            this.showLoading(true);

            const patientDto = {
                fullName: fullName,
                email: email,
                password: password,
                contactNumber: contactNumber || null,
                dateOfBirth: dateOfBirth
            };

            const result = await apiService.createPatient(patientDto);
            
            this.showNotification('Patient added successfully!', 'success');
            this.closeModal();
            
            // Refresh data
            if (this.currentView === 'patients') {
                await this.loadPatientsData();
            }
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Error saving patient:', error);
            let errorMessage = 'Error saving patient';
            
            if (error.message.includes('400')) {
                errorMessage = 'Invalid patient data. Please check all fields.';
            } else if (error.message.includes('409')) {
                errorMessage = 'A patient with this email already exists.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Server error. Please try again later.';
            }
            
            this.showNotification(errorMessage, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Helper method for email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password visibility toggle
    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const toggleBtn = input.parentElement.querySelector('.password-toggle i');
        
        if (input.type === 'password') {
            input.type = 'text';
            toggleBtn.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            toggleBtn.className = 'fas fa-eye';
        }
    }

    async viewPatient(id) {
        try {
            console.log(`Loading patient details for ID: ${id}`);
            console.log(`API endpoint: http://localhost:5120/api/Patient/${id}`);
            
            const patient = await apiService.getPatient(id);
            console.log('Patient details loaded:', patient);
            
            // Handle both camelCase and PascalCase properties
            const patientData = {
                id: patient.id || patient.Id,
                fullName: patient.fullName || patient.FullName,
                email: patient.email || patient.Email,
                contactNumber: patient.contactNumber || patient.ContactNumber,
                dateOfBirth: patient.dateOfBirth || patient.DateOfBirth
            };
            
            const modalHtml = `
                <div class="modal">
                    <div class="modal-header">
                        <h2><i class="fas fa-user"></i> Patient Details</h2>
                        <button class="modal-close" onclick="app.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="patient-details">
                            <div class="detail-row">
                                <strong>ID:</strong> ${patientData.id || 'N/A'}
                            </div>
                            <div class="detail-row">
                                <strong>Full Name:</strong> ${patientData.fullName || 'N/A'}
                            </div>
                            <div class="detail-row">
                                <strong>Email:</strong> ${patientData.email || 'N/A'}
                            </div>
                            <div class="detail-row">
                                <strong>Contact:</strong> ${patientData.contactNumber || 'N/A'}
                            </div>
                            <div class="detail-row">
                                <strong>Date of Birth:</strong> ${patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.closeModal()">
                            <i class="fas fa-times"></i> Close
                        </button>
                        <button class="btn btn-primary" onclick="app.editPatient(${patientData.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            `;
            this.showModal(modalHtml);
        } catch (error) {
            console.error('Error viewing patient:', error);
            console.error('Error details:', {
                patientId: id,
                message: error.message,
                endpoint: `http://localhost:5120/api/Patient/${id}`
            });
            
            let errorMessage = 'Error loading patient details';
            if (error.message.includes('404')) {
                errorMessage = `Patient with ID ${id} not found`;
            } else if (error.message.includes('401')) {
                errorMessage = 'Authentication required to view patient details';
            } else if (error.message.includes('403')) {
                errorMessage = 'Access denied to view patient details';
            }
            
            this.showNotification(errorMessage, 'error');
        }
    }

    async editPatient(id) {
        try {
            const patient = await apiService.getPatient(id);
            const modalHtml = `
                <div class="modal">
                    <div class="modal-header">
                        <h2><i class="fas fa-user-edit"></i> Edit Patient</h2>
                        <button class="modal-close" onclick="app.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="editPatientForm">
                            <input type="hidden" id="editPatientId" value="${patient.id}">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editPatientFullName">Full Name *</label>
                                    <div class="input-group">
                                        <i class="fas fa-user"></i>
                                        <input type="text" id="editPatientFullName" name="fullName" required 
                                               value="${patient.fullName || ''}" placeholder="Enter patient's full name" minlength="2">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editPatientEmail">Email Address *</label>
                                    <div class="input-group">
                                        <i class="fas fa-envelope"></i>
                                        <input type="email" id="editPatientEmail" name="email" required 
                                               value="${patient.email || ''}" placeholder="Enter email address">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editPatientContact">Contact Number</label>
                                    <div class="input-group">
                                        <i class="fas fa-phone"></i>
                                        <input type="tel" id="editPatientContact" name="contactNumber" 
                                               value="${patient.contactNumber || ''}" placeholder="Enter contact number">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editPatientDOB">Date of Birth *</label>
                                    <div class="input-group">
                                        <i class="fas fa-calendar"></i>
                                        <input type="date" id="editPatientDOB" name="dateOfBirth" required 
                                               value="${patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : ''}">
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.closeModal()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn btn-primary" onclick="app.updatePatient()">
                            <i class="fas fa-save"></i> Update Patient
                        </button>
                    </div>
                </div>
            `;
            this.showModal(modalHtml);
        } catch (error) {
            console.error('Error loading patient for edit:', error);
            this.showNotification('Error loading patient details', 'error');
        }
    }

    async updatePatient() {
        try {
            const form = document.getElementById('editPatientForm');
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const id = document.getElementById('editPatientId').value;
            
            const patientDto = {
                id: parseInt(id),
                fullName: formData.get('fullName')?.trim(),
                email: formData.get('email')?.trim(),
                contactNumber: formData.get('contactNumber')?.trim() || null,
                dateOfBirth: formData.get('dateOfBirth')
            };

            this.showLoading(true);
            await apiService.updatePatient(id, patientDto);
            
            this.showNotification('Patient updated successfully!', 'success');
            this.closeModal();
            
            // Refresh data
            if (this.currentView === 'patients') {
                await this.loadPatientsData();
            }
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Error updating patient:', error);
            this.showNotification('Error updating patient', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deletePatient(id) {
        if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading(true);
            await apiService.deletePatient(id);
            
            this.showNotification('Patient deleted successfully!', 'success');
            
            // Refresh data
            if (this.currentView === 'patients') {
                await this.loadPatientsData();
            }
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Error deleting patient:', error);
            this.showNotification('Error deleting patient', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showModal(html) {
        const container = document.getElementById('modalContainer');
        container.innerHTML = html;
        container.classList.add('show');
    }

    closeModal() {
        const container = document.getElementById('modalContainer');
        container.classList.remove('show');
        setTimeout(() => container.innerHTML = '', 300);
    }

    showLoading(show = true) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.style.display = 'flex';
            } else {
                loadingOverlay.style.display = 'none';
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const messageElement = notification.querySelector('.notification-message');
        const iconElement = notification.querySelector('.notification-icon');

        messageElement.textContent = message;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        iconElement.className = `notification-icon ${icons[type] || icons.info}`;
        notification.className = `notification ${type}`;

        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    renderPagination(entity, totalCount, currentPage, pageSize) {
        const paginationContainer = document.getElementById(`${entity}Pagination`);
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalCount / pageSize);
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHtml = '<div class="pagination">';
        
        // Previous button
        if (currentPage > 1) {
            paginationHtml += `<button onclick="app.load${entity.charAt(0).toUpperCase() + entity.slice(1)}Data(${currentPage - 1}, ${pageSize})" class="btn btn-sm">Previous</button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            paginationHtml += `<button onclick="app.load${entity.charAt(0).toUpperCase() + entity.slice(1)}Data(${i}, ${pageSize})" class="btn btn-sm ${activeClass}">${i}</button>`;
        }

        // Next button
        if (currentPage < totalPages) {
            paginationHtml += `<button onclick="app.load${entity.charAt(0).toUpperCase() + entity.slice(1)}Data(${currentPage + 1}, ${pageSize})" class="btn btn-sm">Next</button>`;
        }

        paginationHtml += '</div>';
        paginationContainer.innerHTML = paginationHtml;
    }

    toggleUserMenu() {
        const menu = document.querySelector('.user-menu');
        menu.classList.toggle('show');
    }

    showProfile() {
        this.showNotification('Profile feature coming soon!', 'info');
    }

    showSettings() {
        this.showNotification('Settings feature coming soon!', 'info');
    }

    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.content-view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Update navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        const activeNavItem = document.querySelector(`[onclick*="show${viewName.charAt(0).toUpperCase() + viewName.slice(1)}"]`)?.parentElement;
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    // Test patient API integration
    async testPatientAPI() {
        console.log('=== TESTING PATIENT API INTEGRATION ===');
        
        try {
            // Test 1: Get all patients
            console.log('Testing GET /api/Patient/all...');
            const allPatients = await apiService.getAllPatients();
            console.log('All patients response:', allPatients);
            
            // Test 2: Get patient by ID (using ID 20 as specified)
            if (allPatients && allPatients.length > 0) {
                const testId = 20; // Use the specific ID you mentioned
                console.log(`Testing GET /api/Patient/${testId}...`);
                
                try {
                    const patientById = await apiService.getPatient(testId);
                    console.log(`Patient ${testId} response:`, patientById);
                } catch (idError) {
                    console.warn(`Patient ID ${testId} not found, trying first available patient...`);
                    const firstPatientId = allPatients[0].id || allPatients[0].Id;
                    const firstPatient = await apiService.getPatient(firstPatientId);
                    console.log(`First patient (ID ${firstPatientId}) response:`, firstPatient);
                }
            }
            
            // Test 3: Check authentication
            console.log('Current user:', this.currentUser);
            console.log('Auth token present:', localStorage.getItem('token') ? 'Yes' : 'No');
            
            this.showNotification('Patient API test completed - check console for details', 'success');
            
        } catch (error) {
            console.error('Patient API test failed:', error);
            this.showNotification(`API Test Failed: ${error.message}`, 'error');
        }
    }

    // Show all patients functionality
    async showAllPatients() {
        try {
            this.showLoading(true);
            const patients = await this.api.getAllPatients();
            
            if (patients && patients.length > 0) {
                this.displayPatientsModal(patients, 'All Patients');
            } else {
                this.showNotification('No patients found', 'info');
            }
        } catch (error) {
            console.error('Error fetching all patients:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Show get patient by ID functionality
    async showGetPatientById() {
        const patientId = prompt('Enter Patient ID:');
        if (!patientId) {
            this.showNotification('Patient ID is required', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            const patient = await this.api.getPatientById(patientId);
            
            if (patient) {
                this.displayPatientsModal([patient], `Patient Details (ID: ${patientId})`);
            } else {
                this.showNotification('Patient not found', 'warning');
            }
        } catch (error) {
            console.error('Error fetching patient by ID:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Delete patient by ID functionality
    async deletePatientById() {
        const patientId = prompt('Enter Patient ID to delete:');
        if (!patientId) {
            this.showNotification('Patient ID is required', 'warning');
            return;
        }

        const confirmDelete = confirm(`Are you sure you want to delete patient with ID: ${patientId}? This action cannot be undone.`);
        if (!confirmDelete) {
            return;
        }

        try {
            this.showLoading(true);
            await this.api.deletePatient(patientId);
            this.showNotification(`Patient with ID ${patientId} deleted successfully`, 'success');
        } catch (error) {
            console.error('Error deleting patient:', error);
            this.showNotification(`Error deleting patient: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Delete patient from modal (with confirmation)
    async deletePatientFromModal(patientId) {
        const confirmDelete = confirm(`Are you sure you want to delete patient with ID: ${patientId}? This action cannot be undone.`);
        if (!confirmDelete) {
            return;
        }

        try {
            this.showLoading(true);
            await this.api.deletePatient(patientId);
            this.showNotification(`Patient with ID ${patientId} deleted successfully`, 'success');
            
            // Close modal and refresh patient list if needed
            const modal = document.getElementById('patientModal');
            if (modal) {
                modal.remove();
            }
        } catch (error) {
            console.error('Error deleting patient:', error);
            this.showNotification(`Error deleting patient: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // ==================== DOCTOR MANAGEMENT FUNCTIONS ====================
    
    // Show all doctors functionality
    async showAllDoctors() {
        try {
            this.showLoading(true);
            const doctors = await this.api.getAllDoctors();
            
            if (doctors && doctors.length > 0) {
                this.displayDoctorsModal(doctors, 'All Doctors');
            } else {
                this.showNotification('No doctors found', 'info');
            }
        } catch (error) {
            console.error('Error fetching all doctors:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Show get doctor by ID functionality
    async showGetDoctorById() {
        const doctorId = prompt('Enter Doctor ID:');
        if (!doctorId) {
            this.showNotification('Doctor ID is required', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            const doctor = await this.api.getDoctorById(doctorId);
            
            if (doctor) {
                this.displayDoctorsModal([doctor], `Doctor Details (ID: ${doctorId})`);
            } else {
                this.showNotification('Doctor not found', 'warning');
            }
        } catch (error) {
            console.error('Error fetching doctor by ID:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Delete doctor by ID functionality
    async deleteDoctorById() {
        const doctorId = prompt('Enter Doctor ID to delete:');
        if (!doctorId) {
            this.showNotification('Doctor ID is required', 'warning');
            return;
        }

        const confirmDelete = confirm(`Are you sure you want to delete doctor with ID: ${doctorId}? This action cannot be undone.`);
        if (!confirmDelete) {
            return;
        }

        try {
            this.showLoading(true);
            await this.api.deleteDoctor(doctorId);
            this.showNotification(`Doctor with ID ${doctorId} deleted successfully`, 'success');
        } catch (error) {
            console.error('Error deleting doctor:', error);
            this.showNotification(`Error deleting doctor: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Delete doctor from modal (with confirmation)
    async deleteDoctorFromModal(doctorId) {
        const confirmDelete = confirm(`Are you sure you want to delete doctor with ID: ${doctorId}? This action cannot be undone.`);
        if (!confirmDelete) {
            return;
        }

        try {
            this.showLoading(true);
            await this.api.deleteDoctor(doctorId);
            this.showNotification(`Doctor with ID ${doctorId} deleted successfully`, 'success');
            
            // Close modal
            const modal = document.getElementById('doctorModal');
            if (modal) {
                modal.remove();
            }
        } catch (error) {
            console.error('Error deleting doctor:', error);
            this.showNotification(`Error deleting doctor: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Display doctors in a modal
    displayDoctorsModal(doctors, title) {
        const modalHTML = `
            <div id="doctorModal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 90vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px;">
                        <h2 style="margin: 0; color: #333; font-size: 24px;">
                            <i class="fas fa-user-md" style="color: #28a745; margin-right: 10px;"></i>
                            ${title}
                        </h2>
                        <button onclick="document.getElementById('doctorModal').remove()" style="background: #dc3545; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            ×
                        </button>
                    </div>
                    <div style="margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #28a745, #20c997); color: white;">
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">ID</th>
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Full Name</th>
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Email</th>
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Contact</th>
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Specialty</th>
                                    <th style="padding: 15px 10px; text-align: center; font-weight: 600;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${doctors.map((doctor, index) => {
                                    const doctorId = doctor.id || doctor.Id || doctor.doctorId || doctor.DoctorId;
                                    const fullName = doctor.fullName || doctor.FullName || 'N/A';
                                    const email = doctor.email || doctor.Email || 'N/A';
                                    const contact = doctor.contactNumber || doctor.ContactNumber || 'N/A';
                                    const specialty = doctor.specialty || doctor.Specialty || 'N/A';
                                    const rowColor = index % 2 === 0 ? '#f8f9fa' : 'white';
                                    
                                    return `
                                    <tr style="background: ${rowColor}; transition: background-color 0.2s;" onmouseover="this.style.background='#e8f5e8'" onmouseout="this.style.background='${rowColor}'">
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd; font-weight: 500;">${doctorId}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd;">${fullName}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd; color: #0066cc;">${email}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd;">${contact}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd; font-weight: 500; color: #28a745;">${specialty}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd; text-align: center;">
                                            <button onclick="alert('View Doctor ID: ${doctorId}')" style="background: #28a745; color: white; border: none; padding: 6px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="View Details">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button onclick="alert('Edit Doctor ID: ${doctorId}')" style="background: #ffc107; color: #212529; border: none; padding: 6px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="window.app.deleteDoctorFromModal('${doctorId}')" style="background: #dc3545; color: white; border: none; padding: 6px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
                        <button onclick="document.getElementById('doctorModal').remove()" style="background: #6c757d; color: white; padding: 12px 30px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 500;">
                            <i class="fas fa-times" style="margin-right: 8px;"></i>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('doctorModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal directly to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Display patients in a modal
    displayPatientsModal(patients, title) {
        // Create modal directly in document body to ensure visibility
        const modalHTML = `
            <div id="patientModal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 90vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px;">
                        <h2 style="margin: 0; color: #333; font-size: 24px;">
                            <i class="fas fa-users" style="color: #007bff; margin-right: 10px;"></i>
                            ${title}
                        </h2>
                        <button onclick="document.getElementById('patientModal').remove()" style="background: #dc3545; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            ×
                        </button>
                    </div>
                    <div style="margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #007bff, #0056b3); color: white;">
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">ID</th>
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Full Name</th>
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Email</th>
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Contact</th>
                                    <th style="padding: 15px 10px; text-align: center; font-weight: 600;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${patients.map((patient, index) => {
                                    const patientId = patient.id || patient.Id || patient.patientId || patient.PatientId;
                                    const fullName = patient.fullName || patient.FullName || 'N/A';
                                    const email = patient.email || patient.Email || 'N/A';
                                    const contact = patient.contactNumber || patient.ContactNumber || 'N/A';
                                    const rowColor = index % 2 === 0 ? '#f8f9fa' : 'white';
                                    
                                    return `
                                    <tr style="background: ${rowColor}; transition: background-color 0.2s;" onmouseover="this.style.background='#e3f2fd'" onmouseout="this.style.background='${rowColor}'">
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd; font-weight: 500;">${patientId}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd;">${fullName}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd; color: #0066cc;">${email}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd;">${contact}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd; text-align: center;">
                                            <button onclick="alert('View Patient ID: ${patientId}')" style="background: #28a745; color: white; border: none; padding: 6px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="View Details">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button onclick="alert('Edit Patient ID: ${patientId}')" style="background: #ffc107; color: #212529; border: none; padding: 6px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="window.app.deletePatientFromModal('${patientId}')" style="background: #dc3545; color: white; border: none; padding: 6px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
                        <button onclick="document.getElementById('patientModal').remove()" style="background: #6c757d; color: white; padding: 12px 30px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 500;">
                            <i class="fas fa-times" style="margin-right: 8px;"></i>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Remove any existing modal
        const existingModal = document.getElementById('patientModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal directly to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Medical Records Management
    async showMedicalRecords() {
        try {
            // Hide all content views
            document.querySelectorAll('.content-view').forEach(view => {
                view.classList.remove('active');
            });
            
            // Show medical records view
            const medicalRecordsView = document.getElementById('medicalRecordsView');
            if (medicalRecordsView) {
                medicalRecordsView.classList.add('active');
            }
            
            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            const medicalRecordsNav = document.getElementById('medicalRecordsNav');
            if (medicalRecordsNav) {
                medicalRecordsNav.classList.add('active');
            }
            
            await this.loadMedicalRecords();
        } catch (error) {
            console.error('Error showing medical records:', error);
            this.showNotification('Error loading medical records', 'error');
        }
    }

    async loadMedicalRecords() {
        try {
            console.log('Loading medical records...');
            this.showLoading('medicalRecordsTableBody');
            const records = await this.api.getAllMedicalRecords();
            console.log('Medical records received:', records);
            this.displayMedicalRecords(records);
        } catch (error) {
            console.error('Error loading medical records:', error);
            this.showNotification('Error loading medical records', 'error');
            document.getElementById('medicalRecordsTableBody').innerHTML = '<tr><td colspan="6">Error loading medical records</td></tr>';
        }
    }

    displayMedicalRecords(records) {
        console.log('Displaying medical records:', records);
        const tbody = document.getElementById('medicalRecordsTableBody');
        
        if (!tbody) {
            console.error('Medical records table body not found');
            return;
        }
        
        if (!records || records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No medical records found</td></tr>';
            return;
        }

        tbody.innerHTML = records.map(record => `
            <tr>
                <td>${record.id}</td>
                <td>${record.patientName || 'Unknown Patient'}</td>
                <td>${record.doctorName || 'Unknown Doctor'}</td>
                <td>${record.diagnosis || 'N/A'}</td>
                <td>${new Date(record.recordDate).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="app.viewMedicalRecord(${record.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteMedicalRecord(${record.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        console.log('Medical records table updated with', records.length, 'records');
    }

    async getMedicalRecordById() {
        const idInput = document.getElementById('medicalRecordIdInput');
        const id = idInput.value.trim();
        
        if (!id) {
            this.showNotification('Please enter a Medical Record ID', 'warning');
            return;
        }

        try {
            this.showLoading('medicalRecordsTableBody');
            const record = await this.api.getMedicalRecordById(parseInt(id));
            
            if (!record) {
                document.getElementById('medicalRecordsTableBody').innerHTML = '<tr><td colspan="6">Medical record not found</td></tr>';
                this.showNotification('Medical record not found', 'error');
                return;
            }

            // Display single record in table
            this.displayMedicalRecords([record]);
            this.showNotification(`Medical record ${id} loaded successfully`, 'success');
        } catch (error) {
            console.error('Error fetching medical record:', error);
            this.showNotification('Error fetching medical record', 'error');
            document.getElementById('medicalRecordsTableBody').innerHTML = '<tr><td colspan="6">Error loading medical record</td></tr>';
        }
    }

    async showAllMedicalRecords() {
        document.getElementById('medicalRecordIdInput').value = '';
        await this.loadMedicalRecords();
    }

    showGetMedicalRecordById() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-search"></i> Get Medical Record by ID</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="modalMedicalRecordId">Medical Record ID</label>
                        <input type="number" id="modalMedicalRecordId" placeholder="Enter Medical Record ID" class="form-control">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="app.searchMedicalRecordFromModal()">Search</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    async searchMedicalRecordFromModal() {
        const idInput = document.getElementById('modalMedicalRecordId');
        const id = idInput.value.trim();
        
        if (!id) {
            this.showNotification('Please enter a Medical Record ID', 'warning');
            return;
        }

        // Close modal and update main search input
        document.querySelector('.modal').remove();
        document.getElementById('medicalRecordIdInput').value = id;
        
        // Perform search
        await this.getMedicalRecordById();
    }

    async viewMedicalRecord(id) {
        try {
            const record = await this.api.getMedicalRecordById(id);
            if (!record) {
                this.showNotification('Medical record not found', 'error');
                return;
            }
            this.showMedicalRecordModal(record);
        } catch (error) {
            console.error('Error fetching medical record:', error);
            this.showNotification('Error fetching medical record details', 'error');
        }
    }

    showMedicalRecordModal(record) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-file-medical"></i> Medical Record Details</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="record-details">
                        <div class="detail-row">
                            <label>Record ID:</label>
                            <span>${record.id}</span>
                        </div>
                        <div class="detail-row">
                            <label>Patient:</label>
                            <span>${record.patientName || 'Unknown Patient'}</span>
                        </div>
                        <div class="detail-row">
                            <label>Doctor:</label>
                            <span>${record.doctorName || 'Unknown Doctor'}</span>
                        </div>
                        <div class="detail-row">
                            <label>Diagnosis:</label>
                            <span>${record.diagnosis || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <label>Description:</label>
                            <span>${record.description || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <label>Treatment:</label>
                            <span>${record.treatment || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <label>Record Date:</label>
                            <span>${new Date(record.recordDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    async deleteMedicalRecord(id) {
        if (!confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
            return;
        }

        try {
            await this.api.deleteMedicalRecord(id);
            this.showNotification('Medical record deleted successfully', 'success');
            await this.loadMedicalRecords(); // Refresh the list
        } catch (error) {
            console.error('Error deleting medical record:', error);
            this.showNotification('Error deleting medical record', 'error');
        }
    }

    async showAddMedicalRecord() {
        try {
            // Load patients and doctors for dropdowns
            const [patients, doctors] = await Promise.all([
                this.api.getAllPatients(),
                this.api.getAllDoctors()
            ]);
            this.showAddMedicalRecordModal(patients, doctors);
        } catch (error) {
            console.error('Error loading data for medical record form:', error);
            this.showNotification('Error loading form data', 'error');
        }
    }

    showAddMedicalRecordModal(patients, doctors) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-file-medical"></i> Add Medical Record</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="addMedicalRecordForm">
                        <div class="form-group">
                            <label for="patientSelect">Patient *</label>
                            <select id="patientSelect" name="patientId" required>
                                <option value="">Select Patient</option>
                                ${patients.map(patient => `<option value="${patient.id}">${patient.fullName}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="doctorSelect">Doctor *</label>
                            <select id="doctorSelect" name="doctorId" required>
                                <option value="">Select Doctor</option>
                                ${doctors.map(doctor => `<option value="${doctor.id}">${doctor.fullName}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="diagnosis">Diagnosis *</label>
                            <input type="text" id="diagnosis" name="diagnosis" required placeholder="Enter diagnosis">
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description" rows="3" placeholder="Enter detailed description"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="treatment">Treatment</label>
                            <textarea id="treatment" name="treatment" rows="3" placeholder="Enter treatment plan"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="recordDate">Record Date *</label>
                            <input type="date" id="recordDate" name="recordDate" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="app.createMedicalRecord()">Create Record</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    async createMedicalRecord() {
        const form = document.getElementById('addMedicalRecordForm');
        const formData = new FormData(form);
        
        const recordData = {
            patientId: parseInt(formData.get('patientId')),
            doctorId: parseInt(formData.get('doctorId')),
            diagnosis: formData.get('diagnosis'),
            description: formData.get('description') || '',
            treatment: formData.get('treatment') || '',
            recordDate: formData.get('recordDate')
        };

        // Validate required fields
        if (!recordData.patientId || !recordData.doctorId || !recordData.diagnosis) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            await this.api.createMedicalRecord(recordData);
            this.showNotification('Medical record created successfully', 'success');
            document.querySelector('.modal').remove();
            await this.loadMedicalRecords(); // Refresh the list
        } catch (error) {
            console.error('Error creating medical record:', error);
            this.showNotification('Error creating medical record', 'error');
        }
    }

    // Placeholder methods for other features
    async showDoctors() { this.showNotification('Doctors management coming soon', 'info'); }
    async showAppointments() { this.showNotification('Appointments management coming soon', 'info'); }
    async showAddDoctor() {
        this.showAddDoctorModal();
    }

    // Show add doctor modal form
    showAddDoctorModal() {
        const modalHTML = `
            <div id="addDoctorModal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px;">
                        <h2 style="margin: 0; color: #333; font-size: 24px;">
                            <i class="fas fa-user-md" style="color: #28a745; margin-right: 10px;"></i>
                            Add New Doctor
                        </h2>
                        <button onclick="document.getElementById('addDoctorModal').remove()" style="background: #dc3545; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            ×
                        </button>
                    </div>
                    <form id="addDoctorForm" style="margin: 20px 0;">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Full Name *</label>
                            <input type="text" id="doctorFullName" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;" placeholder="Enter doctor's full name">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Email *</label>
                            <input type="email" id="doctorEmail" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;" placeholder="Enter email address">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Contact Number *</label>
                            <input type="tel" id="doctorContact" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;" placeholder="Enter contact number">
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Specialty *</label>
                            <select id="doctorSpecialty" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                                <option value="">Select Specialty</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Neurology">Neurology</option>
                                <option value="Orthopedics">Orthopedics</option>
                                <option value="Pediatrics">Pediatrics</option>
                                <option value="Dermatology">Dermatology</option>
                                <option value="Psychiatry">Psychiatry</option>
                                <option value="General Medicine">General Medicine</option>
                                <option value="Surgery">Surgery</option>
                                <option value="Gynecology">Gynecology</option>
                                <option value="Oncology">Oncology</option>
                                <option value="Radiology">Radiology</option>
                                <option value="Anesthesiology">Anesthesiology</option>
                            </select>
                        </div>
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="button" onclick="document.getElementById('addDoctorModal').remove()" style="background: #6c757d; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                <i class="fas fa-times" style="margin-right: 8px;"></i>
                                Cancel
                            </button>
                            <button type="submit" style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                <i class="fas fa-user-plus" style="margin-right: 8px;"></i>
                                Add Doctor
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('addDoctorModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add form submit handler
        const form = document.getElementById('addDoctorForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddDoctor();
        });
    }

    // Handle doctor creation
    async handleAddDoctor() {
        const fullName = document.getElementById('doctorFullName').value.trim();
        const email = document.getElementById('doctorEmail').value.trim();
        const contactNumber = document.getElementById('doctorContact').value.trim();
        const specialty = document.getElementById('doctorSpecialty').value;

        // Validation
        if (!fullName || !email || !contactNumber || !specialty) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Please enter a valid email address', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            
            const doctorData = {
                fullName,
                email,
                contactNumber,
                specialty
            };

            await this.api.createDoctor(doctorData);
            this.showNotification(`Doctor ${fullName} added successfully!`, 'success');
            
            // Close modal
            const modal = document.getElementById('addDoctorModal');
            if (modal) {
                modal.remove();
            }
        } catch (error) {
            console.error('Error creating doctor:', error);
            this.showNotification(`Error creating doctor: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    // ==================== APPOINTMENT MANAGEMENT ====================
    async showAllAppointments() {
        try {
            this.showLoading(true);
            const appointments = await this.api.getAllAppointments();
            
            if (appointments && appointments.length > 0) {
                this.displayAppointmentsModal(appointments, 'All Appointments');
            } else {
                this.showNotification('No appointments found', 'info');
            }
        } catch (error) {
            console.error('Error fetching all appointments:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async showGetAppointmentById() {
        const appointmentId = prompt('Enter Appointment ID:');
        if (!appointmentId) {
            this.showNotification('Appointment ID is required', 'warning');
            return;
        }
        try {
            this.showLoading(true);
            const appointment = await this.api.getAppointmentById(appointmentId);
            
            if (appointment) {
                this.displayAppointmentsModal([appointment], `Appointment Details (ID: ${appointmentId})`);
            } else {
                this.showNotification('Appointment not found', 'warning');
            }
        } catch (error) {
            console.error('Error fetching appointment by ID:', error);
            if (error.message.includes('404')) {
                this.showNotification(`Appointment with ID ${appointmentId} not found. Please check the ID and try again.`, 'warning');
            } else {
                this.showNotification(`Error: ${error.message}`, 'error');
            }
        } finally {
            this.showLoading(false);
        }
    }

    async deleteAppointmentById() {
        const appointmentId = prompt('Enter Appointment ID to delete:');
        if (!appointmentId) {
            this.showNotification('Appointment ID is required', 'warning');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete appointment ${appointmentId}?`)) {
            return;
        }
        
        try {
            this.showLoading(true);
            await this.api.deleteAppointment(appointmentId);
            this.showNotification(`Appointment ${appointmentId} deleted successfully!`, 'success');
        } catch (error) {
            console.error('Error deleting appointment:', error);
            this.showNotification(`Error deleting appointment: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async cancelAppointmentById() {
        const appointmentId = prompt('Enter Appointment ID to cancel:');
        if (!appointmentId) {
            this.showNotification('Appointment ID is required', 'warning');
            return;
        }
        
        if (!confirm(`Are you sure you want to cancel appointment ${appointmentId}?`)) {
            return;
        }
        
        try {
            this.showLoading(true);
            await this.api.cancelAppointment(appointmentId);
            this.showNotification(`Appointment ${appointmentId} cancelled successfully!`, 'success');
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            this.showNotification(`Error cancelling appointment: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteAppointmentFromModal(appointmentId) {
        if (!confirm(`Are you sure you want to delete appointment ${appointmentId}?`)) {
            return;
        }
        
        try {
            this.showLoading(true);
            await this.api.deleteAppointment(appointmentId);
            this.showNotification(`Appointment ${appointmentId} deleted successfully!`, 'success');
            
            const modal = document.getElementById('appointmentModal');
            if (modal) modal.remove();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            this.showNotification(`Error deleting appointment: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async cancelAppointmentFromModal(appointmentId) {
        if (!confirm(`Are you sure you want to cancel appointment ${appointmentId}?`)) {
            return;
        }
        
        try {
            this.showLoading(true);
            await this.api.cancelAppointment(appointmentId);
            this.showNotification(`Appointment ${appointmentId} cancelled successfully!`, 'success');
            
            const modal = document.getElementById('appointmentModal');
            if (modal) modal.remove();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            this.showNotification(`Error cancelling appointment: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayAppointmentsModal(appointments, title) {
        const modalHTML = `
            <div id="appointmentModal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px;">
                        <h2 style="margin: 0; color: #333; font-size: 24px;">
                            <i class="fas fa-calendar-alt" style="color: #007bff; margin-right: 10px;"></i>
                            ${title}
                        </h2>
                        <button onclick="document.getElementById('appointmentModal').remove()" style="background: #dc3545; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            ×
                        </button>
                    </div>
                    <div style="margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #007bff, #0056b3); color: white;">
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">ID</th>
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Patient</th>
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Doctor</th>
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Date</th>
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Time</th>
                                    <th style="padding: 15px 10px; text-align: left; font-weight: 600;">Status</th>
                                    <th style="padding: 15px 10px; text-align: center; font-weight: 600;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${appointments.map((appointment, index) => {
                                    const appointmentId = appointment.id || appointment.Id || appointment.appointmentId || appointment.AppointmentId;
                                    const patientName = appointment.patientName || appointment.PatientName || appointment.patient?.fullName || appointment.Patient?.FullName || 'N/A';
                                    const doctorName = appointment.doctorName || appointment.DoctorName || appointment.doctor?.fullName || appointment.Doctor?.FullName || 'N/A';
                                    const appointmentDate = appointment.appointmentDate || appointment.AppointmentDate || 'N/A';
                                    const appointmentTime = appointment.appointmentTime || appointment.AppointmentTime || 'N/A';
                                    const status = appointment.status || appointment.Status || 'N/A';
                                    const rowColor = index % 2 === 0 ? '#f8f9fa' : 'white';
                                    return `
                                    <tr style="background: ${rowColor}; transition: background-color 0.2s;" onmouseover="this.style.background='#e3f2fd'" onmouseout="this.style.background='${rowColor}'">
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd; font-weight: 500;">${appointmentId}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd;">${patientName}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd;">${doctorName}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd;">${appointmentDate}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd;">${appointmentTime}</td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd;"><span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${status === 'Scheduled' ? '#28a745' : status === 'Cancelled' ? '#dc3545' : '#ffc107'}; color: white;">${status}</span></td>
                                        <td style="padding: 12px 10px; border-bottom: 1px solid #ddd; text-align: center;">
                                            <button onclick="alert('View Appointment ID: ${appointmentId}')" style="background: #28a745; color: white; border: none; padding: 6px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="View Details">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button onclick="alert('Edit Appointment ID: ${appointmentId}')" style="background: #ffc107; color: #212529; border: none; padding: 6px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="app.cancelAppointmentFromModal('${appointmentId}')" style="background: #fd7e14; color: white; border: none; padding: 6px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Cancel">
                                                <i class="fas fa-ban"></i>
                                            </button>
                                            <button onclick="app.deleteAppointmentFromModal('${appointmentId}')" style="background: #dc3545; color: white; border: none; padding: 6px 12px; margin: 0 2px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
                        <button onclick="document.getElementById('appointmentModal').remove()" style="background: #6c757d; color: white; padding: 12px 30px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 500;">
                            <i class="fas fa-times" style="margin-right: 8px;"></i>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('appointmentModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal directly to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    async showAddAppointment() {
        this.showAddAppointmentModal();
    }

    showAddAppointmentModal() {
        const modalHTML = `
            <div id="addAppointmentModal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;">
                <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 15px;">
                        <h2 style="margin: 0; color: #333; font-size: 24px;">
                            <i class="fas fa-calendar-plus" style="color: #007bff; margin-right: 10px;"></i>
                            Add New Appointment
                        </h2>
                        <button onclick="document.getElementById('addAppointmentModal').remove()" style="background: #dc3545; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            ×
                        </button>
                    </div>
                    <form id="addAppointmentForm" style="margin: 20px 0;">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Patient ID *</label>
                            <input type="number" id="appointmentPatientId" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;" placeholder="Enter patient ID">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Doctor ID *</label>
                            <input type="number" id="appointmentDoctorId" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;" placeholder="Enter doctor ID">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Appointment Date *</label>
                            <input type="date" id="appointmentDate" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;" min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Appointment Time *</label>
                            <input type="time" id="appointmentTime" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Symptoms</label>
                            <textarea id="appointmentSymptoms" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; box-sizing: border-box; min-height: 80px; resize: vertical;" placeholder="Enter symptoms or reason for appointment"></textarea>
                        </div>
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="button" onclick="document.getElementById('addAppointmentModal').remove()" style="background: #6c757d; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                <i class="fas fa-times" style="margin-right: 8px;"></i>
                                Cancel
                            </button>
                            <button type="submit" style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
                                <i class="fas fa-calendar-plus" style="margin-right: 8px;"></i>
                                Create Appointment
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('addAppointmentModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal directly to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add form submit handler
        const form = document.getElementById('addAppointmentForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddAppointment();
        });
    }

    async handleAddAppointment() {
        const patientId = document.getElementById('appointmentPatientId').value.trim();
        const doctorId = document.getElementById('appointmentDoctorId').value.trim();
        const appointmentDate = document.getElementById('appointmentDate').value;
        const appointmentTime = document.getElementById('appointmentTime').value;
        const symptoms = document.getElementById('appointmentSymptoms').value.trim();

        if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            const appointmentData = {
                patientId: parseInt(patientId),
                doctorId: parseInt(doctorId),
                appointmentDate,
                appointmentTime,
                symptoms
            };
            await this.api.createAppointment(appointmentData);
            this.showNotification('Appointment created successfully!', 'success');
            const modal = document.getElementById('addAppointmentModal');
            if (modal) modal.remove();
        } catch (error) {
            console.error('Error creating appointment:', error);
            this.showNotification(`Error creating appointment: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    async showAddPrescription() { this.showNotification('Add Prescription coming soon', 'info'); }
    async showAddMedicalRecord() { this.showNotification('Add Medical Record coming soon', 'info'); }
    async showAddTest() { this.showNotification('Add Test coming soon', 'info'); }
    async showAddDosage() { this.showNotification('Add Dosage coming soon', 'info'); }
    async showAddAdmin() {
        // Role hierarchy check - SuperAdmin can create Admin/Doctor, Admin can create Doctor/Patient
        const userType = this.currentUser?.userType?.toLowerCase();
        if (!userType || (userType !== 'superadmin' && userType !== 'admin')) {
            this.showNotification('Access denied. Only Super Admins and Admins can create staff accounts.', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add New Administrator</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form id="addAdminForm" class="modal-form">
                    <div class="form-group">
                        <label for="adminFullName">Full Name</label>
                        <input type="text" id="adminFullName" name="fullName" required>
                    </div>
                    <div class="form-group">
                        <label for="adminEmail">Email</label>
                        <input type="email" id="adminEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="adminPassword">Password</label>
                        <input type="password" id="adminPassword" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="adminUserType">Role</label>
                        <select id="adminUserType" name="userType" required>
                            ${userType === 'superadmin' ? '<option value="SuperAdmin">Super Administrator</option>' : ''}
                            ${userType === 'superadmin' ? '<option value="Admin">Administrator</option>' : ''}
                            <option value="Doctor">Doctor</option>
                            <option value="Patient">Patient</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Account</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Handle form submission
        document.getElementById('addAdminForm').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                password: formData.get('password'),
                userType: formData.get('userType')
            };
            
            try {
                await this.api.registerStaff(userData);
                this.showNotification(`${userData.userType} account created successfully!`, 'success');
                modal.remove();
            } catch (error) {
                console.error('Staff registration error:', error);
                this.showNotification(`Failed to create account: ${error.message}`, 'error');
            }
        };
    }
}

// Global functions for HTML onclick handlers
function showLogin() { if (window.app) app.showLogin(); }
function showRegister() { if (window.app) app.showRegister(); }
function showDashboard() { if (window.app) app.showDashboard(); }
function showPatients() { if (window.app) app.showPatients(); }
function showDoctors() { if (window.app) app.showDoctors(); }
function showAppointments() { if (window.app) app.showAppointments(); }
function showMedicalRecords() { if (window.app) app.showMedicalRecords(); }

window.showAllPatients = function() {
    if (window.app) {
        app.showAllPatients();
    }
};

window.showGetPatientById = function() {
    if (window.app) {
        app.showGetPatientById();
    }
};

window.deletePatientById = function() {
    if (window.app) {
        app.deletePatientById();
    }
};

window.showAllDoctors = function() {
    if (window.app && window.app.showAllDoctors) {
        window.app.showAllDoctors();
    } else {
        console.error('App instance not found or showAllDoctors method missing');
    }
};

window.showGetDoctorById = function() {
    if (window.app && window.app.showGetDoctorById) {
        window.app.showGetDoctorById();
    } else {
        console.error('App instance not found or showGetDoctorById method missing');
    }
};

window.deleteDoctorById = function() {
    if (window.app && window.app.deleteDoctorById) {
        window.app.deleteDoctorById();
    } else {
        console.error('App instance not found or deleteDoctorById method missing');
    }
};

// Appointment Management Global Functions
function showAllAppointments() {
    if (window.app) {
        app.showAllAppointments();
    }
}

function showGetAppointmentById() {
    if (window.app) {
        app.showGetAppointmentById();
    }
}

function deleteAppointmentById() {
    if (window.app) {
        app.deleteAppointmentById();
    }
}

function cancelAppointmentById() {
    if (window.app) {
        app.cancelAppointmentById();
    }
}

function showAddAppointment() {
    if (window.app) {
        app.showAddAppointment();
    }
}

// Toggle functions for expandable sidebar menus
window.togglePatientManagement = function() {
    console.log('togglePatientManagement called');
    const subMenu = document.getElementById('patientSubMenu');
    const expandIcon = document.querySelector('#patientsNav .expand-icon');
    const navItem = document.getElementById('patientsNav');
    
    console.log('Elements found:', {
        subMenu: !!subMenu,
        expandIcon: !!expandIcon,
        navItem: !!navItem
    });
    
    if (!subMenu || !expandIcon || !navItem) {
        console.error('Required elements not found for patient management toggle');
        return;
    }
    
    // Check if submenu is currently visible
    const isVisible = subMenu.style.display === 'block' || window.getComputedStyle(subMenu).display === 'block';
    
    if (isVisible) {
        subMenu.style.display = 'none';
        expandIcon.classList.remove('fa-chevron-up');
        expandIcon.classList.add('fa-chevron-down');
        navItem.classList.remove('expanded');
        console.log('Collapsed patient submenu');
    } else {
        subMenu.style.display = 'block';
        expandIcon.classList.remove('fa-chevron-down');
        expandIcon.classList.add('fa-chevron-up');
        navItem.classList.add('expanded');
        console.log('Expanded patient submenu');
    }
};

window.toggleDoctorManagement = function() {
    console.log('toggleDoctorManagement called');
    const subMenu = document.getElementById('doctorSubMenu');
    const expandIcon = document.querySelector('#doctorsNav .expand-icon');
    const navItem = document.getElementById('doctorsNav');
    
    if (!subMenu || !expandIcon || !navItem) {
        console.error('Required elements not found for doctor management toggle');
        return;
    }
    
    // Check if submenu is currently visible
    const isVisible = subMenu.style.display === 'block' || window.getComputedStyle(subMenu).display === 'block';
    
    if (isVisible) {
        subMenu.style.display = 'none';
        expandIcon.classList.remove('fa-chevron-up');
        expandIcon.classList.add('fa-chevron-down');
        navItem.classList.remove('expanded');
        console.log('Collapsed doctor submenu');
    } else {
        subMenu.style.display = 'block';
        expandIcon.classList.remove('fa-chevron-down');
        expandIcon.classList.add('fa-chevron-up');
        navItem.classList.add('expanded');
        console.log('Expanded doctor submenu');
    }
};

window.toggleAppointmentManagement = function() {
    console.log('toggleAppointmentManagement called');
    const subMenu = document.getElementById('appointmentSubMenu');
    const expandIcon = document.querySelector('#appointmentsNav .expand-icon');
    const navItem = document.getElementById('appointmentsNav');
    
    if (!subMenu || !expandIcon || !navItem) {
        console.error('Required elements not found for appointment management toggle');
        return;
    }
    
    // Check if submenu is currently visible
    const isVisible = subMenu.style.display === 'block' || window.getComputedStyle(subMenu).display === 'block';
    
    if (isVisible) {
        subMenu.style.display = 'none';
        expandIcon.classList.remove('fa-chevron-up');
        expandIcon.classList.add('fa-chevron-down');
        navItem.classList.remove('expanded');
        console.log('Collapsed appointment submenu');
    } else {
        subMenu.style.display = 'block';
        expandIcon.classList.remove('fa-chevron-down');
        expandIcon.classList.add('fa-chevron-up');
        navItem.classList.add('expanded');
        console.log('Expanded appointment submenu');
    }
};

function logout() { if (window.app) app.logout(); }

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = passwordInput?.nextElementSibling;
    const icon = toggleBtn?.querySelector('i');
    
    if (passwordInput && icon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
}

function toggleRegisterPassword() {
    const passwordInput = document.getElementById('regPassword');
    const toggleBtn = passwordInput?.nextElementSibling;
    const icon = toggleBtn?.querySelector('i');
    
    if (passwordInput && icon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
}

function toggleUserMenu() { if (window.app) app.toggleUserMenu(); }
function showProfile() { if (window.app) app.showProfile(); }
function showSettings() { if (window.app) app.showSettings(); }
function showAddPatient() { if (window.app) app.showAddPatient(); }
function showAddDoctor() { if (window.app) app.showAddDoctor(); }
function showAddAppointment() { if (window.app) app.showAddAppointment(); }
function showAddPrescription() { if (window.app) app.showAddPrescription(); }
function showAddMedicalRecord() { if (window.app) app.showAddMedicalRecord(); }
function showAddTest() { if (window.app) app.showAddTest(); }
function showAddDosage() { if (window.app) app.showAddDosage(); }
function showAddAdmin() { if (window.app) app.showAddAdmin(); }

// Patient Dashboard Global Functions
function showPatientDashboard() { if (window.app) app.showPatientDashboard(); }
function showMyAppointments() { if (window.app) app.showMyAppointments(); }
function showMyMedicalRecords() { if (window.app) app.showMyMedicalRecords(); }
function showBookAppointment() { if (window.app) app.showBookAppointment(); }
function showPatientProfile() { if (window.app) app.showPatientProfile(); }
function showMyPrescriptions() { if (window.app) app.showMyPrescriptions(); }
function editPatientProfile() { if (window.app) app.editPatientProfile(); }

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PAmazeCareApp();
    window.app = app; // Make globally accessible
});
