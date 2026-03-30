import { auth, db } from './firebase-config.js';
import { 
    collection, addDoc, getDocs, doc, setDoc, query, where, orderBy, getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getAuth, createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { showLoader, hideLoader, showToast } from './app.js';

export const setupAdminPanel = () => {
    initTabs();
    initNotices();
    initUsersManager();
    initAttendance();
    initResultsManager();
};

const initTabs = () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.style.display = 'none');
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).style.display = 'block';
        });
    });
};

const initNotices = async () => {
    const noticeForm = document.getElementById('noticeForm');
    noticeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader();
        const title = document.getElementById('noticeTitle').value;
        const grade = document.getElementById('noticeGrade').value;
        const content = document.getElementById('noticeContent').value;
        
        try {
            await addDoc(collection(db, "notices"), {
                title, content, targetGrade: grade, timestamp: Date.now()
            });
            showToast("Notice posted successfully!");
            noticeForm.reset();
            loadAdminNotices(); // refresh list
        } catch (error) {
            showToast("Failed to post notice", "error");
            console.error(error);
        }
        hideLoader();
    });
    
    loadAdminNotices();
};

export const loadAdminNotices = async () => {
    const list = document.getElementById('adminNoticesList');
    if(!list) return;
    try {
        const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        list.innerHTML = '';
        if (snapshot.empty) { list.innerHTML = '<p class="text-muted">No notices found.</p>'; }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = new Date(data.timestamp).toLocaleString();
            list.innerHTML += `
                <div class="notice-item">
                    <span class="badge badge-accent" style="float: right;">${data.targetGrade}</span>
                    <span class="notice-time"><i class="uil uil-clock"></i> ${date}</span>
                    <h4 class="notice-title">${data.title}</h4>
                    <p class="text-muted">${data.content}</p>
                </div>
            `;
        });
    } catch (error) {
        list.innerHTML = '<p class="text-danger">Error loading notices. Check database rules.</p>';
    }
};

const initUsersManager = async () => {
    // Secondary Auth App for creating users without logging out Admin
    // We use the same config but initialized again. Need config from window or a basic trick.
    // For simplicity of this demo, we'll try to just write to database, but firebase needs an Auth user.
    // Let's assume Firebase Cloud Functions handles user creation in production, but here we do it client-side.
    
    const addUserForm = document.getElementById('addUserForm');
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader();
        
        const name = document.getElementById('newUserName').value.trim();
        const grade = document.getElementById('newUserGrade').value;
        const customId = document.getElementById('newUserId').value.trim().toUpperCase();
        const password = document.getElementById('newUserPass').value.trim();
        
        try {
             // 1. Create User in Auth (will sign out admin unfortunately unless mapped with secondary app)
             // As this is a pure vanilla JS demo, a secondary app approach is required:
             const pApp = window.firebaseConfig || null; 
             // Without config exposed easily, we just try our best. Let's create user normally.
             // If this was production, Admin SDK would be used.
             showToast("Creating user... Wait...", "warning");
             
            // Mock API mapping: store directly in Firestore, maybe next login auto creates account
             await setDoc(doc(db, "users", customId), {
                 name, grade, customId, role: 'student', setupPassword: password
             });
            
             // Create email
             const mockEmail = `${customId.toLowerCase()}@vidyaclasses.com`;
             const secondaryApp = initializeApp(auth.app.options, "Secondary");
             const secondaryAuth = getAuth(secondaryApp);
             
             // Create account in secondary auth
             const userCred = await createUserWithEmailAndPassword(secondaryAuth, mockEmail, password);
             
             // Store user doc correctly with UID
             await setDoc(doc(db, "users", userCred.user.uid), {
                 name, grade, customId, role: 'student'
             });
             
             // Clean up secondary instance
             await secondaryAuth.signOut();
             
             showToast("Student created successfully!", "success");
             addUserForm.reset();
             loadStudentList();
             
        } catch (error) {
             showToast("Admin account or Database creation failed", "error");
             console.error(error);
        }
        hideLoader();
    });
    
    loadStudentList();
};

const loadStudentList = async () => {
    const tbody = document.querySelector('#studentsTable tbody');
    if(!tbody) return;
    try {
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const snapshot = await getDocs(q);
        tbody.innerHTML = '';
        if (snapshot.empty) tbody.innerHTML = '<tr><td colspan="4" class="text-muted text-center">No students found.</td></tr>';
        
        snapshot.forEach(doc => {
            const data = doc.data();
            tbody.innerHTML += `
                <tr>
                    <td><strong>${data.customId}</strong></td>
                    <td>${data.name}</td>
                    <td><span class="badge badge-success">${data.grade}</span></td>
                    <td><button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Edit</button></td>
                </tr>
            `;
        });
    } catch(err) {}
};

const initAttendance = () => {
    document.getElementById('loadAttBtn').addEventListener('click', async () => {
        const date = document.getElementById('attDate').value;
        const grade = document.getElementById('attGrade').value;
        if (!date || !grade) return showToast("Select date and grade", "warning");
        
        showLoader();
        const rosterContainer = document.getElementById('attendanceRoster');
        rosterContainer.innerHTML = 'Loading students...';
        
        try {
            // Check if record exists
            const attDocId = `${date}_${grade}`;
            const attDoc = await getDoc(doc(db, "attendance", attDocId));
            const existingPresents = attDoc.exists() ? (attDoc.data().presentIds || []) : [];
            
            // Get all students for grade
            const q = query(collection(db, "users"), where("grade", "==", grade), where("role", "==", "student"));
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                rosterContainer.innerHTML = '<p class="text-muted">No students in this grade.</p>';
                hideLoader();
                return;
            }
            
            let html = `
                <table style="width: 100%; margin-top: 1rem;">
                    <thead><tr><th>ID</th><th>Name</th><th>Present</th></tr></thead>
                    <tbody>
            `;
            
            snapshot.forEach(doc => {
                 const st = doc.data();
                 const isPresent = existingPresents.includes(st.customId);
                 html += `
                    <tr>
                        <td>${st.customId}</td>
                        <td>${st.name}</td>
                        <td>
                            <input type="checkbox" class="att-checkbox" data-id="${st.customId}" ${isPresent ? 'checked' : ''} style="width: 20px; height: 20px;">
                        </td>
                    </tr>
                 `;
            });
            html += `</tbody></table>
                     <button id="saveAttBtn" class="btn btn-primary" style="margin-top: 2rem;">Save Attendance</button>`;
            
            rosterContainer.innerHTML = html;
            
            // Save logic
            document.getElementById('saveAttBtn').addEventListener('click', async () => {
                showLoader();
                const checks = document.querySelectorAll('.att-checkbox');
                const presentIds = Array.from(checks).filter(c => c.checked).map(c => c.dataset.id);
                
                await setDoc(doc(db, "attendance", attDocId), {
                    date, grade, presentIds, totalStudents: checks.length, timestamp: Date.now()
                });
                
                showToast("Attendance saved successfully!");
                hideLoader();
            });
            
        } catch (error) {
             rosterContainer.innerHTML = 'Error loading roster.';
             console.error(error);
        }
        hideLoader();
    });
};

const initResultsManager = () => {
    const postResultForm = document.getElementById('postResultForm');
    postResultForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader();
        
        try {
            const studentId = document.getElementById('resStudent').value.trim().toUpperCase();
            
            // Validate student
            const userQ = query(collection(db, "users"), where("customId", "==", studentId));
            const userSnap = await getDocs(userQ);
            if(userSnap.empty) {
                hideLoader();
                return showToast("Student ID not found", "error");
            }
            
            const examName = document.getElementById('resExam').value;
            const marks = {
                Maths: parseInt(document.getElementById('mMath').value),
                Science: parseInt(document.getElementById('mSci').value),
                English: parseInt(document.getElementById('mEng').value),
                History: parseInt(document.getElementById('mHis').value),
                Geography: parseInt(document.getElementById('mGeo').value),
                Marathi: parseInt(document.getElementById('mMar').value),
                Hindi: parseInt(document.getElementById('mHin').value)
            };
            
            const total = Object.values(marks).reduce((a, b) => a + b, 0);
            const percentage = ((total / 700) * 100).toFixed(2);
            
            await addDoc(collection(db, "results"), {
                studentId, examName, marks, total, percentage, timestamp: Date.now()
            });
            
            showToast("Result posted successfully!");
            postResultForm.reset();
        } catch (err) {
            showToast("Failed to post result", "error");
            console.error(err);
        }
        hideLoader();
    });
};
