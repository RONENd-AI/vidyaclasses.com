window.setupAdminPanel = () => {
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

const initNotices = () => {
    const noticeForm = document.getElementById('noticeForm');
    noticeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        window.showLoader();
        try {
            await window.db.collection("notices").add({
                title: document.getElementById('noticeTitle').value,
                content: document.getElementById('noticeContent').value,
                targetGrade: document.getElementById('noticeGrade').value,
                timestamp: Date.now()
            });
            window.showToast("Notice posted successfully!");
            noticeForm.reset();
            window.loadAdminNotices();
        } catch (error) { window.showToast("Failed to post notice", "error"); }
        window.hideLoader();
    });
    window.loadAdminNotices();
};

window.loadAdminNotices = async () => {
    const list = document.getElementById('adminNoticesList');
    if(!list) return;
    try {
        const snapshot = await window.db.collection("notices").orderBy("timestamp", "desc").get();
        list.innerHTML = '';
        if (snapshot.empty) list.innerHTML = '<p class="text-muted">No notices found.</p>';
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
    } catch(e) {}
};

const initUsersManager = () => {
    const addUserForm = document.getElementById('addUserForm');
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        window.showLoader();
        const name = document.getElementById('newUserName').value.trim();
        const grade = document.getElementById('newUserGrade').value;
        const customId = document.getElementById('newUserId').value.trim().toUpperCase();
        const password = document.getElementById('newUserPass').value.trim();
        try {
             window.showToast("Creating user...", "warning");
             const mockEmail = `${customId.toLowerCase()}@vidyaclasses.com`;
             const secondaryApp = firebase.initializeApp(window.auth.app.options, "Secondary");
             const userCred = await secondaryApp.auth().createUserWithEmailAndPassword(mockEmail, password);
             await window.db.collection("users").doc(userCred.user.uid).set({
                 name, grade, customId, role: 'student'
             });
             await secondaryApp.delete();
             window.showToast("Student created successfully!", "success");
             addUserForm.reset();
             loadStudentList();
        } catch (error) { window.showToast("Failed to create student", "error"); }
        window.hideLoader();
    });
    loadStudentList();
};

const loadStudentList = async () => {
    const tbody = document.querySelector('#studentsTable tbody');
    if(!tbody) return;
    try {
        const snapshot = await window.db.collection("users").where("role", "==", "student").get();
        tbody.innerHTML = '';
        if (snapshot.empty) tbody.innerHTML = '<tr><td colspan="4" class="text-muted text-center">No students found.</td></tr>';
        snapshot.forEach(doc => {
            const data = doc.data();
            tbody.innerHTML += `<tr><td><strong>${data.customId}</strong></td><td>${data.name}</td><td><span class="badge badge-success">${data.grade}</span></td></tr>`;
        });
    } catch(err) {}
};

const initAttendance = () => {
    document.getElementById('loadAttBtn').addEventListener('click', async () => {
        const date = document.getElementById('attDate').value;
        const grade = document.getElementById('attGrade').value;
        if (!date || !grade) return window.showToast("Select date and grade", "warning");
        
        window.showLoader();
        const rosterContainer = document.getElementById('attendanceRoster');
        rosterContainer.innerHTML = 'Loading students...';
        try {
            const attDocId = `${date}_${grade}`;
            const attDoc = await window.db.collection("attendance").doc(attDocId).get();
            const existingPresents = attDoc.exists ? (attDoc.data().presentIds || []) : [];
            
            const snapshot = await window.db.collection("users").where("grade", "==", grade).where("role", "==", "student").get();
            if (snapshot.empty) { rosterContainer.innerHTML = '<p class="text-muted">No students in grade.</p>'; window.hideLoader(); return; }
            
            let html = `<table style="width: 100%; margin-top: 1rem;"><thead><tr><th>ID</th><th>Name</th><th>Present</th></tr></thead><tbody>`;
            snapshot.forEach(doc => {
                 const st = doc.data();
                 const isPresent = existingPresents.includes(st.customId);
                 html += `<tr><td>${st.customId}</td><td>${st.name}</td><td><input type="checkbox" class="att-checkbox" data-id="${st.customId}" ${isPresent?'checked':''} style="width: 20px; height: 20px;"></td></tr>`;
            });
            html += `</tbody></table><button id="saveAttBtn" class="btn btn-primary" style="margin-top: 2rem;">Save Attendance</button>`;
            
            rosterContainer.innerHTML = html;
            document.getElementById('saveAttBtn').addEventListener('click', async () => {
                window.showLoader();
                const checks = document.querySelectorAll('.att-checkbox');
                const presentIds = Array.from(checks).filter(c => c.checked).map(c => c.dataset.id);
                await window.db.collection("attendance").doc(attDocId).set({ date, grade, presentIds, totalStudents: checks.length, timestamp: Date.now() });
                window.showToast("Attendance saved!");
                window.hideLoader();
            });
        } catch (error) { rosterContainer.innerHTML = 'Error loading roster.'; }
        window.hideLoader();
    });
};

const initResultsManager = () => {
    const postResultForm = document.getElementById('postResultForm');
    postResultForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        window.showLoader();
        try {
            const studentId = document.getElementById('resStudent').value.trim().toUpperCase();
            const userSnap = await window.db.collection("users").where("customId", "==", studentId).get();
            if(userSnap.empty) { window.hideLoader(); return window.showToast("Student not found", "error"); }
            
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
            await window.db.collection("results").add({ studentId, examName, marks, total, percentage, timestamp: Date.now() });
            window.showToast("Result posted!");
            postResultForm.reset();
        } catch (err) { window.showToast("Failed to post result", "error"); }
        window.hideLoader();
    });
};
