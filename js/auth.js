// ============================================================================
// Firebase Authentication for laon2link
// ============================================================================

// Use shared notification function from main.js (via window.laonlink namespace)
function showNotification(message) {
    if (window.laonlink && typeof window.laonlink.showNotification === 'function') {
        window.laonlink.showNotification(message);
        return;
    }

    // Minimal fallback if main.js hasn't loaded yet
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => { notification.style.display = 'none'; }, 3000);
    }
}

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCSLRJbEe_fv2snss1NrDsn6_z2luhkCcM",
    authDomain: "laon2link.firebaseapp.com",
    projectId: "laon2link",
    storageBucket: "laon2link.firebasestorage.app",
    messagingSenderId: "478733081023",
    appId: "1:478733081023:web:d3ca6d7dfa49e79ce2a90a",
    measurementId: "G-2QZBXWWVXY"
};

// Initialize Firebase
let firebaseInitialized = false;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
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
            console.log('User signed in:', user.email);
            // User is signed in
            showNotification(`Welcome back, ${user.email}!`);
        } else {
            console.log('User signed out');
            // User is signed out
        }
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

// Account menu with AbortController for better memory management
let accountMenuAbortController = null;

function showAccountMenu() {
    // Create dropdown menu for logged-in user
    const existingMenu = document.getElementById('accountDropdown');
    if (existingMenu) {
        existingMenu.remove();
        // Abort existing event listeners
        if (accountMenuAbortController) {
            accountMenuAbortController.abort();
            accountMenuAbortController = null;
        }
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
            <div class="account-menu-item" data-action="account-details">
                <i class="fas fa-user"></i> Account Details
            </div>
            <div class="account-menu-item" data-action="logout">
                <i class="fas fa-sign-out-alt"></i> Sign Out
            </div>
        </div>
    `;

    document.body.appendChild(menu);

    // Position the dropdown relative to the account button
    const accountBtn = document.getElementById('accountBtn');
    const rect = accountBtn.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 10) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.style.left = 'auto';

    // Create AbortController for cleanup
    accountMenuAbortController = new AbortController();
    const signal = accountMenuAbortController.signal;

    // Add event delegation to menu
    menu.addEventListener('click', function(e) {
        const item = e.target.closest('[data-action]');
        if (!item) return;

        const action = item.dataset.action;
        if (action === 'account-details') {
            showAccountDetails();
        } else if (action === 'logout') {
            handleLogout();
        }
    }, { signal });

    // Close menu when clicking outside (with AbortController cleanup)
    setTimeout(() => {
        document.addEventListener('click', function(e) {
            if (!menu.contains(e.target) && e.target.id !== 'accountBtn' && !e.target.closest('#accountBtn')) {
                menu.remove();
                if (accountMenuAbortController) {
                    accountMenuAbortController.abort();
                    accountMenuAbortController = null;
                }
            }
        }, { signal });
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
        console.log('Login successful:', userCredential.user.email);
        showAuthMessage('Login successful!', 'success');

        setTimeout(() => {
            closeAuthModal();
        }, 1000);
    } catch (error) {
        console.error('Login error:', error);
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
        console.log('Signup successful:', userCredential.user.email);

        // Update user profile with name
        await userCredential.user.updateProfile({
            displayName: name
        });

        showAuthMessage('Account created successfully!', 'success');

        setTimeout(() => {
            closeAuthModal();
        }, 1000);
    } catch (error) {
        console.error('Signup error:', error);
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
        console.error('Password reset error:', error);
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
        console.log('Logout successful');
        showNotification('You have been signed out');
    } catch (error) {
        console.error('Logout error:', error);
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

// Setup auth modal event delegation
function setupAuthModalDelegation() {
    const authModal = document.getElementById('authModal');
    if (!authModal) return;

    // Remove old handlers if they exist
    if (authModal._clickHandler) {
        authModal.removeEventListener('click', authModal._clickHandler);
    }
    if (authModal._keyHandler) {
        authModal.removeEventListener('keypress', authModal._keyHandler);
    }

    // Click handler for buttons and links
    const clickHandler = function(e) {
        const target = e.target.closest('[data-auth-action]');
        if (!target) return;

        e.preventDefault();
        const action = target.dataset.authAction;

        switch (action) {
            case 'show-login':
                showLoginTab();
                break;
            case 'show-signup':
                showSignupTab();
                break;
            case 'show-reset':
                showPasswordReset();
                break;
            case 'login':
                handleLogin();
                break;
            case 'signup':
                handleSignup();
                break;
            case 'reset-password':
                handlePasswordReset();
                break;
        }
    };

    // Keypress handler for Enter key
    const keyHandler = function(e) {
        if (e.key !== 'Enter') return;

        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const resetForm = document.getElementById('passwordResetForm');

        if (loginForm && loginForm.style.display !== 'none' &&
            (e.target.id === 'loginEmail' || e.target.id === 'loginPassword')) {
            e.preventDefault();
            handleLogin();
        } else if (signupForm && signupForm.style.display !== 'none' &&
                   e.target.closest('#signupForm')) {
            e.preventDefault();
            handleSignup();
        } else if (resetForm && resetForm.style.display !== 'none' &&
                   e.target.id === 'resetEmail') {
            e.preventDefault();
            handlePasswordReset();
        }
    };

    authModal.addEventListener('click', clickHandler);
    authModal.addEventListener('keypress', keyHandler);

    authModal._clickHandler = clickHandler;
    authModal._keyHandler = keyHandler;
}

// Initialize auth modal delegation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAuthModalDelegation);
} else {
    setupAuthModalDelegation();
}

console.log('Auth.js loaded successfully');
