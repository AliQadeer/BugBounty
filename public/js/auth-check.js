// Authentication Check - redirect if not logged in
document.addEventListener('DOMContentLoaded', function() {
    // Skip auth check for login page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        return;
    }
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update navigation with current user info
    const user = getCurrentUser();
    if (user) {
        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) {
            usernameDisplay.textContent = user.username;
        }
    }
    
    // Set up automatic token refresh for "Remember Me" users
    setupTokenRefresh();
});

function setupTokenRefresh() {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (!rememberMe) return;
    
    const token = getStoredToken();
    if (!token) return;
    
    try {
        // Decode token to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = payload.exp - currentTime;
        
        // If token expires in less than 10 minutes, refresh it now
        if (timeUntilExpiry < 600) {
            refreshAccessToken((success) => {
                if (!success) {
                    // Refresh failed, redirect to login
                    window.location.href = 'index.html';
                }
            });
        } else {
            // Set up auto-refresh 5 minutes before expiry
            const refreshTime = (timeUntilExpiry - 300) * 1000; // Convert to milliseconds, refresh 5 min early
            if (refreshTime > 0) {
                setTimeout(() => {
                    refreshAccessToken((success) => {
                        if (success) {
                            // Schedule next refresh
                            setupTokenRefresh();
                        }
                    });
                }, refreshTime);
            }
        }
    } catch (error) {
        console.error('Error setting up token refresh:', error);
    }
}