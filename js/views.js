window.loadLoginView = () => `
    <div class="login-container">
        <div class="card login-card fade-in" style="padding: 0; overflow: hidden;">
            <div style="display: flex; cursor: pointer; border-bottom: 1px solid var(--border-glass);">
                <div id="tabStudentLogin" class="active" style="flex:1; padding: 1rem; text-align: center; font-weight: 600; border-bottom: 2px solid var(--accent-primary); background: rgba(99, 102, 241, 0.1); transition: all 0.3s; color: var(--text-primary);">Student Portal</div>
                <div id="tabTeacherLogin" style="flex:1; padding: 1rem; text-align: center; font-weight: 600; border-bottom: 2px solid transparent; transition: all 0.3s; color: var(--text-muted);">Staff Portal</div>
            </div>
            
            <div style="padding: 2rem;">
                <div class="login-header">
                    <div class="logo-icon">VTC</div>
                    <h2 id="loginTitle">Student Portal Login</h2>
                    <p id="loginDesc" style="color: var(--text-muted);">Enter your Vidya Classes Student ID.</p>
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <label class="form-label" id="idLabel">Student ID (e.g. VP1234)</label>
                        <input type="text" id="customId" class="form-control" placeholder="VP1234" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="password" class="form-control" placeholder="********" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <i class="uil uil-sign-in-alt"></i> Login
                    </button>
                </form>
            </div>
        </div>
    </div>
`;

window.loadAdminView = () => `
    <div class="container fade-in">
        <div class="dashboard-header">
            <h2>Admin Dashboard</h2>
            <div class="badge badge-accent">Admin Mode</div>
        </div>
        
        <div class="tabs">
            <button class="tab-btn active" data-target="admin-notices">Notice Board</button>
            <button class="tab-btn" data-target="admin-users">Manage Students</button>
            <button class="tab-btn" data-target="admin-attendance">Attendance</button>
            <button class="tab-btn" data-target="admin-results">Post Results</button>
            <button class="tab-btn" data-target="admin-chats">Class Chats</button>
        </div>
        
        <div id="admin-notices" class="tab-content">
            <div class="grid grid-cols-2">
                <div class="card">
                    <h3>Post New Notice</h3>
                    <form id="noticeForm" style="margin-top: 1.5rem;">
                        <div class="form-group">
                            <label class="form-label">Title</label>
                            <input type="text" id="noticeTitle" class="form-control" required placeholder="e.g. Maths Test Tomorrow">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Target Grade</label>
                            <select id="noticeGrade" class="form-control">
                                <option value="All">All Grades</option>
                                <option value="8th">8th Grade</option>
                                <option value="9th">9th Grade</option>
                                <option value="10th">10th Grade</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Message</label>
                            <textarea id="noticeContent" class="form-control" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Post Notice</button>
                    </form>
                </div>
                <div class="card">
                    <h3>Recent Notices</h3>
                    <div id="adminNoticesList" style="margin-top: 1.5rem;">
                        <p class="text-muted">Loading notices...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="admin-users" class="tab-content" style="display: none;">
            <!-- Promotion Tool -->
            <div class="card mb-4" style="margin-bottom: 2rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05)); border: 1px solid var(--accent-primary);">
                <h3><i class="uil uil-arrow-up-right"></i> Mass Class Promotion</h3>
                <form id="promoteForm" class="grid grid-cols-3" style="margin-top: 1.5rem; gap: 1rem; align-items: end;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Target Batch (e.g. 2026-2027)</label>
                        <input type="text" id="promoBatch" class="form-control" placeholder="2026-2027" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Current Grade</label>
                        <select id="promoCurrentGrade" class="form-control">
                            <option value="8th">8th Grade</option>
                            <option value="9th">9th Grade</option>
                            <option value="10th">10th Grade</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Promote To:</label>
                        <select id="promoNewGrade" class="form-control">
                            <option value="9th">9th Grade</option>
                            <option value="10th">10th Grade</option>
                            <option value="Graduated">Graduate / Deactivate</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary" style="grid-column: span 3;">Execute Promotion</button>
                </form>
            </div>

            <!-- Add User Form -->
            <div class="card mb-4" style="margin-bottom: 2rem;">
                <h3>Add New User</h3>
                <form id="addUserForm" class="grid grid-cols-2" style="margin-top: 1.5rem; gap: 1rem; align-items: end;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Account Role</label>
                        <select id="newUserRole" class="form-control">
                            <option value="student">Student Account</option>
                            <option value="teacher">Teacher Account</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="newUserName" class="form-control" placeholder="John Doe" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Grade</label>
                        <select id="newUserGrade" class="form-control">
                             <option value="NA">NA</option>
                            <option value="8th">8th Grade</option>
                            <option value="9th">9th Grade</option>
                            <option value="10th">10th Grade</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Custom ID (e.g. VP1001)</label>
                        <input type="text" id="newUserId" class="form-control" placeholder="VP1001" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Password</label>
                        <input type="text" id="newUserPass" class="form-control" placeholder="Password@123" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Batch Class (e.g. 2026-2027)</label>
                        <input type="text" id="newUserBatch" class="form-control" placeholder="2026-2027" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Contact Number</label>
                        <input type="text" id="newUserPhone" class="form-control" placeholder="9876543210" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0; grid-column: span 2;">
                        <label class="form-label">Address</label>
                        <textarea id="newUserAddress" class="form-control" rows="1" placeholder="Flat No. 1, Pune" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="grid-column: span 2;">Create Account</button>
                </form>
            </div>
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin-bottom: 0;">Manage Users Directory</h3>
                    <div style="display: flex; gap: 1rem;">
                        <select id="studentsFilterGrade" class="form-control" style="width: auto;">
                            <option value="All">All Classes (Grades)</option>
                            <option value="8th">8th Grade</option>
                            <option value="9th">9th Grade</option>
                            <option value="10th">10th Grade</option>
                        </select>
                        <button id="exportCsvBtn" class="btn btn-outline" title="Download as CSV"><i class="uil uil-export"></i> Export CSV</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="studentsTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Grade (Batch)</th>
                                <th>Contact</th>
                                <th>Address</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody><!-- dynamic --></tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div id="admin-attendance" class="tab-content" style="display: none;">
             <div class="card">
                <h3>Mark Attendance</h3>
                <div class="grid grid-cols-3" style="margin-top: 1.5rem; gap: 1rem; margin-bottom: 2rem;">
                    <input type="date" id="attDate" class="form-control">
                    <select id="attGrade" class="form-control">
                        <option value="8th">8th Grade</option>
                        <option value="9th">9th Grade</option>
                        <option value="10th">10th Grade</option>
                    </select>
                    <button id="loadAttBtn" class="btn btn-outline">Load Roster</button>
                </div>
                <div id="attendanceRoster">
                    <p class="text-muted">Select a date and grade to load the roster.</p>
                </div>
             </div>
        </div>

        <div id="admin-results" class="tab-content" style="display: none;">
            <div class="card">
                <h3>Post Exam Results</h3>
                 <form id="postResultForm" class="grid" style="margin-top: 1.5rem;">
                    <div class="grid grid-cols-2">
                        <div class="form-group">
                            <label class="form-label">Exam Name</label>
                            <input type="text" id="resExam" class="form-control" placeholder="Unit Test 1" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Student ID</label>
                            <input type="text" id="resStudent" class="form-control" placeholder="VP1234" required>
                        </div>
                    </div>
                    <h4>Marks (Out of 100)</h4>
                    <div class="grid grid-cols-3">
                        <div class="form-group"><label class="form-label">Maths</label><input type="number" id="mMath" class="form-control" required></div>
                        <div class="form-group"><label class="form-label">Science</label><input type="number" id="mSci" class="form-control" required></div>
                        <div class="form-group"><label class="form-label">English</label><input type="number" id="mEng" class="form-control" required></div>
                        <div class="form-group"><label class="form-label">History</label><input type="number" id="mHis" class="form-control" required></div>
                        <div class="form-group"><label class="form-label">Geography</label><input type="number" id="mGeo" class="form-control" required></div>
                        <div class="form-group"><label class="form-label">Marathi</label><input type="number" id="mMar" class="form-control" required></div>
                        <div class="form-group"><label class="form-label">Hindi</label><input type="number" id="mHin" class="form-control" required></div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="justify-self: start;">Post Result</button>
                </form>
            </div>
        </div>

        <!-- Class Chats Tab -->
        <div id="admin-chats" class="tab-content" style="display: none;">
            <div class="card" style="height: 70vh; display: flex; flex-direction: column;">
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 1rem;">
                    <select id="adminChatGrade" class="form-control" style="width: 150px;">
                        <option value="8th">8th Grade</option>
                        <option value="9th">9th Grade</option>
                        <option value="10th">10th Grade</option>
                    </select>
                    <input type="text" id="adminChatBatch" class="form-control" placeholder="Batch (e.g. 2026-2027)" style="width: 250px;" required>
                    <button id="loadAdminChatBtn" class="btn btn-outline">Enter Chatroom</button>
                </div>
                
                <div id="adminChatMessages" class="chat-messages-container" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; background: var(--bg-body); border-radius: 8px;">
                    <p class="text-muted" style="text-align: center; margin-top: auto; margin-bottom: auto;">Select Grade and Batch to open a Class Chatroom.</p>
                </div>
                
                <form id="adminChatForm" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <input type="text" id="adminChatInput" class="form-control" placeholder="Type message as Principal..." disabled required style="flex: 1;">
                    <button type="submit" class="btn btn-primary" id="adminChatSendBtn" disabled>Send</button>
                </form>
            </div>
        </div>

        <!-- Edit Profile Modal Overlay -->
        <div id="editUserModal" class="modal-overlay" style="display: none;">
            <div class="modal-content card fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); margin-bottom: 1.5rem; padding-bottom: 0.5rem;">
                    <h3><i class="uil uil-edit"></i> Edit Student Profile</h3>
                    <button class="btn btn-outline btn-sm" onclick="window.closeEditModal()"><i class="uil uil-times"></i></button>
                </div>
                <form id="editUserForm" class="grid grid-cols-2" style="gap: 1rem; align-items: end;">
                    <input type="hidden" id="editDocId">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="editUserName" class="form-control" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Grade</label>
                        <select id="editUserGrade" class="form-control">
                            <option value="8th">8th Grade</option>
                            <option value="9th">9th Grade</option>
                            <option value="10th">10th Grade</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Batch Class (e.g. 2026-2027)</label>
                        <input type="text" id="editUserBatch" class="form-control" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Contact Number</label>
                        <input type="text" id="editUserPhone" class="form-control" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0; grid-column: span 2;">
                        <label class="form-label">Address</label>
                        <textarea id="editUserAddress" class="form-control" rows="2" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-info" style="grid-column: span 2; margin-top: 1rem;">Save Profile Changes</button>
                </form>
            </div>
        </div>
    </div>
`;

window.loadStudentView = () => `
    <div class="container fade-in">
        <div class="dashboard-header">
            <h2>Welcome, <span id="studentNameTitle">Student</span></h2>
            <div class="badge badge-success" id="studentGradeTitle">Grade</div>
        </div>
        
        <div class="grid grid-cols-3" style="margin-bottom: 2rem;">
            <div class="card" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); border-color: var(--accent-primary);">
                <h3>Attendance Stats</h3>
                <div style="display: flex; gap: 2rem; margin-top: 1rem;">
                    <div>
                        <h2 style="font-size: 2.2rem; color: var(--accent-primary);" id="studentMonthlyAttPercent">--%</h2>
                        <p class="text-muted" style="font-size: 0.85rem; margin-top: 0.25rem;">This Month</p>
                    </div>
                    <div>
                        <h2 style="font-size: 1.5rem; color: var(--text-primary); margin-top: 0.6rem;" id="studentAttPercent">--%</h2>
                        <p class="text-muted" style="font-size: 0.85rem; margin-top: 0.25rem;">Overall</p>
                    </div>
                </div>
            </div>
            <div class="card" style="grid-column: span 2;">
                <h3>Recent Notifications</h3>
                <div id="studentNoticesList" style="margin-top: 1rem; height: 120px; overflow-y: auto;">
                    <p class="text-muted">Loading...</p>
                </div>
            </div>
        </div>
        
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3><span id="calendarMonthTitle" style="color: var(--accent-primary);">This Month's</span> Calendar</h3>
                <div style="display: flex; gap: 1rem; font-size: 0.8rem;">
                    <span style="display: flex; align-items: center; gap: 0.4rem;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--success);"></div> Present
                    </span>
                    <span style="display: flex; align-items: center; gap: 0.4rem;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--danger);"></div> Absent
                    </span>
                    <span style="display: flex; align-items: center; gap: 0.4rem;">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: var(--bg-secondary); border: 1px solid var(--border-glass);"></div> No Record
                    </span>
                </div>
            </div>
            
            <div class="calendar-grid">
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
            </div>
            <div class="calendar-grid" id="attendanceCalendarGrid">
                <p class="text-muted" style="grid-column: span 7; text-align: center; padding: 2rem;">Loading Calendar Data...</p>
            </div>
        </div>
        
        <div class="card" style="margin-bottom: 2rem;">
            <h3>Exam Results</h3>
            <div class="table-container" style="margin-top: 1.5rem;">
                <table id="studentResultsTable">
                    <thead>
                        <tr>
                            <th>Exam Name</th>
                            <th>Date</th>
                            <th>Total Marks</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody><!-- dynamic --></tbody>
                </table>
            </div>
        </div>

        <!-- Student Floating Class Chat -->
        <div id="studentChatWidget" class="chat-widget">
            <div class="chat-header" id="chatToggleBtn">
                <span><i class="uil uil-comment-alt-dots"></i> Class Chatroom <span id="chatBadge" class="badge badge-accent" style="display:none; font-size:0.7rem; margin-left:5px;">New</span></span>
                <i class="uil uil-angle-up" id="chatToggleIcon"></i>
            </div>
            <div class="chat-body" id="chatBody" style="display: none;">
                <div id="studentChatMessages" class="chat-messages">
                    <p class="text-muted" style="text-align: center; margin-top: 5rem;">Loading Chat...</p>
                </div>
                <form id="studentChatForm" class="chat-input-area">
                    <input type="text" id="studentChatInput" placeholder="Type a message..." required>
                    <button type="submit" class="btn btn-primary" style="padding: 0.5rem 0.8rem;"><i class="uil uil-message"></i></button>
                </form>
            </div>
        </div>
    </div>
`;
