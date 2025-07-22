document.addEventListener('DOMContentLoaded', function() {
    // Check if already authenticated
    if (isAuthenticated()) {
        window.location.href = 'home.html';
        return;
    }
    
    // Form toggle functionality
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginToggle.addEventListener('click', function() {
        loginToggle.classList.add('active');
        registerToggle.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });
    
    registerToggle.addEventListener('click', function() {
        registerToggle.classList.add('active');
        loginToggle.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });
    
    // Login form submission
    const loginFormElement = document.getElementById('loginFormElement');
    loginFormElement.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            showError('loginError', 'Please fill in all fields');
            return;
        }
        
        // Disable form during login
        const submitBtn = loginFormElement.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        API.login(username, password, function(status, data) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
            
            if (status === 200) {
                // Login successful
                setToken(data.token);
                
                // Get user details and store them
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                const userId = payload.userId;
                
                API.getUserById(userId, function(userStatus, userData) {
                    if (userStatus === 200 && userData.length > 0) {
                        const user = userData[0];
                        setCurrentUser({
                            id: user.id,
                            username: user.username,
                            reputation: user.reputation,
                            rank_id: user.rank_id,
                            rank_name: user.rank_name
                        });
                        
                        window.location.href = 'home.html';
                    } else {
                        showError('loginError', 'Error loading user data');
                    }
                });
            } else {
                // Login failed
                let errorMessage = 'Login failed';
                if (data.error) {
                    errorMessage = data.error;
                } else if (data.message) {
                    errorMessage = data.message;
                }
                showError('loginError', errorMessage);
            }
        });
    });
    
    // Register form submission
    const registerFormElement = document.getElementById('registerFormElement');
    registerFormElement.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        
        if (!username || !email || !password) {
            showError('registerError', 'Please fill in all fields');
            return;
        }
        
        if (password.length < 6) {
            showError('registerError', 'Password must be at least 6 characters long');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('registerError', 'Please enter a valid email address');
            return;
        }
        
        // Disable form during registration
        const submitBtn = registerFormElement.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';
        
        API.register(username, email, password, function(status, data) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
            
            if (status === 200) {
                // Registration successful
                setToken(data.token);
                
                // Get user details and store them
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                const userId = payload.userId;
                
                API.getUserById(userId, function(userStatus, userData) {
                    if (userStatus === 200 && userData.length > 0) {
                        const user = userData[0];
                        setCurrentUser({
                            id: user.id,
                            username: user.username,
                            reputation: user.reputation,
                            rank_id: user.rank_id,
                            rank_name: user.rank_name || 'Bronze'
                        });
                        
                        window.location.href = 'home.html';
                    } else {
                        showError('registerError', 'Error loading user data');
                    }
                });
            } else {
                // Registration failed
                let errorMessage = 'Registration failed';
                if (data.error) {
                    errorMessage = data.error;
                } else if (data.message) {
                    errorMessage = data.message;
                }
                showError('registerError', errorMessage);
            }
        });
    });
});