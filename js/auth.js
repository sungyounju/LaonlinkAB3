// ============================================================================
// Firebase Authentication for LaonLinkAB
// ============================================================================

// Firebase Configuration
// IMPORTANT: Replace with your actual Firebase project configuration
// Get this from: Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Check if Firebase is configured
const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey !== "YOUR_API_KEY" &&
           firebaseConfig.projectId !== "YOUR_PROJECT_ID";
};

// Initialize Firebase
let firebaseInitialized = false;
try {
    if (isFirebaseConfigured() && typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        firebaseInitialized = true;
        // Production: Remove console.log or use proper logging
        // console.log('Firebase initialized successfully');
    } else {
        console.warn('⚠️ Firebase is not configured. Authentication features are disabled. Please add your Firebase credentials in js/auth.js');
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    // If Firebase is not configured, authentication features won't work
}

// Current user state
let currentUser = null;

// ============================================================================
// Authentication State Observer
// ============================================================================

if (firebaseInitialized) {
    firebase.auth().onAuthStateChanged(function(user) {
        currentUser = user;
        updateAuthUI(user);

        if (user) {
            // User is signed in
            showNotification(`Welcome back, ${user.email}!`);
        }
        // User signed out state is handled by updateAuthUI
    });
}

// ============================================================================
// UI Update Functions
// ============================================================================

function updateAuthUI(user) {
    const accountBtn = document.getElementById('accountBtn');
    const accountBtnText = document.getElementById('accountBtnText');

    if (user) {
        // User is logged in
        accountBtnText.textContent = user.email.split('@')[0]; // Show username part of email
        accountBtn.onclick = showAccountMenu;
    } else {
        // User is logged out
        accountBtnText.textContent = 'My Account';
        accountBtn.onclick = openAuthModal;
    }
}

function showAccountMenu() {
    // Create dropdown menu for logged-in user
    const existingMenu = document.getElementById('accountDropdown');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const menu = document.createElement('div');
    menu.id = 'accountDropdown';
    menu.className = 'account-dropdown';
    menu.innerHTML = `
        <div class="account-menu">
            <div class="account-menu-header">
                <i class="fas fa-user-circle"></i>
                <span>${currentUser.email}</span>
            </div>
            <div class="account-menu-item" onclick="showAccountDetails()">
                <i class="fas fa-user"></i> Account Details
            </div>
            <div class="account-menu-item" onclick="handleLogout()">
                <i class="fas fa-sign-out-alt"></i> Sign Out
            </div>
        </div>
    `;

    document.body.appendChild(menu);

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target.id !== 'accountBtn') {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

function showAccountDetails() {
    // Close dropdown
    const dropdown = document.getElementById('accountDropdown');
    if (dropdown) dropdown.remove();

    // Show account details modal
    showNotification('Account details feature coming soon!');
    // TODO: Implement account details page
}

// ============================================================================
// Authentication Modal Functions
// ============================================================================

function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    showLoginTab();
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    clearAuthForms();
    clearAuthMessage();
}

function showLoginTab() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('passwordResetForm').style.display = 'none';
    document.getElementById('authModalTitle').textContent = 'Sign In';

    // Update tab styling
    const tabs = document.querySelectorAll('.auth-tab');
    tabs[0].classList.add('active');
    tabs[1].classList.remove('active');

    clearAuthMessage();
}

function showSignupTab() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('passwordResetForm').style.display = 'none';
    document.getElementById('authModalTitle').textContent = 'Create Account';

    // Update tab styling
    const tabs = document.querySelectorAll('.auth-tab');
    tabs[0].classList.remove('active');
    tabs[1].classList.add('active');

    clearAuthMessage();
}

function showPasswordReset() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('passwordResetForm').style.display = 'block';
    document.getElementById('authModalTitle').textContent = 'Reset Password';

    clearAuthMessage();
}

function clearAuthForms() {
    // Clear login form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';

    // Clear signup form
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupPasswordConfirm').value = '';

    // Clear reset form
    document.getElementById('resetEmail').value = '';
}

function showAuthMessage(message, type = 'success') {
    const messageDiv = document.getElementById('authMessage');
    messageDiv.textContent = message;
    messageDiv.className = `auth-message ${type}`;
    messageDiv.style.display = 'block';
}

function clearAuthMessage() {
    const messageDiv = document.getElementById('authMessage');
    messageDiv.textContent = '';
    messageDiv.style.display = 'none';
}

// ============================================================================
// Authentication Functions
// ============================================================================

async function handleLogin() {
    if (!firebaseInitialized) {
        showAuthMessage('Authentication is not configured. Please contact support.', 'error');
        return;
    }

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validation
    if (!email || !password) {
        showAuthMessage('Please enter both email and password', 'error');
        return;
    }

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        showAuthMessage('Login successful!', 'success');

        setTimeout(() => {
            closeAuthModal();
        }, 1000);
    } catch (error) {
        // Log error for debugging (remove in production or use proper logging)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Login error:', error);
        }
        let errorMessage = 'Login failed. ';

        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage += 'Invalid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage += 'This account has been disabled.';
                break;
            case 'auth/user-not-found':
                errorMessage += 'No account found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage += 'Incorrect password.';
                break;
            default:
                errorMessage += error.message;
        }

        showAuthMessage(errorMessage, 'error');
    }
}

async function handleSignup() {
    if (!firebaseInitialized) {
        showAuthMessage('Authentication is not configured. Please contact support.', 'error');
        return;
    }

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
        showAuthMessage('Please fill in all fields', 'error');
        return;
    }

    if (password !== passwordConfirm) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);

        // Update user profile with name
        await userCredential.user.updateProfile({
            displayName: name
        });

        showAuthMessage('Account created successfully!', 'success');

        setTimeout(() => {
            closeAuthModal();
        }, 1000);
    } catch (error) {
        // Log error for debugging (remove in production or use proper logging)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Signup error:', error);
        }
        let errorMessage = 'Signup failed. ';

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage += 'An account with this email already exists.';
                break;
            case 'auth/invalid-email':
                errorMessage += 'Invalid email address.';
                break;
            case 'auth/weak-password':
                errorMessage += 'Password is too weak.';
                break;
            default:
                errorMessage += error.message;
        }

        showAuthMessage(errorMessage, 'error');
    }
}

async function handlePasswordReset() {
    if (!firebaseInitialized) {
        showAuthMessage('Authentication is not configured. Please contact support.', 'error');
        return;
    }

    const email = document.getElementById('resetEmail').value.trim();

    if (!email) {
        showAuthMessage('Please enter your email address', 'error');
        return;
    }

    try {
        await firebase.auth().sendPasswordResetEmail(email);
        showAuthMessage('Password reset email sent! Check your inbox.', 'success');

        setTimeout(() => {
            showLoginTab();
        }, 2000);
    } catch (error) {
        // Log error for debugging (remove in production or use proper logging)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Password reset error:', error);
        }
        let errorMessage = 'Failed to send reset email. ';

        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage += 'Invalid email address.';
                break;
            case 'auth/user-not-found':
                errorMessage += 'No account found with this email.';
                break;
            default:
                errorMessage += error.message;
        }

        showAuthMessage(errorMessage, 'error');
    }
}

async function handleLogout() {
    if (!firebaseInitialized) return;

    // Close dropdown
    const dropdown = document.getElementById('accountDropdown');
    if (dropdown) dropdown.remove();

    try {
        await firebase.auth().signOut();
        showNotification('You have been signed out');
    } catch (error) {
        // Log error for debugging (remove in production or use proper logging)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Logout error:', error);
        }
        showNotification('Logout failed: ' + error.message);
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

function getCurrentUser() {
    return currentUser;
}

function isUserLoggedIn() {
    return currentUser !== null;
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    const authModal = document.getElementById('authModal');
    if (e.target === authModal) {
        closeAuthModal();
    }
});

// ============================================================================
// Event Listeners
// ============================================================================

// Handle auth tab clicks
document.addEventListener('click', function(e) {
    if (e.target.dataset.authTab) {
        if (e.target.dataset.authTab === 'login') {
            showLoginTab();
        } else if (e.target.dataset.authTab === 'signup') {
            showSignupTab();
        }
    }
});

// Handle auth button clicks
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const resetBtn = document.getElementById('resetPasswordBtn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');

    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (signupBtn) signupBtn.addEventListener('click', handleSignup);
    if (resetBtn) resetBtn.addEventListener('click', handlePasswordReset);
    if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        showPasswordReset();
    });
    if (backToLoginLink) backToLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginTab();
    });
});

// Handle Enter key in forms
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const resetForm = document.getElementById('passwordResetForm');

        if (loginForm && loginForm.style.display !== 'none' &&
            (e.target.id === 'loginEmail' || e.target.id === 'loginPassword')) {
            handleLogin();
        } else if (signupForm && signupForm.style.display !== 'none' &&
                   e.target.closest('#signupForm')) {
            handleSignup();
        } else if (resetForm && resetForm.style.display !== 'none' &&
                   e.target.id === 'resetEmail') {
            handlePasswordReset();
        }
    }
});
