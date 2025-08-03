// API Base Configuration
const API_BASE_URL = '/api';

// Your fetchMethod template exactly as provided
function fetchMethod(url, callback, method = "GET", data = null, token = null) {
    console.log("fetchMethod: ", url, method, data, token);
    
    const headers = {};
    
    if (data) {
        headers["Content-Type"] = "application/json";
    }
    
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
    
    let options = {
        method: method.toUpperCase(),
        headers: headers,
    };
    
    if (method.toUpperCase() !== "GET" && data !== null) {
        options.body = JSON.stringify(data);
    }
    
    fetch(url, options)
        .then((response) => {
            if (response.status == 204) {
                callback(response.status, {});
            } else {
                response.json().then((responseData) =>
                    callback(response.status, responseData));
            }
        })
        .catch((error) => console.error(`Error from ${method} ${url}:`, error));
}

// Authentication Helper Functions
function getToken() {
    return localStorage.getItem('authToken');
}

function setToken(token) {
    localStorage.setItem('authToken', token);
}

function removeToken() {
    localStorage.removeItem('authToken');
}

// Enhanced token management for refresh tokens
function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

function setRefreshToken(token) {
    localStorage.setItem('refreshToken', token);
}

function removeRefreshToken() {
    localStorage.removeItem('refreshToken');
}

function setTokens(accessToken, refreshToken, rememberMe = false) {
    if (rememberMe) {
        // Store in localStorage for persistent sessions
        localStorage.setItem('authToken', accessToken);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('rememberMe', 'true');
    } else {
        // Store in sessionStorage for session-only
        sessionStorage.setItem('authToken', accessToken);
        if (refreshToken) {
            sessionStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.removeItem('rememberMe');
    }
}

function getStoredToken() {
    // Check if remember me was enabled
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (rememberMe) {
        return localStorage.getItem('authToken');
    } else {
        return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    }
}

function getStoredRefreshToken() {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (rememberMe) {
        return localStorage.getItem('refreshToken');
    } else {
        return sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
    }
}

function clearAllTokens() {
    // Clear from both storage locations
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
}

// Token refresh functionality
function refreshAccessToken(callback) {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
        callback(false, 'No refresh token available');
        return;
    }

    fetchMethod('/api/auth/refresh', (status, data) => {
        if (status === 200 && data.token) {
            const rememberMe = localStorage.getItem('rememberMe') === 'true';
            setTokens(data.token, data.refreshToken || refreshToken, rememberMe);
            callback(true, data.token);
        } else {
            // Refresh token is invalid, clear all tokens
            clearAllTokens();
            callback(false, 'Refresh token expired');
        }
    }, 'POST', { refreshToken });
}

// Enhanced fetch method with automatic token refresh
function fetchWithAuth(url, callback, method = "GET", data = null) {
    const token = getStoredToken();
    
    if (!token) {
        callback(401, { error: 'No authentication token' });
        return;
    }

    // First attempt with current token
    fetchMethod(url, (status, responseData) => {
        if (status === 401 && getStoredRefreshToken()) {
            // Token might be expired, try to refresh
            refreshAccessToken((success, newToken) => {
                if (success) {
                    // Retry with new token
                    fetchMethod(url, callback, method, data, newToken);
                } else {
                    // Refresh failed, redirect to login
                    window.location.href = 'index.html';
                }
            });
        } else {
            callback(status, responseData);
        }
    }, method, data, token);
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function removeCurrentUser() {
    localStorage.removeItem('currentUser');
}

function isAuthenticated() {
    const token = getStoredToken();
    const user = getCurrentUser();
    return token && user;
}

// API Endpoints
const API_ENDPOINTS = {
    // Authentication
    login: `${API_BASE_URL}/users/login`,
    register: `${API_BASE_URL}/users/register`,
    
    // Users
    users: `${API_BASE_URL}/users`,
    userById: (id) => `${API_BASE_URL}/users/${id}`,
    userBadges: (id) => `${API_BASE_URL}/users/${id}/badges`,
    
    // Vulnerabilities
    vulnerabilities: `${API_BASE_URL}/vulnerabilities`,
    
    // Reports
    reports: `${API_BASE_URL}/reports`,
    reportById: (id) => `${API_BASE_URL}/reports/${id}`,
    
    // Reviews
    reviews: `${API_BASE_URL}/reviews`,
    myReviews: `${API_BASE_URL}/reviews/my-reviews`,
    reviewById: (id) => `${API_BASE_URL}/reviews/${id}`,
    
    // Shop
    shop: `${API_BASE_URL}/shop`,
    shopPurchase: `${API_BASE_URL}/shop/purchase`,
    shopEquip: `${API_BASE_URL}/shop/equip`,
    shopUnequip: `${API_BASE_URL}/shop/unequip`,
    userInventory: (id) => `${API_BASE_URL}/shop/user/${id}/inventory`,
    
    // Leaderboard
    leaderboard: `${API_BASE_URL}/leaderboard`,
    
    // Ranks
    userRank: (id) => `${API_BASE_URL}/ranks/${id}`
};

// API Helper Functions
const API = {
    // Authentication
    login: (username, password, callback) => {
        fetchMethod(API_ENDPOINTS.login, callback, 'POST', { username, password });
    },
    
    register: (username, email, password, callback) => {
        fetchMethod(API_ENDPOINTS.register, callback, 'POST', { username, email, password });
    },
    
    // Users
    getUsers: (callback) => {
        fetchMethod(API_ENDPOINTS.users, callback, 'GET');
    },
    
    getUserById: (id, callback) => {
        fetchMethod(API_ENDPOINTS.userById(id), callback, 'GET');
    },
    
    getUserBadges: (id, callback) => {
        fetchMethod(API_ENDPOINTS.userBadges(id), callback, 'GET');
    },
    
    updateUser: (id, userData, callback) => {
        fetchMethod(API_ENDPOINTS.userById(id), callback, 'PUT', userData);
    },
    
    // Vulnerabilities
    getVulnerabilities: (callback) => {
        fetchMethod(API_ENDPOINTS.vulnerabilities, callback, 'GET');
    },
    
    createVulnerability: (vulnerabilityData, callback) => {
        fetchMethod(API_ENDPOINTS.vulnerabilities, callback, 'POST', vulnerabilityData);
    },
    
    // Reports
    createReport: (reportData, callback) => {
        fetchMethod(API_ENDPOINTS.reports, callback, 'POST', reportData);
    },
    
    getAllReports: (callback) => {
        fetchMethod(API_ENDPOINTS.reports, callback, 'GET');
    },
    
    updateReport: (id, reportData, callback) => {
        fetchMethod(API_ENDPOINTS.reportById(id), callback, 'PUT', reportData);
    },
    
    // Reviews
    getReviews: (callback) => {
        fetchMethod(API_ENDPOINTS.reviews, callback, 'GET');
    },
    
    getMyReviews: (callback) => {
        const token = getStoredToken();
        fetchMethod(API_ENDPOINTS.myReviews, callback, 'GET', null, token);
    },
    
    createReview: (reviewData, callback) => {
        const token = getStoredToken();
        fetchMethod(API_ENDPOINTS.reviews, callback, 'POST', reviewData, token);
    },
    
    updateReview: (id, reviewData, callback) => {
        const token = getStoredToken();
        fetchMethod(API_ENDPOINTS.reviewById(id), callback, 'PUT', reviewData, token);
    },
    
    deleteReview: (id, callback) => {
        const token = getStoredToken();
        fetchMethod(API_ENDPOINTS.reviewById(id), callback, 'DELETE', null, token);
    },
    
    // Shop
    getShopItems: (callback) => {
        fetchMethod(API_ENDPOINTS.shop, callback, 'GET');
    },
    
    purchaseItem: (purchaseData, callback) => {
        fetchMethod(API_ENDPOINTS.shopPurchase, callback, 'POST', purchaseData);
    },
    
    equipItem: (equipData, callback) => {
        fetchMethod(API_ENDPOINTS.shopEquip, callback, 'PUT', equipData);
    },
    
    unequipItem: (unequipData, callback) => {
        fetchMethod(API_ENDPOINTS.shopUnequip, callback, 'PUT', unequipData);
    },
    
    getUserInventory: (userId, callback) => {
        fetchMethod(API_ENDPOINTS.userInventory(userId), callback, 'GET');
    },
    
    // Leaderboard
    getLeaderboard: (callback) => {
        fetchMethod(API_ENDPOINTS.leaderboard, callback, 'GET');
    },
    
    // Ranks
    getUserRank: (userId, callback) => {
        fetchMethod(API_ENDPOINTS.userRank(userId), callback, 'GET');
    }
};

// Utility Functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function logout() {
    clearAllTokens();
    removeCurrentUser();
    window.location.href = 'index.html';
}

// Global logout handler
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});