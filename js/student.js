window.setupStudentPanel = () => {
    document.getElementById('studentNameTitle').textContent = window.state.user.name;
    document.getElementById('studentGradeTitle').textContent = `${window.state.user.grade} (Batch ${window.state.user.batch || 'N/A'})`;
    loadStudentNotices();
    loadStudentAttendance();
    loadStudentResults();
    initStudentChat();
};

const loadStudentAttendance = async () => {
    const elOverall = document.getElementById('studentAttPercent');
    const elMonthly = document.getElementById('studentMonthlyAttPercent');
    const calGrid = document.getElementById('attendanceCalendarGrid');

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
    document.getElementById('calendarMonthTitle').textContent = monthName;

    try {
        const snapshot = await window.db.collection("attendance").where("grade", "==", window.state.user.grade).get();
        let totalDays = 0, presentDays = 0;
        let monthlyTotal = 0, monthlyPresent = 0;

        const attendanceMap = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const dateStr = data.date;
            if (!dateStr) return;

            const isPresent = data.presentIds && data.presentIds.includes(window.state.user.customId);

            totalDays++;
            if (isPresent) presentDays++;

            const [y, m, d] = dateStr.split('-');
            const recYear = parseInt(y, 10);
            const recMonth = parseInt(m, 10) - 1;
            const recDay = parseInt(d, 10);

            if (recYear === currentYear && recMonth === currentMonth) {
                monthlyTotal++;
                if (isPresent) monthlyPresent++;
                attendanceMap[recDay] = isPresent;
            }
        });

        if (totalDays === 0) elOverall.textContent = 'N/A';
        else {
            const perc = Math.round((presentDays / totalDays) * 100);
            elOverall.textContent = `${perc}%`;
        }

        if (monthlyTotal === 0) elMonthly.textContent = 'N/A';
        else {
            const mPerc = Math.round((monthlyPresent / monthlyTotal) * 100);
            elMonthly.textContent = `${mPerc}%`;
            if (mPerc < 75) elMonthly.style.color = 'var(--danger)';
            else if (mPerc >= 90) elMonthly.style.color = 'var(--success)';
        }

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

        let gridHtml = '';
        for (let i = 0; i < firstDayOfWeek; i++) {
            gridHtml += `<div class="calendar-day empty"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            let extraClass = '';
            if (attendanceMap.hasOwnProperty(day)) {
                extraClass = attendanceMap[day] ? 'present' : 'absent';
            }
            gridHtml += `<div class="calendar-day ${extraClass}">${day}</div>`;
        }
        calGrid.innerHTML = gridHtml;

    } catch (e) {
        elOverall.textContent = 'Err';
        elMonthly.textContent = 'Err';
        calGrid.innerHTML = '<p class="text-danger" style="grid-column: span 7;">Failed to load.</p>';
        console.error(e);
    }
};

const loadStudentNotices = async () => {
    const list = document.getElementById('studentNoticesList');
    if (!list) return;
    try {
        const snapshot = await window.db.collection("notices").orderBy("timestamp", "desc").get();
        list.innerHTML = '';
        let found = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.targetGrade === 'All' || data.targetGrade === window.state.user.grade) {
                found++;
                const date = new Date(data.timestamp).toLocaleDateString();
                list.innerHTML += `
                    <div style="padding: 0.75rem; border-bottom: 1px solid var(--border-glass);">
                        <div style="display: flex; justify-content: space-between;">
                            <strong style="color: var(--accent-primary);">${data.title}</strong>
                            <small class="text-muted">${date}</small>
                        </div>
                        <p style="font-size: 0.9rem; margin-top: 0.25rem;">${data.content}</p>
                    </div>
                `;
            }
        });
        if (found === 0) list.innerHTML = '<p class="text-muted" style="padding:1rem;">No recent notifications.</p>';
    } catch (e) { list.innerHTML = '<p class="text-danger">Failed to load notices.</p>'; }
};

const loadStudentResults = async () => {
    const tbody = document.querySelector('#studentResultsTable tbody');
    if (!tbody) return;
    try {
        const snapshot = await window.db.collection("results").where("studentId", "==", window.state.user.customId).orderBy("timestamp", "desc").get();
        tbody.innerHTML = '';
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-muted text-center" style="padding: 2rem;">No exam results posted yet.</td></tr>';
            return;
        }
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = new Date(data.timestamp).toLocaleDateString();
            const marksDetails = Object.entries(data.marks).map(([subj, score]) => `${subj}: ${score}`).join('\\n');
            tbody.innerHTML += `
                <tr>
                    <td><strong>${data.examName}</strong></td>
                    <td>${date}</td>
                    <td><span class="badge ${data.percentage >= 35 ? 'badge-success' : 'badge-danger'}">${data.total} / 700 (${data.percentage}%)</span></td>
                    <td>
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;"
                         onclick="alert('Marks for ${data.examName}:\\n\\n${marksDetails}')">View Breakdown</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) { tbody.innerHTML = '<tr><td colspan="4" class="text-danger">Error loading results.</td></tr>'; }
};

// --- Real-Time Chat System (Student Side) ---
const initStudentChat = () => {
    const toggleBtn = document.getElementById('chatToggleBtn');
    const chatBody = document.getElementById('chatBody');
    const toggleIcon = document.getElementById('chatToggleIcon');
    const msgContainer = document.getElementById('studentChatMessages');
    const chatForm = document.getElementById('studentChatForm');
    const inputField = document.getElementById('studentChatInput');
    const badge = document.getElementById('chatBadge');

    // Safety check if user is not fully setup
    if (!window.state.user.batch || !window.state.user.grade) {
        msgContainer.innerHTML = `<p class="text-muted text-center" style="margin-top: 5rem;">You must be assigned to a Batch Class by the Admin to chat.</p>`;
        inputField.disabled = true;
        return;
    }

    const classId = `${window.state.user.grade}_${window.state.user.batch}`;

    let isChatOpen = false;
    let isFirstLoad = true;

    // Toggle Window Logic
    toggleBtn.addEventListener('click', () => {
        isChatOpen = !isChatOpen;
        chatBody.style.display = isChatOpen ? 'flex' : 'none';
        toggleIcon.className = isChatOpen ? 'uil uil-angle-down' : 'uil uil-angle-up';
        if (isChatOpen) {
            badge.style.display = 'none';
            msgContainer.scrollTop = msgContainer.scrollHeight;
            inputField.focus();
        }
    });

    // Firestore Real-time Listener Hook
    window.db.collection("chats")
        .where("classId", "==", classId)
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) => {
            if (isFirstLoad) {
                msgContainer.innerHTML = '';
            }
            const isBottom = msgContainer.scrollHeight - msgContainer.scrollTop <= msgContainer.clientHeight + 50;

            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const msg = change.doc.data();
                    const isSelf = msg.senderId === window.state.user.customId;
                    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isAdmin = msg.senderId === 'admin';

                    msgContainer.innerHTML += `
                        <div class="chat-message ${isSelf ? 'self' : 'other'}">
                            ${!isSelf ? `<span class="chat-sender ${isAdmin ? 'admin-badge-text' : ''}">${isAdmin ? '<i class="uil uil-star"></i> ' : ''}${msg.senderName}</span>` : ''}
                            <div class="chat-bubble ${isAdmin ? 'admin-bubble' : ''}">${msg.text}</div>
                            <span class="chat-time">${time}</span>
                        </div>
                    `;

                    // Show Notification Badge if closed
                    if (!isFirstLoad && !isChatOpen && !isSelf) {
                        badge.style.display = 'inline-block';
                    }
                }
            });
            if (isBottom || isFirstLoad) msgContainer.scrollTop = msgContainer.scrollHeight;
            isFirstLoad = false;
        });

    // Send Message Logic
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = inputField.value.trim();
        if (!text) return;

        inputField.value = '';
        inputField.focus();

        try {
            await window.db.collection("chats").add({
                classId: classId,
                senderId: window.state.user.customId,
                senderName: window.state.user.name,
                text: text,
                timestamp: Date.now()
            });
        } catch (e) {
            console.error("Chat Error", e);
        }
    });
};
