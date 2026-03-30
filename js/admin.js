window.setupAdminPanel = () => {
    initTabs();
    initNotices();
    initUsersManager();
    initPromotionTool();
    initAttendance();
    initResultsManager();
    initAdminChats();
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

window.deleteNotice = async (docId) => {
    if (confirm("Permanently delete this notice from everyone's dashboard?")) {
        window.showLoader();
        try {
            await window.db.collection("notices").doc(docId).delete();
            window.showToast("Notice deleted successfully", "success");
            window.loadAdminNotices();
        } catch (e) {
            window.showToast("Failed to delete notice", "error");
        }
        window.hideLoader();
    }
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
                <div class="notice-item" style="position: relative;">
                    <button class="btn btn-sm btn-danger" style="position: absolute; right: 10px; bottom: 10px; padding: 0.3rem 0.6rem;" onclick="window.deleteNotice('${doc.id}')"><i class="uil uil-trash-alt"></i></button>
                    <span class="badge badge-accent" style="float: right; margin-right: 40px;">${data.targetGrade}</span>
                    <span class="notice-time"><i class="uil uil-clock"></i> ${date}</span>
                    <h4 class="notice-title" style="margin-right: 80px;">${data.title}</h4>
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
        const phone = document.getElementById('newUserPhone').value.trim();
        const address = document.getElementById('newUserAddress').value.trim();
        const batch = document.getElementById('newUserBatch').value.trim();
        
        try {
             window.showToast("Creating user...", "warning");
             const mockEmail = `${customId.toLowerCase()}@vidyaclasses.com`;
             const secondaryApp = firebase.initializeApp(window.auth.app.options, "Secondary");
             const userCred = await secondaryApp.auth().createUserWithEmailAndPassword(mockEmail, password);
             
             await window.db.collection("users").doc(userCred.user.uid).set({
                 name, 
                 grade, 
                 batch,
                 customId, 
                 role: 'student',
                 phone,
                 address
             });
             
             await secondaryApp.delete();
             window.showToast("Student created successfully!", "success");
             addUserForm.reset();
             window.loadStudentList();
        } catch (error) { 
             window.showToast("Failed to create student: " + error.message, "error"); 
             console.error(error);
        }
        window.hideLoader();
    });
    
    // Add logic for processing the saved edit changes from the modal popup
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            window.showLoader();
            try {
                const docId = document.getElementById('editDocId').value;
                await window.db.collection('users').doc(docId).update({
                    name: document.getElementById('editUserName').value.trim(),
                    grade: document.getElementById('editUserGrade').value,
                    batch: document.getElementById('editUserBatch').value.trim(),
                    phone: document.getElementById('editUserPhone').value.trim(),
                    address: document.getElementById('editUserAddress').value.trim()
                });
                window.showToast("Student profile successfully updated!", "success");
                window.closeEditModal();
                window.loadStudentList();
            } catch (err) {
                window.showToast("Failed to update profile", "error");
                console.error(err);
            }
            window.hideLoader();
        });
    }

    window.loadStudentList();
};

const initPromotionTool = () => {
    const promoForm = document.getElementById('promoteForm');
    promoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const targetBatch = document.getElementById('promoBatch').value.trim();
        const currentGrade = document.getElementById('promoCurrentGrade').value;
        const newGrade = document.getElementById('promoNewGrade').value;

        if (confirm(`MASS PROMOTION:\nAre you sure you want to promote ALL students in Batch [${targetBatch}] currently in [${currentGrade}] to [${newGrade}]?`)) {
            window.showLoader();
            try {
                // Fetch all students matching Batch and current Grade
                const studentsRef = window.db.collection('users');
                const snapshot = await studentsRef
                    .where('role', '==', 'student')
                    .where('batch', '==', targetBatch)
                    .where('grade', '==', currentGrade)
                    .get();

                if (snapshot.empty) {
                    window.showToast("No students found matching that exact Batch and Grade.", "warning");
                    window.hideLoader();
                    return;
                }

                // Execute mass update using batch writes
                const batchWrite = window.db.batch();
                snapshot.forEach(doc => {
                    batchWrite.update(doc.ref, { grade: newGrade });
                });

                await batchWrite.commit();
                window.showToast(`Successfully moved ${snapshot.size} students to ${newGrade}!`, "success");
                window.loadStudentList();
            } catch (err) {
                window.showToast("Promotion Failed", "error");
                console.error(err);
            }
            window.hideLoader();
        }
    });
};

window.openEditModal = (docId, name, grade, batch, phone, address) => {
    document.getElementById('editDocId').value = docId;
    document.getElementById('editUserName').value = name;
    document.getElementById('editUserGrade').value = grade;
    document.getElementById('editUserBatch').value = batch || '';
    document.getElementById('editUserPhone').value = phone || '';
    document.getElementById('editUserAddress').value = address || '';
    document.getElementById('editUserModal').style.display = 'flex';
};

window.closeEditModal = () => {
    document.getElementById('editUserModal').style.display = 'none';
};

window.deleteStudent = async (docId, customId) => {
    if (confirm(`Are you extremely sure you want to permanently remove the student ID: ${customId} from the database?`)) {
        window.showLoader();
        try {
            await window.db.collection("users").doc(docId).delete();
            window.showToast(`Student ${customId} removed!`, "success");
            window.loadStudentList();
        } catch (e) {
            window.showToast("Failed to delete student directly", "error");
            alert("Firebase Deletion Error: " + e.message);
        }
        window.hideLoader();
    }
};

window.loadStudentList = async () => {
    const tbody = document.querySelector('#studentsTable tbody');
    if(!tbody) return;
    try {
        const snapshot = await window.db.collection("users").where("role", "==", "student").get();
        tbody.innerHTML = '';
        if (snapshot.empty) tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center">No students found.</td></tr>';
        snapshot.forEach(doc => {
            const data = doc.data();
            tbody.innerHTML += `
                <tr>
                    <td><strong>${data.customId}</strong></td>
                    <td>${data.name}</td>
                    <td><span class="badge badge-success">${data.grade}</span> <span class="badge badge-accent">${data.batch || 'No Batch'}</span></td>
                    <td style="font-size: 0.9rem;">${data.phone || 'N/A'}</td>
                    <td style="font-size: 0.9rem; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${data.address || ''}">
                        ${data.address || 'N/A'}
                    </td>
                    <td style="display: flex; gap: 0.25rem;">
                        <button class="btn btn-info btn-sm" onclick="window.openEditModal('${doc.id}', '${data.name.replace(/'/g, "\\'")}', '${data.grade}', '${data.batch || ''}', '${data.phone || ''}', '${data.address.replace(/'/g, "\\'") || ''}')" title="Edit Profile"><i class="uil uil-edit"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="window.deleteStudent('${doc.id}', '${data.customId}')"><i class="uil uil-trash-alt"></i></button>
                    </td>
                </tr>
            `;
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

// --- Real-Time Chat System (Admin Side) ---
let currentAdminChatUnsubscribe = null;
let activeChatroomId = null;

const initAdminChats = () => {
    const loadBtn = document.getElementById('loadAdminChatBtn');
    const sendBtn = document.getElementById('adminChatSendBtn');
    const inputField = document.getElementById('adminChatInput');
    const chatForm = document.getElementById('adminChatForm');
    
    loadBtn.addEventListener('click', () => {
        const targetGrade = document.getElementById('adminChatGrade').value;
        const targetBatch = document.getElementById('adminChatBatch').value.trim();
        
        if (!targetBatch) return window.showToast("Enter a Batch first", "warning");
        
        // Define universal chatroom ID string
        activeChatroomId = `${targetGrade}_${targetBatch}`;
        
        // Enable inputs
        sendBtn.disabled = false;
        inputField.disabled = false;
        inputField.focus();
        
        // Unsubscribe from previous if active
        if (currentAdminChatUnsubscribe) { currentAdminChatUnsubscribe(); }
        
        const messagesContainer = document.getElementById('adminChatMessages');
        messagesContainer.innerHTML = `<p class="text-muted" style="text-align: center;">Connected to ${targetGrade} Class [${targetBatch}]</p>`;
        
        // Firebase specific query listener for live updates
        currentAdminChatUnsubscribe = window.db.collection("chats")
            .where("classId", "==", activeChatroomId)
            .orderBy("timestamp", "asc")
            .onSnapshot((snapshot) => {
                // Determine if we need to auto-scroll to bottom
                const isBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 50;
                
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const msg = change.doc.data();
                        const isSelf = msg.senderId === 'admin';
                        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        messagesContainer.innerHTML += `
                            <div class="chat-message ${isSelf ? 'self' : 'other'}">
                                <span class="chat-sender">${isSelf ? 'Principal' : msg.senderName}</span>
                                <div class="chat-bubble ${isSelf ? 'admin-bubble' : ''}">${msg.text}</div>
                                <span class="chat-time">${time}</span>
                            </div>
                        `;
                    }
                });
                // Autoscroll to bottom if they were already at the bottom when msg arrives
                if (isBottom || snapshot.docChanges().length > 0) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            });
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = inputField.value.trim();
        if (!text || !activeChatroomId) return;
        
        inputField.value = '';
        inputField.focus();
        
        try {
            await window.db.collection("chats").add({
                classId: activeChatroomId,
                senderId: 'admin',
                senderName: 'Principal',
                text: text,
                timestamp: Date.now()
            });
        } catch (e) {
            window.showToast("Message failed to send", "error");
            console.error(e);
        }
    });
};
