// API Service Layer for PAmazeCare Hospital Management System
// Handles all HTTP requests to backend with exact DTO matching

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.baseHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Get auth token from localStorage
    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    // Get headers with auth token
    getHeaders() {
        const token = this.getAuthToken();
        return token ? 
            { ...this.baseHeaders, 'Authorization': `Bearer ${token}` } : 
            this.baseHeaders;
    }

    // Generic HTTP request handler
    async makeRequest(url, options = {}) {
        try {
            // Handle both full URLs and relative paths
            const requestUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
            
            const response = await fetch(requestUrl, {
                headers: this.getHeaders(),
                ...options
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('API request error:', error);
            
            // Enhanced error handling for better frontend feedback
            if (error.response) {
                const errorText = await error.response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(JSON.stringify(errorData));
                } catch (parseError) {
                    throw new Error(errorText);
                }
            }
            throw error;
        }
    }

    // ==================== PATIENT-SPECIFIC ENDPOINTS ====================
    
    // Get appointments for a specific patient
    async getPatientAppointments(patientId) {
        return await this.makeRequest(`/api/Appointment/patient/${patientId}`);
    }

    // Get medical records for a specific patient
    async getPatientMedicalRecords(patientId) {
        return await this.makeRequest(`/api/MedicalRecord/patient/${patientId}`);
    }

    // Cancel appointment
    async cancelAppointment(appointmentId) {
        return this.makeRequest(`/api/Appointment/${appointmentId}/cancel`, {
            method: 'PUT'
        });
    }

    // Patient profile management
    async getPatientProfile(patientId) {
        return this.makeRequest(`/api/Patient/${patientId}`);
    }

    async updatePatientProfile(patientId, patientData) {
        return this.makeRequest(`/api/Patient/${patientId}`, {
            method: 'PATCH',
            body: JSON.stringify(patientData)
        });
    }


    // ==================== AUTHENTICATION ====================
    async login(credentials) {
        try {
            const loginDto = {
                Email: credentials.email,
                Password: credentials.password
            };
            
            console.log('Sending login request to:', API_ENDPOINTS.AUTH.LOGIN);
            console.log('Login payload:', loginDto);
            
            const response = await this.makeRequest(API_ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                body: JSON.stringify(loginDto)
            });
            
            console.log('Raw API response:', response);
            console.log('Response type:', typeof response);
            
            if (response && response.Token) {
                localStorage.setItem('authToken', response.Token);
                localStorage.setItem('userType', response.UserType);
                // Extract user info from token or set basic info
                const userInfo = {
                    email: credentials.email,
                    userType: response.UserType || 'Patient'
                };
                localStorage.setItem('currentUser', JSON.stringify(userInfo));
            }
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Register a new user (public - any user type)
    async register(userData) {
        // Ensure exact property names match backend RegisterDto
        const registerDto = {
            FullName: userData.FullName || userData.fullName || '',
            Email: userData.Email || userData.email || '',
            Password: userData.Password || userData.password || '',
            UserType: userData.UserType || userData.userType || "Patient"
        };
        
        // Validate required fields
        if (!registerDto.FullName || !registerDto.Email || !registerDto.Password) {
            throw new Error('All fields are required');
        }
        
        console.log('Sending registration request to:', API_ENDPOINTS.AUTH.REGISTER);
        console.log('Registration payload:', registerDto);
        
        return await this.makeRequest(API_ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: JSON.stringify(registerDto)
        });
    }

    // ==================== ADMIN METHODS ====================
    async getAllAdmins() {
        return await this.makeRequest(API_ENDPOINTS.ADMIN.GET_ALL);
    }

    async getAllAdminsPaged(paginationParams = DEFAULT_PAGINATION) {
        const params = new URLSearchParams(paginationParams);
        return await this.makeRequest(`${API_ENDPOINTS.ADMIN.GET_ALL_PAGED}?${params}`);
    }

    async getAdminById(id) {
        return await this.makeRequest(API_ENDPOINTS.ADMIN.GET_BY_ID(id));
    }

    async createAdmin(createAdminDto) {
        return await this.makeRequest(API_ENDPOINTS.ADMIN.CREATE, {
            method: 'POST',
            body: JSON.stringify(createAdminDto)
        });
    }

    async updateAdmin(id, updateAdminDto) {
        return await this.makeRequest(API_ENDPOINTS.ADMIN.UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(updateAdminDto)
        });
    }

    async deleteAdmin(id) {
        return await this.makeRequest(API_ENDPOINTS.ADMIN.DELETE(id), {
            method: 'DELETE'
        });
    }

    // ==================== PATIENT METHODS ====================
    async getAllPatients() {
        return await this.makeRequest(API_ENDPOINTS.PATIENT.GET_ALL);
    }

    async getAllPatientsPaged(pageNumber = 1, pageSize = 10) {
        const params = new URLSearchParams({
            PageNumber: pageNumber.toString(),
            PageSize: pageSize.toString()
        });
        return await this.makeRequest(`${API_ENDPOINTS.PATIENT.GET_ALL_PAGED}?${params}`);
    }

    async getPatientById(id) {
        return await this.makeRequest(API_ENDPOINTS.PATIENT.GET_BY_ID(id));
    }

    async createPatient(patientData) {
        const patientDto = {
            FullName: patientData.fullName,
            Email: patientData.email,
            Password: patientData.password,
            ContactNumber: patientData.contactNumber,
            DateOfBirth: patientData.dateOfBirth
        };
        return await this.makeRequest(API_ENDPOINTS.PATIENT.CREATE, {
            method: 'POST',
            body: JSON.stringify(patientDto)
        });
    }

    async updatePatient(id, patientData) {
        const patientDto = {
            FullName: patientData.fullName,
            Email: patientData.email,
            ContactNumber: patientData.contactNumber,
            DateOfBirth: patientData.dateOfBirth
        };
        return await this.makeRequest(API_ENDPOINTS.PATIENT.UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(patientDto)
        });
    }

    async deletePatient(id) {
        return await this.makeRequest(API_ENDPOINTS.PATIENT.DELETE(id), {
            method: 'DELETE'
        });
    }

    // ==================== DOCTOR METHODS ====================
    async getAllDoctors() {
        return await this.makeRequest(API_ENDPOINTS.DOCTOR.GET_ALL);
    }

    async getAllDoctorsPaged(pageNumber = 1, pageSize = 10) {
        const params = new URLSearchParams({
            PageNumber: pageNumber.toString(),
            PageSize: pageSize.toString()
        });
        return await this.makeRequest(`${API_ENDPOINTS.DOCTOR.GET_ALL_PAGED}?${params}`);
    }

    async getDoctorById(id) {
        return await this.makeRequest(API_ENDPOINTS.DOCTOR.GET_BY_ID(id));
    }

    async createDoctor(doctorData) {
        const doctorDto = {
            FullName: doctorData.fullName,
            Email: doctorData.email,
            ContactNumber: doctorData.contactNumber,
            Specialty: doctorData.specialty
        };
        return await this.makeRequest(API_ENDPOINTS.DOCTOR.CREATE, {
            method: 'POST',
            body: JSON.stringify(doctorDto)
        });
    }

    async updateDoctor(id, doctorData) {
        const doctorDto = {
            FullName: doctorData.fullName,
            Email: doctorData.email,
            ContactNumber: doctorData.contactNumber,
            Specialty: doctorData.specialty
        };
        return await this.makeRequest(API_ENDPOINTS.DOCTOR.UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(doctorDto)
        });
    }

    async deleteDoctor(id) {
        return await this.makeRequest(API_ENDPOINTS.DOCTOR.DELETE(id), {
            method: 'DELETE'
        });
    }

    // ==================== APPOINTMENT METHODS ====================
    async getAllAppointments() {
        return await this.makeRequest(API_ENDPOINTS.APPOINTMENT.GET_ALL);
    }

    async getAllAppointmentsPaged(pageNumber = 1, pageSize = 10) {
        const params = new URLSearchParams({
            PageNumber: pageNumber.toString(),
            PageSize: pageSize.toString()
        });
        return await this.makeRequest(`${API_ENDPOINTS.APPOINTMENT.GET_ALL_PAGED}?${params}`);
    }

    async getAppointmentById(id) {
        return await this.makeRequest(API_ENDPOINTS.APPOINTMENT.GET_BY_ID(id));
    }

    async createAppointment(appointmentData) {
        const appointmentDto = {
            PatientId: parseInt(appointmentData.patientId),
            DoctorId: parseInt(appointmentData.doctorId),
            AppointmentDate: appointmentData.appointmentDate,
            AppointmentTime: appointmentData.appointmentTime,
            Symptoms: appointmentData.symptoms || ''
        };
        return await this.makeRequest(API_ENDPOINTS.APPOINTMENT.CREATE, {
            method: 'POST',
            body: JSON.stringify(appointmentDto)
        });
    }

    async updateAppointment(id, appointmentData) {
        const updateDto = {
            AppointmentDate: appointmentData.appointmentDate,
            AppointmentTime: appointmentData.appointmentTime,
            Symptoms: appointmentData.symptoms || '',
            Status: appointmentData.status || 'Scheduled'
        };
        return await this.makeRequest(API_ENDPOINTS.APPOINTMENT.UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(updateDto)
        });
    }

    async cancelAppointment(id) {
        return await this.makeRequest(API_ENDPOINTS.APPOINTMENT.CANCEL(id), {
            method: 'PATCH'
        });
    }

    async deleteAppointment(id) {
        return await this.makeRequest(API_ENDPOINTS.APPOINTMENT.DELETE(id), {
            method: 'DELETE'
        });
    }

    // ==================== MEDICAL RECORD METHODS ====================
    async getAllMedicalRecords() {
        return await this.makeRequest(API_ENDPOINTS.MEDICAL_RECORD.GET_ALL);
    }

    async getAllMedicalRecordsPaged(paginationParams = DEFAULT_PAGINATION) {
        const params = new URLSearchParams(paginationParams);
        return await this.makeRequest(`${API_ENDPOINTS.MEDICAL_RECORD.GET_ALL_PAGED}?${params}`);
    }

    async getMedicalRecordById(id) {
        return await this.makeRequest(API_ENDPOINTS.MEDICAL_RECORD.GET_BY_ID(id));
    }

    async createMedicalRecord(createMedicalRecordDto) {
        return await this.makeRequest(API_ENDPOINTS.MEDICAL_RECORD.CREATE, {
            method: 'POST',
            body: JSON.stringify(createMedicalRecordDto)
        });
    }

    async updateMedicalRecord(id, updateMedicalRecordDto) {
        return await this.makeRequest(API_ENDPOINTS.MEDICAL_RECORD.UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(updateMedicalRecordDto)
        });
    }

    async deleteMedicalRecord(id) {
        return await this.makeRequest(API_ENDPOINTS.MEDICAL_RECORD.DELETE(id), {
            method: 'DELETE'
        });
    }

    // ==================== PRESCRIPTION METHODS ====================
    async getAllPrescriptions() {
        return await this.makeRequest(API_ENDPOINTS.PRESCRIPTION.GET_ALL);
    }

    async getAllPrescriptionsPaged(paginationParams = DEFAULT_PAGINATION) {
        const params = new URLSearchParams(paginationParams);
        return await this.makeRequest(`${API_ENDPOINTS.PRESCRIPTION.GET_ALL_PAGED}?${params}`);
    }

    async getPrescriptionById(id) {
        return await this.makeRequest(API_ENDPOINTS.PRESCRIPTION.GET_BY_ID(id));
    }

    async createPrescription(createPrescriptionDto) {
        return await this.makeRequest(API_ENDPOINTS.PRESCRIPTION.CREATE, {
            method: 'POST',
            body: JSON.stringify(createPrescriptionDto)
        });
    }

    async updatePrescription(id, updatePrescriptionDto) {
        return await this.makeRequest(API_ENDPOINTS.PRESCRIPTION.UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(updatePrescriptionDto)
        });
    }

    async deletePrescription(id) {
        return await this.makeRequest(API_ENDPOINTS.PRESCRIPTION.DELETE(id), {
            method: 'DELETE'
        });
    }

    // ==================== TEST MASTER METHODS ====================
    async getAllTestMasters() {
        return await this.makeRequest(API_ENDPOINTS.TEST_MASTER.GET_ALL);
    }

    async getAllTestMastersPaged(paginationParams = DEFAULT_PAGINATION) {
        const params = new URLSearchParams(paginationParams);
        return await this.makeRequest(`${API_ENDPOINTS.TEST_MASTER.GET_ALL_PAGED}?${params}`);
    }

    async getTestMasterById(id) {
        return await this.makeRequest(API_ENDPOINTS.TEST_MASTER.GET_BY_ID(id));
    }

    async createTestMaster(createTestMasterDto) {
        return await this.makeRequest(API_ENDPOINTS.TEST_MASTER.CREATE, {
            method: 'POST',
            body: JSON.stringify(createTestMasterDto)
        });
    }

    async updateTestMaster(id, updateTestMasterDto) {
        return await this.makeRequest(API_ENDPOINTS.TEST_MASTER.UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(updateTestMasterDto)
        });
    }

    async deleteTestMaster(id) {
        return await this.makeRequest(API_ENDPOINTS.TEST_MASTER.DELETE(id), {
            method: 'DELETE'
        });
    }

    // ==================== RECOMMENDED TEST METHODS ====================
    async getAllRecommendedTests() {
        return await this.makeRequest(API_ENDPOINTS.RECOMMENDED_TEST.GET_ALL);
    }

    async getAllRecommendedTestsPaged(paginationParams = DEFAULT_PAGINATION) {
        const params = new URLSearchParams(paginationParams);
        return await this.makeRequest(`${API_ENDPOINTS.RECOMMENDED_TEST.GET_ALL_PAGED}?${params}`);
    }

    async getRecommendedTestById(id) {
        return await this.makeRequest(API_ENDPOINTS.RECOMMENDED_TEST.GET_BY_ID(id));
    }

    async createRecommendedTest(createRecommendedTestDto) {
        return await this.makeRequest(API_ENDPOINTS.RECOMMENDED_TEST.CREATE, {
            method: 'POST',
            body: JSON.stringify(createRecommendedTestDto)
        });
    }

    async updateRecommendedTest(id, updateRecommendedTestDto) {
        return await this.makeRequest(API_ENDPOINTS.RECOMMENDED_TEST.UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(updateRecommendedTestDto)
        });
    }

    async deleteRecommendedTest(id) {
        return await this.makeRequest(API_ENDPOINTS.RECOMMENDED_TEST.DELETE(id), {
            method: 'DELETE'
        });
    }

    // ==================== DOSAGE MASTER METHODS ====================
    async getAllDosageMasters() {
        return await this.makeRequest(API_ENDPOINTS.DOSAGE_MASTER.GET_ALL);
    }

    async getAllDosageMastersPaged(paginationParams = DEFAULT_PAGINATION) {
        const params = new URLSearchParams(paginationParams);
        return await this.makeRequest(`${API_ENDPOINTS.DOSAGE_MASTER.GET_ALL_PAGED}?${params}`);
    }

    async getDosageMasterById(id) {
        return await this.makeRequest(API_ENDPOINTS.DOSAGE_MASTER.GET_BY_ID(id));
    }

    async createDosageMaster(createDosageMasterDto) {
        return await this.makeRequest(API_ENDPOINTS.DOSAGE_MASTER.CREATE, {
            method: 'POST',
            body: JSON.stringify(createDosageMasterDto)
        });
    }

    async updateDosageMaster(id, updateDosageMasterDto) {
        return await this.makeRequest(API_ENDPOINTS.DOSAGE_MASTER.UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(updateDosageMasterDto)
        });
    }

    async deleteDosageMaster(id) {
        return await this.makeRequest(API_ENDPOINTS.DOSAGE_MASTER.DELETE(id), {
            method: 'DELETE'
        });
    }

    // ==================== BACKWARD COMPATIBILITY ALIASES ====================
    // These methods maintain compatibility with existing frontend code
    async getPatients() { return await this.getAllPatients(); }
    async getDoctors() { return await this.getAllDoctors(); }
    async getAppointments() { return await this.getAllAppointments(); }
    async getMedicalRecords() { return await this.getAllMedicalRecords(); }
    async getPrescriptions() { return await this.getAllPrescriptions(); }
    async getTestMasters() { return await this.getAllTestMasters(); }
    async getRecommendedTests() { return await this.getAllRecommendedTests(); }
    async getDosageMasters() { return await this.getAllDosageMasters(); }

    // Individual entity getters
    async getPatient(id) { return await this.getPatientById(id); }
    async getDoctor(id) { return await this.getDoctorById(id); }
    async getAppointment(id) { return await this.getAppointmentById(id); }
    async getMedicalRecord(id) { return await this.getMedicalRecordById(id); }
    async getPrescription(id) { return await this.getPrescriptionById(id); }
    async getTestMaster(id) { return await this.getTestMasterById(id); }
    async getRecommendedTest(id) { return await this.getRecommendedTestById(id); }
    async getDosageMaster(id) { return await this.getDosageMasterById(id); }

    // Appointment-specific aliases for booking functionality
    async getAppointmentsByPatientId(patientId) {
        const appointments = await this.getAllAppointments();
        return appointments.filter(apt => apt.patientId === patientId);
    }

    async getAppointmentsByDoctorId(doctorId) {
        const appointments = await this.getAllAppointments();
        return appointments.filter(apt => apt.doctorId === doctorId);
    }
}

// Create global instance
const apiService = new ApiService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}
