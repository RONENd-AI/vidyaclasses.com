const getEmailFromId = (customId) => `${customId.toLowerCase()}@vidyaclasses.com`;

window.initAuth = () => {
    return new Promise((resolve) => {
        if (!window.auth) { resolve(false); return; }

        window.auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const docRec = await window.db.collection('users').doc(user.uid).get();
                    if (docRec.exists) {
                        window.state.user = { uid: user.uid, ...docRec.data() };
                        window.hideLoader();
                        if (window.state.user.role === 'admin' || window.state.user.role === 'teacher') window.navigate('/admin');
                        else window.navigate('/student');
                    } else {
                        // Recovery: if Admin account was created in Auth but blocked by Firestore Rules earlier, we instantly heal it!
                        if (user.email === 'admin@vidyaclasses.com') {
                            await window.db.collection('users').doc(user.uid).set({
                                customId: 'admin', role: 'admin', name: 'Principal', grade: 'All'
                            });
                            window.state.user = { uid: user.uid, customId: 'admin', role: 'admin', name: 'Principal', grade: 'All' };
                            window.hideLoader();
                            window.navigate('/admin');
                        } else {
                            alert("Profile completely missing from Database! Have your admin recreate your user ID.");
                            await window.auth.signOut();
                            window.state.user = null;
                            window.navigate('/login');
                            window.hideLoader();
                        }
                    }
                } catch (error) {
                    alert("Firestore Error: " + error.code + " -> " + error.message);
                    window.hideLoader();
                }
            } else {
                window.state.user = null;
                window.navigate('/login');
                window.hideLoader();
            }
            resolve(true);
        });
    });
};

window.attachLoginListener = () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    const tabStudent = document.getElementById('tabStudentLogin');
    const tabStaff = document.getElementById('tabTeacherLogin');
    const loginTitle = document.getElementById('loginTitle');
    const loginDesc = document.getElementById('loginDesc');
    const idLabel = document.getElementById('idLabel');
    const customIdInput = document.getElementById('customId');

    if (tabStudent && tabStaff) {
        tabStudent.addEventListener('click', () => {
            tabStudent.style.borderBottomColor = 'var(--accent-primary)';
            tabStudent.style.background = 'rgba(99, 102, 241, 0.1)';
            tabStudent.style.color = 'var(--text-primary)';
            tabStaff.style.borderBottomColor = 'transparent';
            tabStaff.style.background = 'transparent';
            tabStaff.style.color = 'var(--text-muted)';
            loginTitle.textContent = 'Student Portal Login';
            loginDesc.textContent = 'Enter your custom Vidya Classes Student ID.';
            idLabel.textContent = 'Student ID (e.g. VP1234)';
            customIdInput.placeholder = 'VP1234';
        });

        tabStaff.addEventListener('click', () => {
            tabStaff.style.borderBottomColor = 'var(--accent-primary)';
            tabStaff.style.background = 'rgba(99, 102, 241, 0.1)';
            tabStaff.style.color = 'var(--text-primary)';
            tabStudent.style.borderBottomColor = 'transparent';
            tabStudent.style.background = 'transparent';
            tabStudent.style.color = 'var(--text-muted)';
            loginTitle.textContent = 'Staff Portal Login';
            loginDesc.textContent = 'Enter your Admin or Teacher ID.';
            idLabel.textContent = 'Staff ID (e.g. admin or TCH01)';
            customIdInput.placeholder = 'admin / TCH01';
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customId = document.getElementById('customId').value.trim();
        const password = document.getElementById('password').value.trim();
        if (!customId || !password) return window.showToast("Please fill all fields", "error");

        window.showLoader();
        try {
            if (customId.toLowerCase() === 'admin' && password === 'Admin@123') await attemptInitialAdminSetup();
            const email = getEmailFromId(customId);
            await window.auth.signInWithEmailAndPassword(email, password);
            window.showToast("Welcome back!", "success");
        } catch (error) {
            window.hideLoader();
            alert("Firebase Login Error: " + error.message + " (Check if Email/Password is strictly enabled in Firebase Console!)");
        }
    });
};

window.logoutUser = async () => {
    window.showLoader();
    try {
        await window.auth.signOut();
        window.showToast("Logged out successfully");
    } catch(e) {}
};

async function attemptInitialAdminSetup() {
    const adminEmail = getEmailFromId('admin');
    try {
        await window.auth.signInWithEmailAndPassword(adminEmail, 'Admin@123');
        return; 
    } catch (e) {
        if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
            try {
                const userCred = await window.auth.createUserWithEmailAndPassword(adminEmail, 'Admin@123');
                await window.db.collection('users').doc(userCred.user.uid).set({
                    customId: 'admin', role: 'admin', name: 'Principal', grade: 'All'
                });
                window.showToast("System initial admin created!", "success");
            } catch (err) {
                 alert("Setup Creation Error: " + err.message + " (This often means Email/Password was NOT turned on inside the Firebase Auth settings!)");
                 throw err;
            }
        } else {
             throw e;
        }
    }
}
