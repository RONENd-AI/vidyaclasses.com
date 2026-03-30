import { initAuth } from './auth.js';
import { loadLoginView, loadAdminView, loadStudentView } from './views.js';

// Application State
export const state = {
    user: null, // { uid, role, customId, name, grade }
    currentPath: ''
};

// Global UI Helpers
export const showLoader = () => document.getElementById('loader').classList.remove('hidden');
export const hideLoader = () => document.getElementById('loader').classList.add('hidden');

export const showToast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    toast.innerHTML = `<i class="uil uil-${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

// Router
export const navigate = (path) => {
    state.currentPath = path;
    const appDiv = document.getElementById('app');
    const navbar = document.getElementById('navbar');
    
    if (path === '/login') {
        navbar.style.display = 'none';
        appDiv.innerHTML = loadLoginView();
    } else {
        navbar.style.display = 'block';
        if (state.user) {
            document.getElementById('navUserName').textContent = state.user.name || state.user.customId;
        }
        
        if (path === '/admin' && state.user?.role === 'admin') {
            appDiv.innerHTML = loadAdminView();
            initAdminLogic();
        } else if (path === '/student' && state.user?.role === 'student') {
            appDiv.innerHTML = loadStudentView();
            initStudentLogic();
        } else {
            // Unauthorized or mismatched role
            navigate('/login');
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    showLoader();
    
    // Check if Firebase config is missing
    const hasConfig = checkFirebaseConfig();
    if (!hasConfig) {
        hideLoader();
        document.getElementById('app').innerHTML = `
            <div class="login-container">
                <div class="card login-card" style="max-width: 600px;">
                    <div class="login-header">
                        <h2>⚠️ Setup Required</h2>
                        <p style="margin-top: 1rem;">Please add your Firebase Configuration to <code>js/firebase-config.js</code> to use the database.</p>
                        <p style="margin-top: 0.5rem; color: var(--text-muted); font-size: 0.9rem;">The app requires a free Firebase Firestore & Auth connection.</p>
                    </div>
                </div>
            </div>`;
        return;
    }

    // Initialize Auth listener
    await initAuth();
    
    // Setup Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        import('./auth.js').then(module => module.logoutUser());
    });
});

function checkFirebaseConfig() {
    // This is a dummy check to see if we wrote actual config.
    // In our firebase-config.js it will have placeholder "YOUR_API_KEY".
    return true; // We will handle errors in firebase-config instead.
}

// Dummy initializers for now, will map to actual modules
async function initAdminLogic() {
    const { setupAdminPanel } = await import('./admin.js');
    setupAdminPanel();
}
async function initStudentLogic() {
    const { setupStudentPanel } = await import('./student.js');
    setupStudentPanel();
}
