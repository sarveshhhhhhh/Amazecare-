// PAmazeCare Hospital Management System - Main Application Logic
class PAmazeCareApp {
    constructor() {
        this.currentUser = null;
        this.currentView = 'dashboard';
        this.currentPage = 1;
        this.pageSize = 10;
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Close modal on background click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-container')) {
                this.closeModal();
            }
        });
    }

    // ==================== AUTHENTICATION ====================
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
            const loginDto = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            const response = await apiService.login(loginDto);
            console.log('Login response:', response);
            
            if (response && response.token) {
                localStorage.setItem('authToken', response.token);
                
                // Check for hardcoded admin credentials as fallback
                const isHardcodedAdmin = loginDto.email === 'hexa@gmail.com' && loginDto.password === 'Hexa@10';
                
                const user = {
                    email: response.email || loginDto.email,
                    fullName: response.fullName,
                    userType: isHardcodedAdmin ? 'Admin' : response.userType,
                    token: response.token,
                    isAdmin: isHardcodedAdmin || response.userType?.toLowerCase() === 'admin'
                };
                
                console.log('User object created:', user);
                console.log('UserType from response:', response.userType);
                console.log('IsHardcodedAdmin:', isHardcodedAdmin);

                // For patients, try to fetch and store patient ID
                if (user.userType?.toLowerCase() === 'patient') {
                    await this.fetchPatientId(user.email);
                }
                
                // For doctors, try to fetch and store doctor ID
                if (user.userType?.toLowerCase() === 'doctor') {
                    await this.fetchDoctorId(user.email);
                }
                
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUser = user;
                
                this.showNotification('Login successful!', 'success');
                this.showDashboard();
                this.updateUserInterface();
            } else {
                throw new Error('Invalid login response');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please check your credentials.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        this.showLoading(true);

        try {
            const formData = new FormData(event.target);
            const registerDto = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                password: formData.get('password'),
                userType: formData.get('userType')
            };

            await apiService.register(registerDto);
            this.showNotification('Registration successful! Please login.', 'success');
            this.showLogin();
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showLogin();
        this.showNotification('Logged out successfully', 'info');
    }

    // ==================== UI NAVIGATION ====================
    showLogin() {
        this.hideAllPages();
        document.getElementById('loginPage').classList.add('active');
    }

    showRegister() {
        this.hideAllPages();
        document.getElementById('registerPage').classList.add('active');
    }

    showDashboard() {
        this.hideAllPages();
        
        const userType = this.currentUser?.userType?.toLowerCase();
        console.log('showDashboard - currentUser:', this.currentUser);
        console.log('showDashboard - userType:', userType);
        console.log('showDashboard - isAdmin:', this.currentUser?.isAdmin);
        
        if (userType === 'doctor') {
            console.log('Routing to doctor dashboard');
            document.getElementById('doctorDashboardPage').classList.add('active');
            this.showDoctorView('doctorDashboard');
            this.loadDoctorDashboardData();
        } else if (userType === 'patient') {
            console.log('Routing to patient dashboard');
            document.getElementById('patientDashboardPage').classList.add('active');
            this.showPatientView('patientDashboard');
            this.loadPatientDashboardData();
        } else if (userType === 'admin' || (this.currentUser && this.currentUser.isAdmin)) {
            console.log('Routing to admin dashboard');
            document.getElementById('dashboardPage').classList.add('active');
            this.showView('dashboard');
            this.loadDashboardData();
        } else {
            console.log('Routing to default dashboard');
            document.getElementById('dashboardPage').classList.add('active');
            this.showView('dashboard');
            this.loadDashboardData();
        }
    }

    hideAllPages() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
    }

    showView(viewName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelectorAll('.content-view').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }

        const navItem = document.querySelector(`[onclick="show${viewName.charAt(0).toUpperCase() + viewName.slice(1)}()"]`)?.parentElement;
        if (navItem) {
            navItem.classList.add('active');
        }

        this.currentView = viewName;
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        const userType = this.currentUser?.userType?.toLowerCase();
        
        // Update username display based on dashboard type
        if (userType === 'doctor') {
            const doctorUserNameElement = document.getElementById('doctorUserName');
            if (doctorUserNameElement) {
                doctorUserNameElement.textContent = `Welcome, Dr. ${this.currentUser.email}`;
            }
        } else if (userType === 'patient') {
            const patientUserNameElement = document.getElementById('patientUserName');
            if (patientUserNameElement) {
                patientUserNameElement.textContent = `Welcome, ${this.currentUser.email}`;
            }
        } else {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = `Welcome, ${this.currentUser.email}`;
            }
        }

        this.updateNavigationByRole();
    }

    updateNavigationByRole() {
        const userType = this.currentUser?.userType?.toLowerCase() || 'patient';
        
        const rolePermissions = {
            admin: ['patients', 'doctors', 'appointments', 'medicalRecords', 'prescriptions', 'tests', 'dosage', 'admin'],
            doctor: ['patients', 'appointments', 'medicalRecords', 'prescriptions', 'tests'],
            patient: ['appointments', 'medicalRecords', 'prescriptions']
        };

        const allowedViews = rolePermissions[userType] || rolePermissions.patient;

        document.querySelectorAll('.nav-item').forEach(item => {
            const navId = item.id.replace('Nav', '').toLowerCase();
            if (navId === '' || navId === 'dashboard') return;

            if (allowedViews.includes(navId)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // For patients, check if they have created their patient profile
        if (userType === 'patient') {
            this.checkPatientProfile();
        }
    }

    async checkPatientProfile() {
        const patientId = localStorage.getItem('patientId');
        if (!patientId) {
            // Show add member prompt in dashboard
            this.showAddMemberPrompt();
        }
    }

    showAddMemberPrompt() {
        const dashboardView = document.getElementById('dashboardView');
        if (dashboardView) {
            const promptHtml = `
                <div class="member-prompt">
                    <div class="prompt-card">
                        <h3>Complete Your Profile</h3>
                        <p>Please add your member details to access appointments and medical records.</p>
                        <button class="btn btn-primary" onclick="app.showAddMemberForm()">
                            <i class="fas fa-user-plus"></i> Add Member Details
                        </button>
                    </div>
                </div>
            `;
            dashboardView.innerHTML = promptHtml + dashboardView.innerHTML;
        }
    }

    async fetchPatientId(email) {
        try {
            console.log('Fetching patient ID for email:', email);
            
            // Get all patients and find the one with matching email
            const patients = await apiService.getAllPatients();
            console.log('All patients:', patients);
            
            const patient = patients.find(p => p.email?.toLowerCase() === email.toLowerCase());
            console.log('Found patient:', patient);
            
            if (patient && patient.id) {
                localStorage.setItem('patientId', patient.id.toString());
                this.currentUser.patientId = patient.id;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                console.log('Patient ID stored in localStorage:', patient.id);
                return patient.id;
            } else {
                console.log('No patient record found for email:', email);
                return null;
            }
        } catch (error) {
            console.error('Error fetching patient ID:', error);
            return null;
        }
    }

    async fetchDoctorId(email) {
        try {
            console.log('Fetching doctor ID for email:', email);
            
            // Get all doctors and find the one with matching email
            const doctors = await apiService.getAllDoctors();
            console.log('All doctors:', doctors);
            
            const doctor = doctors.find(d => d.email?.toLowerCase() === email.toLowerCase());
            console.log('Found doctor:', doctor);
            
            if (doctor && doctor.id) {
                localStorage.setItem('doctorId', doctor.id.toString());
                this.currentUser.doctorId = doctor.id;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                console.log('Doctor ID stored in localStorage:', doctor.id);
                return doctor.id;
            } else {
                console.log('No doctor record found for email:', email);
                return null;
            }
        } catch (error) {
            console.error('Error fetching doctor ID:', error);
            return null;
        }
    }

    // ==================== DATA LOADING ====================
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
                totalRevenue: appointments.length * 150
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

    // ==================== MEMBER MANAGEMENT FOR PATIENTS ====================
    async showAddMemberForm() {
        const modalHtml = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Add Member Details</h2>
                    <button class="modal-close" onclick="app.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addMemberForm">
                        <div class="form-group">
                            <label for="memberFullName">Full Name</label>
                            <input type="text" id="memberFullName" name="fullName" required>
                        </div>
                        <div class="form-group">
                            <label for="memberEmail">Email</label>
                            <input type="email" id="memberEmail" name="email" value="${this.currentUser?.email || ''}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="memberContact">Contact Number</label>
                            <input type="tel" id="memberContact" name="contactNumber" required>
                        </div>
                        <div class="form-group">
                            <label for="memberDOB">Date of Birth</label>
                            <input type="date" id="memberDOB" name="dateOfBirth" required>
                        </div>
                        <div class="form-group">
                            <label for="memberGender">Gender</label>
                            <select id="memberGender" name="gender" required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="app.saveMemberDetails()">Save Member</button>
                </div>
            </div>
        `;
        this.showModal(modalHtml);
    }

    async saveMemberDetails() {
        try {
            const form = document.getElementById('addMemberForm');
            const formData = new FormData(form);
            
            const patientDto = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                contactNumber: formData.get('contactNumber'),
                dateOfBirth: formData.get('dateOfBirth'),
                gender: formData.get('gender')
            };

            const response = await apiService.createPatient(patientDto);
            
            // Store patient ID in localStorage
            if (response && response.id) {
                localStorage.setItem('patientId', response.id.toString());
                this.currentUser.patientId = response.id;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }

            this.showNotification('Member details saved successfully!', 'success');
            this.closeModal();
            
            // Refresh dashboard to remove the prompt
            this.showDashboard();
            
        } catch (error) {
            console.error('Error saving member details:', error);
            this.showNotification('Error saving member details', 'error');
        }
    }

    // ==================== PATIENTS MANAGEMENT ====================
    async showPatients() {
        this.showView('patients');
        await this.loadPatientsData();
    }

    async loadPatientsData(page = 1) {
        try {
            this.showLoading(true);
            const paginationParams = { pageNumber: page, pageSize: this.pageSize };
            const response = await apiService.getAllPatientsPaged(paginationParams);
            
            this.renderPatientsTable(response.items || []);
            this.renderPagination('patients', response, page);
        } catch (error) {
            console.error('Error loading patients:', error);
            this.showNotification('Error loading patients data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderPatientsTable(patients) {
        const tbody = document.getElementById('patientsTableBody');
        if (!tbody) return;

        tbody.innerHTML = patients.map(patient => `
            <tr>
                <td>${patient.id}</td>
                <td>${patient.fullName || 'N/A'}</td>
                <td>${patient.email || 'N/A'}</td>
                <td>${patient.contactNumber || 'N/A'}</td>
                <td>${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.viewPatient(${patient.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deletePatient(${patient.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async showAddPatient() {
        const modalHtml = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Add New Patient</h2>
                    <button class="modal-close" onclick="app.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addPatientForm">
                        <div class="form-group">
                            <label for="patientFullName">Full Name</label>
                            <input type="text" id="patientFullName" name="fullName" required>
                        </div>
                        <div class="form-group">
                            <label for="patientEmail">Email</label>
                            <input type="email" id="patientEmail" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="patientPassword">Password</label>
                            <input type="password" id="patientPassword" name="password" required>
                        </div>
                        <div class="form-group">
                            <label for="patientContact">Contact Number</label>
                            <input type="tel" id="patientContact" name="contactNumber">
                        </div>
                        <div class="form-group">
                            <label for="patientDOB">Date of Birth</label>
                            <input type="date" id="patientDOB" name="dateOfBirth">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="app.savePatient()">Save Patient</button>
                </div>
            </div>
        `;
        this.showModal(modalHtml);
    }

    async savePatient() {
        try {
            const form = document.getElementById('addPatientForm');
            const formData = new FormData(form);
            
            const patientDto = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                password: formData.get('password'),
                contactNumber: formData.get('contactNumber'),
                dateOfBirth: formData.get('dateOfBirth') ? new Date(formData.get('dateOfBirth')) : null
            };

            await apiService.createPatient(patientDto);
            this.showNotification('Patient added successfully!', 'success');
            this.closeModal();
            await this.loadPatientsData();
        } catch (error) {
            console.error('Error saving patient:', error);
            this.showNotification('Error saving patient', 'error');
        }
    }

    async viewPatient(id) {
        try {
            const patient = await apiService.getPatient(id);
            const modalHtml = `
                <div class="modal">
                    <div class="modal-header">
                        <h2>Patient Details</h2>
                        <button class="modal-close" onclick="app.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="patient-details">
                            <p><strong>ID:</strong> ${patient.id}</p>
                            <p><strong>Full Name:</strong> ${patient.fullName || 'N/A'}</p>
                            <p><strong>Email:</strong> ${patient.email || 'N/A'}</p>
                            <p><strong>Contact:</strong> ${patient.contactNumber || 'N/A'}</p>
                            <p><strong>Date of Birth:</strong> ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Created:</strong> ${patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
                        <button class="btn btn-primary" onclick="app.editPatient(${patient.id})">Edit</button>
                    </div>
                </div>
            `;
            this.showModal(modalHtml);
        } catch (error) {
            console.error('Error viewing patient:', error);
            this.showNotification('Error loading patient details', 'error');
        }
    }

    async editPatient(id) {
        try {
            const patient = await apiService.getPatient(id);
            const modalHtml = `
                <div class="modal">
                    <div class="modal-header">
                        <h2>Edit Patient</h2>
                        <button class="modal-close" onclick="app.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="editPatientForm">
                            <input type="hidden" id="editPatientId" value="${patient.id}">
                            <div class="form-group">
                                <label for="editPatientFullName">Full Name</label>
                                <input type="text" id="editPatientFullName" name="fullName" value="${patient.fullName || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editPatientEmail">Email</label>
                                <input type="email" id="editPatientEmail" name="email" value="${patient.email || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editPatientContact">Contact Number</label>
                                <input type="tel" id="editPatientContact" name="contactNumber" value="${patient.contactNumber || ''}">
                            </div>
                            <div class="form-group">
                                <label for="editPatientDOB">Date of Birth</label>
                                <input type="date" id="editPatientDOB" name="dateOfBirth" value="${patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : ''}">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="app.updatePatient()">Update Patient</button>
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
            const formData = new FormData(form);
            const id = document.getElementById('editPatientId').value;
            
            const patientDto = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                contactNumber: formData.get('contactNumber'),
                dateOfBirth: formData.get('dateOfBirth') ? new Date(formData.get('dateOfBirth')) : null
            };

            await apiService.updatePatient(id, patientDto);
            this.showNotification('Patient updated successfully!', 'success');
            this.closeModal();
            await this.loadPatientsData();
        } catch (error) {
            console.error('Error updating patient:', error);
            this.showNotification('Error updating patient', 'error');
        }
    }

    async deletePatient(id) {
        if (!confirm('Are you sure you want to delete this patient?')) return;

        try {
            await apiService.deletePatient(id);
            this.showNotification('Patient deleted successfully!', 'success');
            await this.loadPatientsData();
        } catch (error) {
            console.error('Error deleting patient:', error);
            this.showNotification('Error deleting patient', 'error');
        }
    }

    // ==================== UTILITY METHODS ====================
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

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
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

    renderPagination(entityType, response, currentPage) {
        const paginationContainer = document.getElementById(`${entityType}Pagination`);
        if (!paginationContainer || !response) return;

        const totalPages = Math.ceil(response.totalCount / response.pageSize);
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHtml = `
            <button ${currentPage <= 1 ? 'disabled' : ''} onclick="app.load${entityType.charAt(0).toUpperCase() + entityType.slice(1)}Data(${currentPage - 1})">
                Previous
            </button>
        `;

        for (let i = 1; i <= Math.min(totalPages, 10); i++) {
            paginationHtml += `
                <button class="${i === currentPage ? 'active' : ''}" onclick="app.load${entityType.charAt(0).toUpperCase() + entityType.slice(1)}Data(${i})">
                    ${i}
                </button>
            `;
        }

        paginationHtml += `
            <button ${currentPage >= totalPages ? 'disabled' : ''} onclick="app.load${entityType.charAt(0).toUpperCase() + entityType.slice(1)}Data(${currentPage + 1})">
                Next
            </button>
        `;

        paginationContainer.innerHTML = paginationHtml;
    }

    // ==================== DOCTOR DASHBOARD METHODS ====================
    showDoctorView(viewName) {
        document.querySelectorAll('#doctorDashboardPage .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelectorAll('#doctorDashboardPage .content-view').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }

        const navItem = document.querySelector(`[onclick="show${viewName.charAt(0).toUpperCase() + viewName.slice(1)}()"]`)?.parentElement;
        if (navItem) {
            navItem.classList.add('active');
        }

        this.currentView = viewName;
    }

    async loadDoctorDashboardData() {
        try {
            this.showLoading(true);
            const doctorId = localStorage.getItem('doctorId');
            
            if (!doctorId) {
                this.showNotification('Doctor profile not found', 'error');
                return;
            }

            // Load doctor-specific data
            const [appointments, patients, medicalRecords] = await Promise.all([
                apiService.getDoctorAppointments(doctorId).catch(() => []),
                apiService.getDoctorPatients(doctorId).catch(() => []),
                apiService.getDoctorMedicalRecords(doctorId).catch(() => [])
            ]);

            // Filter today's appointments
            const today = new Date().toDateString();
            const todayAppointments = appointments.filter(apt => 
                new Date(apt.appointmentDate).toDateString() === today
            );

            this.updateDoctorDashboardStats({
                todayAppointments: todayAppointments.length,
                totalPatients: patients.length,
                totalRecords: medicalRecords.length
            });

            this.loadDoctorTodaySchedule(todayAppointments);

        } catch (error) {
            console.error('Error loading doctor dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    updateDoctorDashboardStats(stats) {
        const elements = {
            doctorTotalAppointments: document.getElementById('doctorTotalAppointments'),
            doctorTotalPatients: document.getElementById('doctorTotalPatients'),
            doctorTotalRecords: document.getElementById('doctorTotalRecords')
        };

        if (elements.doctorTotalAppointments) {
            elements.doctorTotalAppointments.textContent = stats.todayAppointments;
        }
        if (elements.doctorTotalPatients) {
            elements.doctorTotalPatients.textContent = stats.totalPatients;
        }
        if (elements.doctorTotalRecords) {
            elements.doctorTotalRecords.textContent = stats.totalRecords;
        }
    }

    loadDoctorTodaySchedule(appointments) {
        const scheduleContainer = document.getElementById('doctorTodaySchedule');
        if (!scheduleContainer) return;

        if (appointments.length === 0) {
            scheduleContainer.innerHTML = '<p class="no-data">No appointments scheduled for today</p>';
            return;
        }

        scheduleContainer.innerHTML = appointments.map(appointment => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="activity-content">
                    <p><strong>${appointment.patientName || 'Patient'}</strong></p>
                    <div class="activity-time">${new Date(appointment.appointmentDate).toLocaleTimeString()}</div>
                </div>
            </div>
        `).join('');
    }

    async loadPatientDashboardData() {
        // Existing patient dashboard loading logic
        try {
            this.showLoading(true);
            // Patient-specific data loading
        } catch (error) {
            console.error('Error loading patient dashboard data:', error);
        } finally {
            this.showLoading(false);
        }
    }

    showPatientView(viewName) {
        document.querySelectorAll('#patientDashboardPage .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelectorAll('#patientDashboardPage .content-view').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
        }

        const navItem = document.querySelector(`[onclick="show${viewName.charAt(0).toUpperCase() + viewName.slice(1)}()"]`)?.parentElement;
        if (navItem) {
            navItem.classList.add('active');
        }

        this.currentView = viewName;
    }

    async showDoctorAddMedicalRecord() {
        const doctorId = localStorage.getItem('doctorId');
        if (!doctorId) {
            this.showNotification('Doctor profile not found', 'error');
            return;
        }

        try {
            const patients = await apiService.getAllPatients();
            
            const modalHtml = `
                <div class="modal">
                    <div class="modal-header">
                        <h2><i class="fas fa-file-medical"></i> Add Medical Record</h2>
                        <button class="modal-close" onclick="app.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="addDoctorMedicalRecordForm">
                            <input type="hidden" name="doctorId" value="${doctorId}">
                            <div class="form-group">
                                <label for="recordPatientId">Patient</label>
                                <div class="input-group">
                                    <i class="fas fa-user"></i>
                                    <select id="recordPatientId" name="patientId" required>
                                        <option value="">Select Patient</option>
                                        ${patients.map(patient => 
                                            `<option value="${patient.id}">${patient.fullName} - ${patient.email}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="recordDiagnosis">Diagnosis</label>
                                <div class="input-group">
                                    <i class="fas fa-stethoscope"></i>
                                    <textarea id="recordDiagnosis" name="diagnosis" required placeholder="Enter diagnosis"></textarea>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="recordTreatment">Treatment</label>
                                <div class="input-group">
                                    <i class="fas fa-pills"></i>
                                    <textarea id="recordTreatment" name="treatment" placeholder="Enter treatment plan"></textarea>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="recordNotes">Notes</label>
                                <div class="input-group">
                                    <i class="fas fa-notes-medical"></i>
                                    <textarea id="recordNotes" name="notes" placeholder="Additional notes"></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="app.saveDoctorMedicalRecord()">Save Record</button>
                    </div>
                </div>
            `;
            this.showModal(modalHtml);
        } catch (error) {
            console.error('Error loading patients for medical record:', error);
            this.showNotification('Error loading patients', 'error');
        }
    }

    async saveDoctorMedicalRecord() {
        try {
            const form = document.getElementById('addDoctorMedicalRecordForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const medicalRecordDto = {
                patientId: parseInt(formData.get('patientId')),
                doctorId: parseInt(formData.get('doctorId')),
                diagnosis: formData.get('diagnosis'),
                treatment: formData.get('treatment'),
                notes: formData.get('notes'),
                recordDate: new Date().toISOString()
            };

            await apiService.createMedicalRecord(medicalRecordDto);
            this.showNotification('Medical record added successfully!', 'success');
            this.closeModal();
            
            if (this.currentView === 'doctorMedicalRecords') {
                await this.loadDoctorMedicalRecordsData();
            }
            await this.loadDoctorDashboardData();
        } catch (error) {
            console.error('Error saving medical record:', error);
            this.showNotification('Error saving medical record', 'error');
        }
    }

    // ==================== DOCTORS MANAGEMENT ====================
    async showDoctors() {
        this.showView('doctors');
        await this.loadDoctorsData();
    }

    async loadDoctorsData(page = 1) {
        try {
            this.showLoading(true);
            const paginationParams = { pageNumber: page, pageSize: this.pageSize };
            const response = await apiService.getAllDoctorsPaged(paginationParams);
            
            this.renderDoctorsTable(response.items || []);
            this.renderPagination('doctors', response, page);
        } catch (error) {
            console.error('Error loading doctors:', error);
            this.showNotification('Error loading doctors data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderDoctorsTable(doctors) {
        const tbody = document.getElementById('doctorsTableBody');
        if (!tbody) return;

        tbody.innerHTML = doctors.map(doctor => `
            <tr>
                <td>${doctor.id}</td>
                <td>${doctor.fullName || 'N/A'}</td>
                <td>${doctor.email || 'N/A'}</td>
                <td>${doctor.contactNumber || 'N/A'}</td>
                <td>${doctor.specialty || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.viewDoctor(${doctor.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteDoctor(${doctor.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async showAddDoctor() {
        const modalHtml = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Add New Doctor</h2>
                    <button class="modal-close" onclick="app.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addDoctorForm">
                        <div class="form-group">
                            <label for="doctorFullName">Full Name</label>
                            <input type="text" id="doctorFullName" name="fullName" required>
                        </div>
                        <div class="form-group">
                            <label for="doctorEmail">Email</label>
                            <input type="email" id="doctorEmail" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="doctorPassword">Password</label>
                            <input type="password" id="doctorPassword" name="password" required>
                        </div>
                        <div class="form-group">
                            <label for="doctorContact">Contact Number</label>
                            <input type="tel" id="doctorContact" name="contactNumber">
                        </div>
                        <div class="form-group">
                            <label for="doctorSpecialty">Specialty</label>
                            <input type="text" id="doctorSpecialty" name="specialty" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="app.saveDoctor()">Save Doctor</button>
                </div>
            </div>
        `;
        this.showModal(modalHtml);
    }

    async saveDoctor() {
        try {
            const form = document.getElementById('addDoctorForm');
            const formData = new FormData(form);
            
            const doctorDto = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                password: formData.get('password'),
                contactNumber: formData.get('contactNumber'),
                specialty: formData.get('specialty')
            };

            await apiService.createDoctor(doctorDto);
            this.showNotification('Doctor added successfully!', 'success');
            this.closeModal();
            await this.loadDoctorsData();
        } catch (error) {
            console.error('Error saving doctor:', error);
            this.showNotification('Error saving doctor', 'error');
        }
    }

    async viewDoctor(id) {
        try {
            const doctor = await apiService.getDoctorById(id);
            const modalHtml = `
                <div class="modal">
                    <div class="modal-header">
                        <h2>Doctor Details</h2>
                        <button class="modal-close" onclick="app.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="doctor-details">
                            <p><strong>ID:</strong> ${doctor.id}</p>
                            <p><strong>Full Name:</strong> ${doctor.fullName || 'N/A'}</p>
                            <p><strong>Email:</strong> ${doctor.email || 'N/A'}</p>
                            <p><strong>Contact:</strong> ${doctor.contactNumber || 'N/A'}</p>
                            <p><strong>Specialty:</strong> ${doctor.specialty || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
                        <button class="btn btn-primary" onclick="app.editDoctor(${doctor.id})">Edit</button>
                    </div>
                </div>
            `;
            this.showModal(modalHtml);
        } catch (error) {
            console.error('Error viewing doctor:', error);
            this.showNotification('Error loading doctor details', 'error');
        }
    }

    async editDoctor(id) {
        try {
            const doctor = await apiService.getDoctorById(id);
            const modalHtml = `
                <div class="modal">
                    <div class="modal-header">
                        <h2>Edit Doctor</h2>
                        <button class="modal-close" onclick="app.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="editDoctorForm">
                            <input type="hidden" id="editDoctorId" value="${doctor.id}">
                            <div class="form-group">
                                <label for="editDoctorFullName">Full Name</label>
                                <input type="text" id="editDoctorFullName" name="fullName" value="${doctor.fullName || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editDoctorEmail">Email</label>
                                <input type="email" id="editDoctorEmail" name="email" value="${doctor.email || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editDoctorContact">Contact Number</label>
                                <input type="tel" id="editDoctorContact" name="contactNumber" value="${doctor.contactNumber || ''}">
                            </div>
                            <div class="form-group">
                                <label for="editDoctorSpecialty">Specialty</label>
                                <input type="text" id="editDoctorSpecialty" name="specialty" value="${doctor.specialty || ''}" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="app.updateDoctor()">Update Doctor</button>
                    </div>
                </div>
            `;
            this.showModal(modalHtml);
        } catch (error) {
            console.error('Error loading doctor for edit:', error);
            this.showNotification('Error loading doctor details', 'error');
        }
    }

    async updateDoctor() {
        try {
            const form = document.getElementById('editDoctorForm');
            const formData = new FormData(form);
            const id = document.getElementById('editDoctorId').value;
            
            const doctorDto = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                contactNumber: formData.get('contactNumber'),
                specialty: formData.get('specialty')
            };

            await apiService.updateDoctor(id, doctorDto);
            this.showNotification('Doctor updated successfully!', 'success');
            this.closeModal();
            await this.loadDoctorsData();
        } catch (error) {
            console.error('Error updating doctor:', error);
            this.showNotification('Error updating doctor', 'error');
        }
    }

    async deleteDoctor(id) {
        if (!confirm('Are you sure you want to delete this doctor?')) return;

        try {
            await apiService.deleteDoctor(id);
            this.showNotification('Doctor deleted successfully!', 'success');
            await this.loadDoctorsData();
        } catch (error) {
            console.error('Error deleting doctor:', error);
            this.showNotification('Error deleting doctor', 'error');
        }
    }

    // ==================== APPOINTMENTS MANAGEMENT ====================
    async showAppointments() {
        this.showView('appointments');
        await this.loadAppointmentsData();
    }

    async loadAppointmentsData(page = 1) {
        try {
            this.showLoading(true);
            const paginationParams = { pageNumber: page, pageSize: this.pageSize };
            
            // For patients, use patient ID from localStorage to get only their appointments
            if (this.currentUser?.userType?.toLowerCase() === 'patient') {
                const patientId = localStorage.getItem('patientId');
                if (patientId) {
                    console.log('Loading appointments for patient ID:', patientId);
                    const response = await apiService.getPatientAppointments(patientId, paginationParams);
                    console.log('Raw backend response for patient appointments ><><>>>><>><><><><><><:', response);
                    
                    let appointments = [];
                    let paginatedResponse = {
                        items: [],
                        totalCount: 0,
                        pageNumber: 1,
                        pageSize: this.pageSize
                    };
                    
                    // Handle the response properly - backend returns {items: Array, totalCount, pageNumber, pageSize}
                    if (response && typeof response === 'object') {
                        if (response.items && Array.isArray(response.items)) {
                            console.log('Using paginated response format with items array');
                            appointments = response.items;
                            paginatedResponse = {
                                items: response.items,
                                totalCount: response.totalCount || response.items.length,
                                pageNumber: response.pageNumber || 1,
                                pageSize: response.pageSize || this.pageSize
                            };
                        } else if (Array.isArray(response)) {
                            console.log('Response is direct array');
                            appointments = response;
                            paginatedResponse.items = response;
                            paginatedResponse.totalCount = response.length;
                        } else {
                            console.log('Response object has no items array, checking if response itself is the data');
                            // Sometimes the response might be the appointments array directly
                            appointments = [];
                        }
                    } else if (Array.isArray(response)) {
                        console.log('Response is direct array');
                        appointments = response;
                        paginatedResponse.items = response;
                        paginatedResponse.totalCount = response.length;
                    } else {
                        console.log('Unknown response format, defaulting to empty array');
                        appointments = [];
                    }
                    
                    console.log('Final appointments array:', appointments);
                    console.log('Appointments length:', appointments?.length);
                    console.log('Is appointments an array?', Array.isArray(appointments));
                    
                    this.renderAppointmentsTable(appointments);
                    this.renderPagination('appointments', paginatedResponse, page);
                } else {
                    this.showNotification('Please complete your member profile first.', 'warning');
                    this.renderAppointmentsTable([]);
                }
            } else {
                // For admin/doctor, get all appointments
                const response = await apiService.getAllAppointmentsPaged(paginationParams);
                this.renderAppointmentsTable(response.items || []);
                this.renderPagination('appointments', response, page);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.showNotification('Error loading appointments data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderAppointmentsTable(appointments) {
        console.log('=== RENDER APPOINTMENTS TABLE DEBUG ===');
        console.log('Received appointments parameter:', appointments);
        console.log('Type of appointments:', typeof appointments);
        console.log('Is array?', Array.isArray(appointments));
        
        const tbody = document.getElementById('appointmentsTableBody');
        if (!tbody) {
            console.log('ERROR: appointmentsTableBody element not found');
            return;
        }

        if (!appointments || !Array.isArray(appointments)) {
            console.log('No valid appointments array, showing empty message');
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: var(--gray-500);">
                        <i class="fas fa-calendar" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        No appointments found
                    </td>
                </tr>
            `;
            return;
        }

        console.log('Rendering', appointments.length, 'appointments');
        console.log('First appointment:', appointments[0]);

        try {
            tbody.innerHTML = appointments.map(appointment => `
            <tr>
                <td>${appointment.id}</td>
                <td>${appointment.patientName || appointment.patientId || 'N/A'}</td>
                <td>${appointment.doctorName || appointment.doctorId || 'N/A'}</td>
                <td>${appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'N/A'}</td>
                <td>${appointment.appointmentTime || 'N/A'}</td>
                <td><span class="status-badge ${appointment.status?.toLowerCase() || 'pending'}">${appointment.status || 'Pending'}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.viewAppointment(${appointment.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="app.cancelAppointment(${appointment.id})">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </td>
            </tr>
        `).join('');
        } catch (error) {
            console.error('Error rendering appointments table:', error);
            console.error('Appointments data that caused error:', appointments);
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: var(--error-color);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        Error rendering appointments table
                    </td>
                </tr>
            `;
        }
    }

    async showAddAppointment() {
        try {
            this.showLoading(true);
            
            // Check if patient has completed their profile
            if (this.currentUser?.userType?.toLowerCase() === 'patient') {
                const patientId = localStorage.getItem('patientId');
                if (!patientId) {
                    this.showNotification('Please complete your member profile first.', 'warning');
                    this.showAddMemberForm();
                    return;
                }
            }

            const doctors = await apiService.getAllDoctors().catch(() => []);

            let patientSection = '';
            if (this.currentUser?.userType?.toLowerCase() === 'patient') {
                // For patients, use their own patient ID
                const patientId = localStorage.getItem('patientId');
                patientSection = `<input type="hidden" name="patientId" value="${patientId}">`;
            } else {
                // For admin/doctor, show patient selection
                const patients = await apiService.getAllPatients().catch(() => []);
                patientSection = `
                    <div class="form-group">
                        <label for="appointmentPatient">Patient</label>
                        <select id="appointmentPatient" name="patientId" required>
                            <option value="">Select Patient</option>
                            ${patients.map(p => `<option value="${p.id}">${p.fullName || p.email}</option>`).join('')}
                        </select>
                    </div>
                `;
            }

            const modalHtml = `
                <div class="modal">
                    <div class="modal-header">
                        <h2>Book New Appointment</h2>
                        <button class="modal-close" onclick="app.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="addAppointmentForm">
                            ${patientSection}
                            <div class="form-group">
                                <label for="appointmentDoctor">Doctor</label>
                                <select id="appointmentDoctor" name="doctorId" required>
                                    <option value="">Select Doctor</option>
                                    ${doctors.map(d => `<option value="${d.id}">${d.fullName || d.email} - ${d.specialty || 'General'}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="appointmentDate">Date</label>
                                <input type="date" id="appointmentDate" name="appointmentDate" required min="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label for="appointmentTime">Time</label>
                                <input type="time" id="appointmentTime" name="appointmentTime" required>
                            </div>
                            <div class="form-group">
                                <label for="appointmentReason">Symptoms</label>
                                <textarea id="appointmentReason" name="symptoms" rows="3" placeholder="Describe your symptoms"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                        <button class="btn btn-primary" onclick="app.saveAppointment()">Book Appointment</button>
                    </div>
                </div>
            `;
            this.showModal(modalHtml);
        } catch (error) {
            console.error('Error loading appointment form:', error);
            this.showNotification('Error loading appointment form', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async saveAppointment() {
        try {
            const form = document.getElementById('addAppointmentForm');
            const formData = new FormData(form);
            
            const appointmentDto = {
                patientId: parseInt(formData.get('patientId')),
                doctorId: parseInt(formData.get('doctorId')),
                appointmentDate: formData.get('appointmentDate'),
                appointmentTime: formData.get('appointmentTime'),
                symptoms: formData.get('symptoms') || 'General consultation'
            };

            await apiService.createAppointment(appointmentDto);
            this.showNotification('Appointment booked successfully!', 'success');
            this.closeModal();
            if (this.currentView === 'appointments') {
                await this.loadAppointmentsData();
            }
            await this.loadDashboardData();
        } catch (error) {
            console.error('Error saving appointment:', error);
            this.showNotification('Error booking appointment', 'error');
        }
    }

    async viewAppointment(id) {
        try {
            const appointment = await apiService.getAppointmentById(id);
            const modalHtml = `
                <div class="modal">
                    <div class="modal-header">
                        <h2>Appointment Details</h2>
                        <button class="modal-close" onclick="app.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="appointment-details">
                            <p><strong>ID:</strong> ${appointment.id}</p>
                            <p><strong>Patient:</strong> ${appointment.patientName || appointment.patientId}</p>
                            <p><strong>Doctor:</strong> ${appointment.doctorName || appointment.doctorId}</p>
                            <p><strong>Date:</strong> ${appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Time:</strong> ${appointment.appointmentTime || 'N/A'}</p>
                            <p><strong>Status:</strong> <span class="status-badge ${appointment.status?.toLowerCase() || 'pending'}">${appointment.status || 'Pending'}</span></p>
                            <p><strong>Reason:</strong> ${appointment.reason || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
                        <button class="btn btn-warning" onclick="app.cancelAppointment(${appointment.id})">Cancel Appointment</button>
                    </div>
                </div>
            `;
            this.showModal(modalHtml);
        } catch (error) {
            console.error('Error viewing appointment:', error);
            this.showNotification('Error loading appointment details', 'error');
        }
    }

    async cancelAppointment(id) {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await apiService.cancelAppointment(id);
            this.showNotification('Appointment cancelled successfully!', 'success');
            this.closeModal();
            if (this.currentView === 'appointments') {
                await this.loadAppointmentsData();
            }
            await this.loadDashboardData();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            this.showNotification('Error cancelling appointment', 'error');
        }
    }

    // ==================== OTHER MODULES ====================
    async showMedicalRecords() {
        this.showView('medicalRecords');
        await this.loadMedicalRecordsData();
    }

    async loadMedicalRecordsData(page = 1) {
        try {
            this.showLoading(true);
            const paginationParams = { pageNumber: page, pageSize: this.pageSize };
            const response = await apiService.getAllMedicalRecordsPaged(paginationParams);
            
            this.renderMedicalRecordsTable(response.items || []);
            this.renderPagination('medicalRecords', response, page);
        } catch (error) {
            console.error('Error loading medical records:', error);
            this.showNotification('Error loading medical records data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderMedicalRecordsTable(records) {
        const tbody = document.getElementById('medicalRecordsTableBody');
        if (!tbody) return;

        tbody.innerHTML = records.map(record => `
            <tr>
                <td>${record.id}</td>
                <td>${record.patientName || record.patientId || 'N/A'}</td>
                <td>${record.doctorName || record.doctorId || 'N/A'}</td>
                <td>${record.diagnosis || 'N/A'}</td>
                <td>${record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.viewMedicalRecord(${record.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteMedicalRecord(${record.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async showPrescriptions() {
        this.showView('prescriptions');
        await this.loadPrescriptionsData();
    }

    async loadPrescriptionsData(page = 1) {
        try {
            this.showLoading(true);
            const paginationParams = { pageNumber: page, pageSize: this.pageSize };
            const response = await apiService.getAllPrescriptionsPaged(paginationParams);
            
            this.renderPrescriptionsTable(response.items || []);
            this.renderPagination('prescriptions', response, page);
        } catch (error) {
            console.error('Error loading prescriptions:', error);
            this.showNotification('Error loading prescriptions data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderPrescriptionsTable(prescriptions) {
        const tbody = document.getElementById('prescriptionsTableBody');
        if (!tbody) return;

        tbody.innerHTML = prescriptions.map(prescription => `
            <tr>
                <td>${prescription.id}</td>
                <td>${prescription.patientId || 'N/A'}</td>
                <td>${prescription.doctorId || 'N/A'}</td>
                <td>${prescription.medication || 'N/A'}</td>
                <td>${prescription.dosage || 'N/A'}</td>
                <td>${prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.viewPrescription(${prescription.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deletePrescription(${prescription.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async showTests() {
        this.showView('tests');
        await this.loadTestsData();
    }

    async loadTestsData(page = 1) {
        try {
            this.showLoading(true);
            const paginationParams = { pageNumber: page, pageSize: this.pageSize };
            const response = await apiService.getAllTestMastersPaged(paginationParams);
            
            this.renderTestsTable(response.items || []);
            this.renderPagination('tests', response, page);
        } catch (error) {
            console.error('Error loading tests:', error);
            this.showNotification('Error loading tests data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderTestsTable(tests) {
        const tbody = document.getElementById('testsTableBody');
        if (!tbody) return;

        tbody.innerHTML = tests.map(test => `
            <tr>
                <td>${test.id}</td>
                <td>${test.testName || 'N/A'}</td>
                <td>${test.description || 'N/A'}</td>
                <td>$${test.price || '0'}</td>
                <td>${test.timing || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.viewTest(${test.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteTest(${test.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async showDosage() {
        this.showView('dosage');
        await this.loadDosageData();
    }

    async loadDosageData(page = 1) {
        try {
            this.showLoading(true);
            const paginationParams = { pageNumber: page, pageSize: this.pageSize };
            const response = await apiService.getAllDosageMastersPaged(paginationParams);
            
            this.renderDosageTable(response.items || []);
            this.renderPagination('dosage', response, page);
        } catch (error) {
            console.error('Error loading dosage data:', error);
            this.showNotification('Error loading dosage data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderDosageTable(dosages) {
        const tbody = document.getElementById('dosageTableBody');
        if (!tbody) return;

        tbody.innerHTML = dosages.map(dosage => `
            <tr>
                <td>${dosage.id}</td>
                <td>${dosage.dosageName || 'N/A'}</td>
                <td>${dosage.description || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.viewDosage(${dosage.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteDosage(${dosage.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async showAdmins() {
        this.showView('admins');
        await this.loadAdminsData();
    }

    async loadAdminsData(page = 1) {
        try {
            this.showLoading(true);
            const paginationParams = { pageNumber: page, pageSize: this.pageSize };
            const response = await apiService.getAllAdminsPaged(paginationParams);
            
            this.renderAdminsTable(response.items || []);
            this.renderPagination('admins', response, page);
        } catch (error) {
            console.error('Error loading admins:', error);
            this.showNotification('Error loading admins data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderAdminsTable(admins) {
        const tbody = document.getElementById('adminsTableBody');
        if (!tbody) return;

        tbody.innerHTML = admins.map(admin => `
            <tr>
                <td>${admin.id}</td>
                <td>${admin.adminName || admin.fullName || 'N/A'}</td>
                <td>${admin.email || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.viewAdmin(${admin.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteAdmin(${admin.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Placeholder methods for missing functionality
    async showAddMedicalRecord() { this.showNotification('Medical Records management coming soon', 'info'); }
    async showAddPrescription() { this.showNotification('Prescription management coming soon', 'info'); }
    async showAddTest() { this.showNotification('Test management coming soon', 'info'); }
    async showAddDosage() { this.showNotification('Dosage management coming soon', 'info'); }
    async showAddAdmin() { this.showNotification('Admin management coming soon', 'info'); }
    
    async viewMedicalRecord(id) { this.showNotification('View medical record coming soon', 'info'); }
    async viewPrescription(id) { this.showNotification('View prescription coming soon', 'info'); }
    async viewTest(id) { this.showNotification('View test coming soon', 'info'); }
    async viewDosage(id) { this.showNotification('View dosage coming soon', 'info'); }
    async viewAdmin(id) { this.showNotification('View admin coming soon', 'info'); }
    
    async deleteMedicalRecord(id) { this.showNotification('Delete medical record coming soon', 'info'); }
    async deletePrescription(id) { this.showNotification('Delete prescription coming soon', 'info'); }
    async deleteTest(id) { this.showNotification('Delete test coming soon', 'info'); }
    async deleteDosage(id) { this.showNotification('Delete dosage coming soon', 'info'); }
    async deleteAdmin(id) { this.showNotification('Delete admin coming soon', 'info'); }

    showProfile() { this.showNotification('Profile management coming soon', 'info'); }
    showSettings() { this.showNotification('Settings coming soon', 'info'); }
    
    toggleUserMenu() {
        const menu = document.getElementById('userMenu');
        if (menu) {
            menu.classList.toggle('show');
        }
    }
}

// Global functions for HTML onclick handlers
function showLogin() { app.showLogin(); }
function showRegister() { app.showRegister(); }
function showDashboard() { app.showDashboard(); }
function showPatients() { app.showPatients(); }
function showDoctors() { app.showDoctors(); }
function showAppointments() { app.showAppointments(); }
function showMedicalRecords() { app.showMedicalRecords(); }
function showPrescriptions() { app.showPrescriptions(); }
function showTests() { app.showTests(); }
function showDosage() { app.showDosage(); }
function showAdmins() { app.showAdmins(); }
function logout() { app.logout(); }
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = passwordInput.nextElementSibling;
    const icon = toggleBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}
function toggleRegisterPassword() {
    const passwordInput = document.getElementById('regPassword');
    const toggleBtn = passwordInput.nextElementSibling;
    const icon = toggleBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}
function toggleUserMenu() { app.toggleUserMenu(); }
function showProfile() { app.showProfile(); }
function showSettings() { app.showSettings(); }
function showAddPatient() { app.showAddPatient(); }
function showAddDoctor() { app.showAddDoctor(); }
function showAddAppointment() { app.showAddAppointment(); }
function showAddPrescription() { app.showAddPrescription(); }

// ==================== GLOBAL FUNCTIONS ====================
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = passwordInput.nextElementSibling;
    const icon = toggleBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function toggleRegisterPassword() {
    const passwordInput = document.getElementById('regPassword');
    const toggleBtn = passwordInput.nextElementSibling;
    const icon = toggleBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) menu.classList.toggle('show');
}

function showLogin() { if(app) app.showLogin(); }
function showRegister() { if(app) app.showRegister(); }
function showDashboard() { if(app) app.showDashboard(); }
function showPatients() { if(app) app.showPatients(); }
function showDoctors() { if(app) app.showDoctors(); }
function showAppointments() { if(app) app.showAppointments(); }
function showMedicalRecords() { if(app) app.showMedicalRecords(); }
function showPrescriptions() { if(app) app.showPrescriptions(); }
function showTests() { if(app) app.showTests(); }
function showDosage() { if(app) app.showDosage(); }
function showAdmins() { if(app) app.showAdmins(); }
function showProfile() { if(app) app.showProfile(); }
function showSettings() { if(app) app.showSettings(); }
function logout() { if(app) app.logout(); }

// Doctor Dashboard Functions
function showDoctorDashboard() { if(app) app.showDoctorView('doctorDashboard'); }
function showDoctorAppointments() { if(app) app.showDoctorView('doctorAppointments'); }
function showDoctorMedicalRecords() { if(app) app.showDoctorView('doctorMedicalRecords'); }
function showDoctorSchedule() { if(app) app.showDoctorView('doctorSchedule'); }
function showDoctorProfile() { if(app) app.showDoctorView('doctorProfile'); }
function showDoctorAddMedicalRecord() { if(app) app.showDoctorAddMedicalRecord(); }
function showDoctorViewAppointments() { if(app) app.showDoctorView('doctorAppointments'); }
function showDoctorUpdateProfile() { if(app) app.showDoctorView('doctorProfile'); }

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PAmazeCareApp();
});
