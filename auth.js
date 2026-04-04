// ==================== SISTEM AUTHENTIKASI ====================

// Admin default
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Fungsi untuk membuka auth modal
function openAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.add('show');
    switchTab('login');
}

// Fungsi untuk menutup auth modal
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('show');
    clearAuthForms();
}

// Tutup modal saat klik di luar
document.addEventListener('click', function(e) {
    const modal = document.getElementById('authModal');
    const userNav = document.getElementById('user-nav');
    
    if (e.target === modal) {
        closeAuthModal();
    }
});

// Switch antar tab
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const signupForm = document.getElementById('signupForm');

    // Hide semua
    loginForm.classList.add('hidden');
    adminLoginForm.classList.add('hidden');
    signupForm.classList.add('hidden');

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (tab === 'admin') {
        adminLoginForm.classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    } else if (tab === 'signup') {
        signupForm.classList.remove('hidden');
    }
}

// Handle login pembeli
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    errorDiv.classList.remove('show');
    errorDiv.innerHTML = '';

    // Validasi
    if (!email || !password) {
        showAuthError(errorDiv, 'Email dan password harus diisi!');
        return;
    }

    // Ambil users dari localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => (u.email === email || u.username === email) && u.password === password);

    if (user) {
        // Login berhasil
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userType', 'pembeli');
        closeAuthModal();
        updateAuthUI();
        showNotification('✅ Login berhasil!');
        
        // Redirect ke dashboard pembeli
        setTimeout(() => {
            window.location.href = 'buyer-dashboard.html';
        }, 1000);
    } else {
        showAuthError(errorDiv, '❌ Email/Username atau password salah!');
    }
}

// Handle login admin
function handleAdminLogin(event) {
    event.preventDefault();

    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('admin-error');

    errorDiv.classList.remove('show');
    errorDiv.innerHTML = '';

    if (!username || !password) {
        showAuthError(errorDiv, 'Username dan password harus diisi!');
        return;
    }

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Login admin berhasil
        const admin = {
            id: 'admin',
            username: username,
            email: 'admin@3grecep.com',
            type: 'admin'
        };
        localStorage.setItem('currentUser', JSON.stringify(admin));
        localStorage.setItem('userType', 'admin');
        closeAuthModal();
        updateAuthUI();
        showNotification('✅ Login admin berhasil!');
        
        // Redirect ke admin dashboard
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1000);
    } else {
        showAuthError(errorDiv, '❌ Username atau password admin salah!');
    }
}

// Handle signup
function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const phone = document.getElementById('signup-phone').value;
    const errorDiv = document.getElementById('signup-error');

    errorDiv.classList.remove('show');
    errorDiv.innerHTML = '';

    // Validasi
    if (!name || !email || !username || !password || !confirm || !phone) {
        showAuthError(errorDiv, '❌ Semua field harus diisi!');
        return;
    }

    if (password.length < 6) {
        showAuthError(errorDiv, '❌ Password minimal 6 karakter!');
        return;
    }

    if (password !== confirm) {
        showAuthError(errorDiv, '❌ Password tidak cocok!');
        return;
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAuthError(errorDiv, '❌ Format email tidak valid!');
        return;
    }

    // Validasi nomor HP
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(phone)) {
        showAuthError(errorDiv, '❌ Nomor HP tidak valid!');
        return;
    }

    // Cek apakah user sudah ada
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email || u.username === username)) {
        showAuthError(errorDiv, '❌ Email atau username sudah terdaftar!');
        return;
    }

    // Buat user baru
    const newUser = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        username: username,
        password: password,
        phone: phone,
        createdAt: new Date().toISOString()
    };

    // Simpan ke localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    showNotification('✅ Akun berhasil dibuat! Silakan login.');
    
    // Auto login
    setTimeout(() => {
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('userType', 'pembeli');
        closeAuthModal();
        updateAuthUI();
        window.location.href = 'buyer-dashboard.html';
    }, 1500);
}

// Update UI berdasarkan login status
function updateAuthUI() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userNav = document.getElementById('user-nav');
    const userDropdown = document.getElementById('userDropdown');

    if (currentUser) {
        // User sudah login
        if (userNav) {
            userNav.style.display = 'block';
            userNav.innerHTML = `<a href="#" onclick="showUserMenu()">${currentUser.name || currentUser.username}</a>`;
        }
    } else {
        // User belum login
        if (userNav) {
            userNav.style.display = 'block';
            userNav.innerHTML = `<a href="#" onclick="openAuthModal()">👤 Login</a>`;
        }
        if (userDropdown) {
            userDropdown.classList.remove('show');
        }
    }
}

// Show user menu dropdown
function showUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Go to dashboard
function goToDashboard() {
    const userType = localStorage.getItem('userType');
    if (userType === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else {
        window.location.href = 'buyer-dashboard.html';
    }
}

// Logout
function logout() {
    if (confirm('Yakin ingin logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userType');
        localStorage.removeItem('cart');
        showNotification('✅ Logout berhasil!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Show auth error
function showAuthError(errorDiv, message) {
    errorDiv.innerHTML = message;
    errorDiv.classList.add('show');
}

// Clear auth forms
function clearAuthForms() {
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-username').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm').value = '';
    document.getElementById('signup-phone').value = '';
}

// Initialize auth UI on page load
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
});

// Close dropdown saat klik di luar
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('userDropdown');
    const userNav = document.getElementById('user-nav');
    
    if (userNav && !userNav.contains(e.target) && dropdown && !dropdown.contains(e.target)) {
        if (dropdown) dropdown.classList.remove('show');
    }
});