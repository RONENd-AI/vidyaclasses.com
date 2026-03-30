import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { state, navigate, showLoader, hideLoader, showToast } from './app.js';

// Convert custom ID to dummy email. e.g. VP1234 -> VP1234@vidyaclasses.com
const getEmailFromId = (customId) => `${customId.toLowerCase()}@vidyaclasses.com`;

export const initAuth = () => {
    return new Promise((resolve) => {
        if (!auth) {
            resolve(false);
            return;
        }

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch User Role and Metadata from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        state.user = { uid: user.uid, ...userDoc.data() };
                        hideLoader();
                        if (state.user.role === 'admin') navigate('/admin');
                        else navigate('/student');
                    } else {
                        // User exists in auth but not in Firestore - edge case
                        showToast("User profile not found. Contact Admin.", "error");
                        await signOut(auth);
                        state.user = null;
                        navigate('/login');
                        hideLoader();
                    }
                } catch (error) {
                    showToast("Error loading profile", "error");
                    hideLoader();
                }
            } else {
                state.user = null;
                navigate('/login');
                hideLoader();
                setTimeout(() => attachLoginListener(), 100);
            }
            resolve(true);
        });
    });
};

function attachLoginListener() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customId = document.getElementById('customId').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!customId || !password) {
            showToast("Please fill all fields", "error");
            return;
        }

        showLoader();
        try {
            // First time admin override check (Useful for initial setup if no database exists)
            // If the database is missing, we create a default admin
            if (customId === 'admin' && password === 'Admin@123') {
                await attemptInitialAdminSetup();
            }

            const email = getEmailFromId(customId);
            await signInWithEmailAndPassword(auth, email, password);
            showToast("Welcome back!", "success");
            // onAuthStateChanged will handle the routing
        } catch (error) {
            hideLoader();
            showToast("Invalid Credentials or Not Setup", "error");
            console.error("Login mapping error:", error.message);
        }
    });
}

export const logoutUser = async () => {
    showLoader();
    try {
        await signOut(auth);
        state.user = null;
        showToast("Logged out successfully");
    } catch (error) {
        showToast("Error logging out", "error");
    }
};

// Developer feature: create the first admin account automatically if signing in as 'admin'
async function attemptInitialAdminSetup() {
    const adminEmail = getEmailFromId('admin');
    try {
        await signInWithEmailAndPassword(auth, adminEmail, 'Admin@123');
        return; // already exists
    } catch (e) {
        if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
            try {
                // Auto create the first admin
                const userCred = await createUserWithEmailAndPassword(auth, adminEmail, 'Admin@123');
                await setDoc(doc(db, "users", userCred.user.uid), {
                    customId: 'admin',
                    role: 'admin',
                    name: 'Principal',
                    grade: 'All'
                });
                showToast("System initial admin created!", "success");
            } catch (err) {
                console.log("Admin setup error:", err);
            }
        }
    }
}
