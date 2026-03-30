window.setupStudentPanel = () => {
    document.getElementById('studentNameTitle').textContent = window.state.user.name;
    document.getElementById('studentGradeTitle').textContent = `${window.state.user.grade} Grade`;
    loadStudentNotices();
    loadStudentAttendance();
    loadStudentResults();
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

const loadStudentAttendance = async () => {
    const el = document.getElementById('studentAttPercent');
    try {
        const snapshot = await window.db.collection("attendance").where("grade", "==", window.state.user.grade).get();
        let totalDays = 0, presentDays = 0;
        snapshot.forEach(doc => {
            totalDays++;
            const data = doc.data();
            if (data.presentIds && data.presentIds.includes(window.state.user.customId)) presentDays++;
        });
        if (totalDays === 0) el.textContent = 'N/A';
        else {
            const percentage = Math.round((presentDays / totalDays) * 100);
            el.textContent = `${percentage}%`;
            if (percentage < 75) el.style.color = 'var(--danger)';
            else if (percentage > 90) el.style.color = 'var(--success)';
        }
    } catch (e) { el.textContent = 'Err'; }
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
