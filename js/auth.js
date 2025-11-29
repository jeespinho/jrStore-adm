// frontend-admin/js/auth.js
// Simulação de autenticação (substituir por sistema real)
const ADMIN_CREDENTIALS = {
    email: "admin@jrstore.com",
    password: "admin123"
};

function checkAuth() {
    return localStorage.getItem('adminAuthenticated') === 'true';
}

function login(email, password) {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminAuthenticated', 'true');
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('adminAuthenticated');
    window.location.reload();
}

function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    // Carrega os produtos ao mostrar o dashboard
    if (window.loadProducts) {
        window.loadProducts();
    }
}

function showLogin() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

// Event Listeners para auth
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (checkAuth()) {
        showDashboard();
    } else {
        showLogin();
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (login(email, password)) {
            showDashboard();
        } else {
            alert('Credenciais inválidas! Use: admin@jrstore.com / admin123');
        }
    });
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});