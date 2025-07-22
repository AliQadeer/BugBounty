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
});