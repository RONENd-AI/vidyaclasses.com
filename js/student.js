import { auth, db } from './firebase-config.js';
import { 
    collection, getDocs, query, where, orderBy, getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { state, showLoader, hideLoader, showToast } from './app.js';

export const setupStudentPanel = () => {
    // Populate header
    document.getElementById('studentNameTitle').textContent = state.user.name;
    document.getElementById('studentGradeTitle').textContent = `${state.user.grade} Grade`;
    
    loadStudentNotices();
    loadStudentAttendance();
    loadStudentResults();
};

const loadStudentNotices = async () => {
    const list = document.getElementById('studentNoticesList');
    if (!list) return;
    
    try {
        const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        list.innerHTML = '';
        
        let found = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            // Show only relevant grade notes or 'All'
            if (data.targetGrade === 'All' || data.targetGrade === state.user.grade) {
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
        
    } catch (error) {
        list.innerHTML = '<p class="text-danger">Failed to load notices.</p>';
        console.error(error);
    }
};

const loadStudentAttendance = async () => {
    const el = document.getElementById('studentAttPercent');
    try {
        const q = query(collection(db, "attendance"), where("grade", "==", state.user.grade));
        const snapshot = await getDocs(q);
        
        let totalDays = 0;
        let presentDays = 0;
        
        snapshot.forEach(doc => {
            totalDays++;
            const data = doc.data();
            if (data.presentIds && data.presentIds.includes(state.user.customId)) {
                presentDays++;
            }
        });
        
        if (totalDays === 0) {
            el.textContent = 'N/A';
        } else {
            const percentage = Math.round((presentDays / totalDays) * 100);
            el.textContent = `${percentage}%`;
            if (percentage < 75) {
                el.style.color = 'var(--danger)';
            } else if (percentage > 90) {
                el.style.color = 'var(--success)';
            }
        }
        
    } catch (error) {
        el.textContent = 'Err';
        console.error(error);
    }
};

const loadStudentResults = async () => {
    const tbody = document.querySelector('#studentResultsTable tbody');
    if (!tbody) return;
    
    try {
        const q = query(collection(db, "results"), where("studentId", "==", state.user.customId), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        
        tbody.innerHTML = '';
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-muted text-center" style="padding: 2rem;">No exam results posted yet.</td></tr>';
            return;
        }
        
        let index = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = new Date(data.timestamp).toLocaleDateString();
            const modalId = `modal-${index}`; // Quick inline modal toggle logic handled via generic alert for simplicity
            
            // Format marks
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
            index++;
        });
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-danger">Error loading results.</td></tr>';
        console.error(error);
    }
};
