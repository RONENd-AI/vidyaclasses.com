window.state = {
    user: null, currentPath: ''
};

window.showLoader = () => document.getElementById('loader').classList.remove('hidden');
window.hideLoader = () => document.getElementById('loader').classList.add('hidden');

window.showToast = (message, type = 'success') => {
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

window.navigate = (path) => {
    window.state.currentPath = path;
    const appDiv = document.getElementById('app');
    const navbar = document.getElementById('navbar');
    
    if (path === '/login') {
        navbar.style.display = 'none';
        appDiv.innerHTML = window.loadLoginView();
        setTimeout(window.attachLoginListener, 100);
    } else {
        navbar.style.display = 'block';
        if (window.state.user) {
            document.getElementById('navUserName').textContent = window.state.user.name || window.state.user.customId;
        }
        
        if (path === '/admin' && (window.state.user?.role === 'admin' || window.state.user?.role === 'teacher')) {
            appDiv.innerHTML = window.loadAdminView();
            window.setupAdminPanel();
        } else if (path === '/student' && window.state.user?.role === 'student') {
            appDiv.innerHTML = window.loadStudentView();
            window.setupStudentPanel();
        } else {
            window.navigate('/login');
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    window.showLoader();
    if (typeof firebase === 'undefined') {
        window.hideLoader();
        document.getElementById('app').innerHTML = `<h2 style="color:white;text-align:center;margin-top:20%">Firebase failed to load. Check internet.</h2>`;
        return;
    }
    await window.initAuth();
});
