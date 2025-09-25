document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password');
    const rememberMe = document.getElementById('remember');

    // Check if already logged in
    checkAuthStatus();

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = passwordInput.value;
        
        // Simple validation
        if (!username || !password) {
            showAlert('error', 'Error', 'Please enter both username and password');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        
        try {
            // Send login request to server
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    rememberMe: rememberMe.checked
                }),
                credentials: 'same-origin' // Important for cookies/session
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Save remember me preference
                if (rememberMe.checked) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('username', username);
                } else {
                    localStorage.removeItem('rememberMe');
                }
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('error', 'Login Failed', error.message || 'An error occurred during login');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    // Check for remembered username
    if (localStorage.getItem('rememberMe') === 'true') {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            document.getElementById('username').value = savedUsername;
            document.getElementById('remember').checked = true;
        }
    }

    // Check authentication status
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/check-auth', {
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.isAuthenticated) {
                    // If already logged in, redirect to dashboard
                    window.location.href = 'dashboard.html';
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }

    // Show alert function
    function showAlert(icon, title, text) {
        // Using SweetAlert2 for nice alerts
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: icon,
                title: title,
                text: text,
                confirmButtonColor: '#6f4e37',
                confirmButtonText: 'OK'
            });
        } else {
            // Fallback to browser alert
            alert(`${title}: ${text}`);
        }
    }
});
