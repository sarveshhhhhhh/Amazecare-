// API Configuration for PAmazeCare Hospital Management System - API Configuration

// Base API URL - Update this to match your backend server
const API_BASE_URL = 'http://localhost:5120/api';

// API Endpoints Configuration
const API_ENDPOINTS = {
    // Authentication endpoints
    AUTH: {
        LOGIN: `${API_BASE_URL}/Auth/login`,
        REGISTER: `${API_BASE_URL}/Auth/register`
    },

    // Admin endpoints
    ADMIN: {
        GET_ALL: `${API_BASE_URL}/Admin`,
        GET_ALL_PAGED: `${API_BASE_URL}/Admin/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/Admin/${id}`,
        CREATE: `${API_BASE_URL}/Admin`,
        UPDATE: (id) => `${API_BASE_URL}/Admin/${id}`,
        DELETE: (id) => `${API_BASE_URL}/Admin/${id}`
    },

    // Patient endpoints
    PATIENT: {
        GET_ALL: `${API_BASE_URL}/Patient/all`,
        GET_ALL_PAGED: `${API_BASE_URL}/Patient/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/Patient/${id}`,
        CREATE: `${API_BASE_URL}/Patient`,
        UPDATE: (id) => `${API_BASE_URL}/Patient/${id}`,
        DELETE: (id) => `${API_BASE_URL}/Patient/${id}`
    },

    // Doctor endpoints
    DOCTOR: {
        GET_ALL: `${API_BASE_URL}/Doctor/all`,
        GET_ALL_PAGED: `${API_BASE_URL}/Doctor/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/Doctor/${id}`,
        CREATE: `${API_BASE_URL}/Doctor`,
        UPDATE: (id) => `${API_BASE_URL}/Doctor/${id}`,
        DELETE: (id) => `${API_BASE_URL}/Doctor/${id}`
    },

    // Appointment endpoints
    APPOINTMENT: {
        GET_ALL: `${API_BASE_URL}/Appointment`,
        GET_ALL_PAGED: `${API_BASE_URL}/Appointment/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/Appointment/${id}`,
        CREATE: `${API_BASE_URL}/Appointment`,
        UPDATE: (id) => `${API_BASE_URL}/Appointment/${id}`,
        DELETE: (id) => `${API_BASE_URL}/Appointment/${id}`,
        CANCEL: (id) => `${API_BASE_URL}/Appointment/${id}/cancel`
    },

    // Medical Record endpoints
    MEDICAL_RECORD: {
        GET_ALL: `${API_BASE_URL}/MedicalRecord`,
        GET_ALL_PAGED: `${API_BASE_URL}/MedicalRecord/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/MedicalRecord/${id}`,
        CREATE: `${API_BASE_URL}/MedicalRecord`,
        UPDATE: (id) => `${API_BASE_URL}/MedicalRecord/${id}`,
        DELETE: (id) => `${API_BASE_URL}/MedicalRecord/${id}`
    },

    // Prescription endpoints
    PRESCRIPTION: {
        GET_ALL: `${API_BASE_URL}/Prescription`,
        GET_ALL_PAGED: `${API_BASE_URL}/Prescription/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/Prescription/${id}`,
        CREATE: `${API_BASE_URL}/Prescription`,
        UPDATE: (id) => `${API_BASE_URL}/Prescription/${id}`,
        DELETE: (id) => `${API_BASE_URL}/Prescription/${id}`
    },

    // Test Master endpoints
    TEST_MASTER: {
        GET_ALL: `${API_BASE_URL}/TestMaster`,
        GET_ALL_PAGED: `${API_BASE_URL}/TestMaster/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/TestMaster/${id}`,
        CREATE: `${API_BASE_URL}/TestMaster`,
        UPDATE: (id) => `${API_BASE_URL}/TestMaster/${id}`,
        DELETE: (id) => `${API_BASE_URL}/TestMaster/${id}`
    },

    // Recommended Test endpoints
    RECOMMENDED_TEST: {
        GET_ALL: `${API_BASE_URL}/RecommendedTest`,
        GET_ALL_PAGED: `${API_BASE_URL}/RecommendedTest/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/RecommendedTest/${id}`,
        CREATE: `${API_BASE_URL}/RecommendedTest`,
        UPDATE: (id) => `${API_BASE_URL}/RecommendedTest/${id}`,
        DELETE: (id) => `${API_BASE_URL}/RecommendedTest/${id}`
    },

    // Dosage Master endpoints
    DOSAGE_MASTER: {
        GET_ALL: `${API_BASE_URL}/DosageMaster`,
        GET_PAGED: `${API_BASE_URL}/DosageMaster/paged`,
        GET_BY_ID: (id) => `${API_BASE_URL}/DosageMaster/${id}`,
        CREATE: `${API_BASE_URL}/DosageMaster`,
        UPDATE: (id) => `${API_BASE_URL}/DosageMaster/${id}`,
        DELETE: (id) => `${API_BASE_URL}/DosageMaster/${id}`
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
