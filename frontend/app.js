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
            
            if (response && (response.Token || response.token)) {
                const token = response.Token || response.token;
                const userType = response.UserType || response.userType || 'Patient';
                
                localStorage.setItem('authToken', token);
                const user = {
                    email: loginDto.email,
                    userType: userType,
                    token: token
                };
                
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
                FullName: formData.get('fullName'),
                Email: formData.get('email'),
                Password: formData.get('password'),
                UserType: formData.get('userType') || "Patient"
            };

            // Client-side validation
            if (!registerDto.FullName || registerDto.FullName.trim().length === 0) {
                this.showNotification('Full name is required.', 'error');
                return;
            }
            if (!registerDto.Email || registerDto.Email.trim().length === 0) {
                this.showNotification('Email is required.', 'error');
                return;
            }
            if (!registerDto.Password || registerDto.Password.length < 6) {
                this.showNotification('Password must be at least 6 characters long.', 'error');
                return;
            }

            console.log('Registration data:', registerDto);
            const response = await apiService.register(registerDto);
            console.log('Registration response:', response);
            
            this.showNotification('Registration successful! Please login.', 'success');
            this.showLogin();
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed. Please try again.';
            
            // Parse error response for specific validation messages
            try {
                const errorData = JSON.parse(error.message);
                if (errorData.Message) {
                    errorMessage = errorData.Message;
                } else if (errorData.Errors && Array.isArray(errorData.Errors)) {
                    errorMessage = errorData.Errors.join(', ');
                }
            } catch (parseError) {
                if (error.message.includes('Password must be between 6 and 100 characters')) {
                    errorMessage = 'Password must be at least 6 characters long.';
                } else if (error.message.includes('Email may already exist')) {
                    errorMessage = 'Email already exists. Please use a different email.';
                } else if (error.message.includes('400')) {
                    errorMessage = 'Invalid registration data. Please check all fields and ensure password is at least 6 characters.';
                }
            }
            
            this.showNotification(errorMessage, 'error');
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
        document.getElementById('dashboardPage').classList.add('active');
        this.showView('dashboard');
        this.loadDashboardData();
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

        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = `Welcome, ${this.currentUser.email}`;
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
            const response = await apiService.getAllAppointmentsPaged(paginationParams);
            
            this.renderAppointmentsTable(response.items || []);
            this.renderPagination('appointments', response, page);
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.showNotification('Error loading appointments data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderAppointmentsTable(appointments) {
        const tbody = document.getElementById('appointmentsTableBody');
        if (!tbody) return;

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
    }

    async showAddAppointment() {
        try {
            this.showLoading(true);
            const [patients, doctors] = await Promise.all([
                apiService.getAllPatients().catch(() => []),
                apiService.getAllDoctors().catch(() => [])
            ]);

            const modalHtml = `
                <div class="modal">
                    <div class="modal-header">
                        <h2>Book New Appointment</h2>
                        <button class="modal-close" onclick="app.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="addAppointmentForm">
                            <div class="form-group">
                                <label for="appointmentPatient">Patient</label>
                                <select id="appointmentPatient" name="patientId" required>
                                    <option value="">Select Patient</option>
                                    ${patients.map(p => `<option value="${p.id}">${p.fullName || p.email}</option>`).join('')}
                                </select>
                            </div>
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
                                <label for="appointmentReason">Reason</label>
                                <textarea id="appointmentReason" name="reason" rows="3" placeholder="Reason for appointment"></textarea>
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
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading appointment form:', error);
            this.showNotification('Error loading appointment form', 'error');
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
                reason: formData.get('reason') || 'General consultation',
                status: 'Scheduled'
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
function showAddMedicalRecord() { app.showAddMedicalRecord(); }
function showAddTest() { app.showAddTest(); }
function showAddDosage() { app.showAddDosage(); }
function showAddAdmin() { app.showAddAdmin(); }

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PAmazeCareApp();
});

// Global function definitions
function logout() { app.logout(); }
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
function showProfile() { app.showProfile(); }
function showSettings() { app.showSettings(); }
function showAddPatient() { app.showAddPatient(); }
function showAddDoctor() { app.showAddDoctor(); }
function showAddAppointment() { app.showAddAppointment(); }
function showAddPrescription() { app.showAddPrescription(); }
function showAddMedicalRecord() { app.showAddMedicalRecord(); }
function showAddTest() { app.showAddTest(); }
function showAddDosage() { app.showAddDosage(); }
function showAddAdmin() { app.showAddAdmin(); }
function toggleUserMenu() { app.toggleUserMenu(); }
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

// End of PAmazeCareApp class

// Global function definitions
function logout() { if (app) app.logout(); }
function showLogin() { if (app) app.showLogin(); }
function showRegister() { if (app) app.showRegister(); }
function showDashboard() { if (app) app.showDashboard(); }
function showPatients() { if (app) app.showPatients(); }
function showDoctors() { if (app) app.showDoctors(); }
function showAppointments() { if (app) app.showAppointments(); }
function showMedicalRecords() { if (app) app.showMedicalRecords(); }
function showPrescriptions() { if (app) app.showPrescriptions(); }
function showTests() { if (app) app.showTests(); }
function showDosage() { if (app) app.showDosage(); }
function showAdmins() { if (app) app.showAdmins(); }
function showProfile() { if (app) app.showProfile(); }
function showSettings() { if (app) app.showSettings(); }
function showAddPatient() { if (app) app.showAddPatient(); }
function showAddDoctor() { if (app) app.showAddDoctor(); }
function showAddAppointment() { if (app) app.showAddAppointment(); }
function showAddPrescription() { if (app) app.showAddPrescription(); }
function showAddMedicalRecord() { if (app) app.showAddMedicalRecord(); }
function showAddTest() { if (app) app.showAddTest(); }
function showAddDosage() { if (app) app.showAddDosage(); }
function showAddAdmin() { if (app) app.showAddAdmin(); }
function toggleUserMenu() { if (app) app.toggleUserMenu(); }

// ==================== GLOBAL FUNCTIONS ====================
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

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('show');
}

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
function showProfile() { if (app) app.showProfile(); }
function showSettings() { if (app) app.showSettings(); }
