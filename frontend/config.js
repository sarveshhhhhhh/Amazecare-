// API Configuration for PAmazeCare Hospital Management System - API Configuration

// Base API URL - Update this to match your backend server
const API_BASE_URL = 'http://localhost:5123';

// API Endpoints Configuration
const API_ENDPOINTS = {
    // Authentication endpoints
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/Auth/login`,
        REGISTER: `${API_BASE_URL}/api/Auth/register`
    },

    // Admin endpoints
    ADMIN: {
        GET_ALL: `${API_BASE_URL}/api/Admin`,
        GET_ALL_PAGED: `${API_BASE_URL}/api/Admin/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/api/Admin/${id}`,
        CREATE: `${API_BASE_URL}/api/Admin`,
        UPDATE: (id) => `${API_BASE_URL}/api/Admin/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/Admin/${id}`
    },

    // Patient endpoints
    PATIENT: {
        GET_ALL: `${API_BASE_URL}/api/Patient/all`,
        GET_ALL_PAGED: `${API_BASE_URL}/api/Patient/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/api/Patient/${id}`,
        CREATE: `${API_BASE_URL}/api/Patient`,
        UPDATE: (id) => `${API_BASE_URL}/api/Patient/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/Patient/${id}`
    },

    // Doctor endpoints
    DOCTOR: {
        GET_ALL: `${API_BASE_URL}/api/Doctor/all`,
        GET_ALL_PAGED: `${API_BASE_URL}/api/Doctor/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/api/Doctor/${id}`,
        CREATE: `${API_BASE_URL}/api/Doctor`,
        UPDATE: (id) => `${API_BASE_URL}/api/Doctor/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/Doctor/${id}`
    },

    // Appointment endpoints
    APPOINTMENT: {
        GET_ALL: `${API_BASE_URL}/api/Appointment`,
        GET_ALL_PAGED: `${API_BASE_URL}/api/Appointment/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/api/Appointment/${id}`,
        CREATE: `${API_BASE_URL}/api/Appointment`,
        UPDATE: (id) => `${API_BASE_URL}/api/Appointment/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/Appointment/${id}`,
        CANCEL: (id) => `${API_BASE_URL}/api/Appointment/${id}/cancel`
    },

    // Medical Record endpoints
    MEDICAL_RECORD: {
        GET_ALL: `${API_BASE_URL}/api/MedicalRecord`,
        GET_ALL_PAGED: `${API_BASE_URL}/api/MedicalRecord/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/api/MedicalRecord/${id}`,
        CREATE: `${API_BASE_URL}/api/MedicalRecord`,
        UPDATE: (id) => `${API_BASE_URL}/api/MedicalRecord/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/MedicalRecord/${id}`
    },

    // Prescription endpoints
    PRESCRIPTION: {
        GET_ALL: `${API_BASE_URL}/api/Prescription`,
        GET_ALL_PAGED: `${API_BASE_URL}/api/Prescription/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/api/Prescription/${id}`,
        CREATE: `${API_BASE_URL}/api/Prescription`,
        UPDATE: (id) => `${API_BASE_URL}/api/Prescription/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/Prescription/${id}`
    },

    // Test Master endpoints
    TEST_MASTER: {
        GET_ALL: `${API_BASE_URL}/api/TestMaster`,
        GET_ALL_PAGED: `${API_BASE_URL}/api/TestMaster/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/api/TestMaster/${id}`,
        CREATE: `${API_BASE_URL}/api/TestMaster`,
        UPDATE: (id) => `${API_BASE_URL}/api/TestMaster/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/TestMaster/${id}`
    },

    // Recommended Test endpoints
    RECOMMENDED_TEST: {
        GET_ALL: `${API_BASE_URL}/api/RecommendedTest`,
        GET_ALL_PAGED: `${API_BASE_URL}/api/RecommendedTest/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/api/RecommendedTest/${id}`,
        CREATE: `${API_BASE_URL}/api/RecommendedTest`,
        UPDATE: (id) => `${API_BASE_URL}/api/RecommendedTest/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/RecommendedTest/${id}`
    },

    // Dosage Master endpoints
    DOSAGE_MASTER: {
        GET_ALL: `${API_BASE_URL}/api/DosageMaster`,
        GET_ALL_PAGED: `${API_BASE_URL}/api/DosageMaster/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/api/DosageMaster/${id}`,
        CREATE: `${API_BASE_URL}/api/DosageMaster`,
        UPDATE: (id) => `${API_BASE_URL}/api/DosageMaster/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/DosageMaster/${id}`
    }
};

// Default pagination parameters
const DEFAULT_PAGINATION = {
    pageNumber: 1,
    pageSize: 10
};

// User roles matching backend UserTypeEnum
const USER_ROLES = {
    PATIENT: 1,
    DOCTOR: 2,
    ADMIN: 3
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_ENDPOINTS, DEFAULT_PAGINATION, USER_ROLES };
}
