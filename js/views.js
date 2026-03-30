window.loadLoginView = () => `
    <div class="login-container">
        <div class="card login-card fade-in">
            <div class="login-header">
                <div class="logo-icon">VPC</div>
                <h2>Student Portal Login</h2>
                <p>Enter your custom Vidya Classes ID.</p>
            </div>
            <form id="loginForm">
                <div class="form-group">
                    <label class="form-label">Custom ID (e.g. VP1234)</label>
                    <input type="text" id="customId" class="form-control" placeholder="VP1234" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" id="password" class="form-control" placeholder="VP@1234" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">
                    <i class="uil uil-sign-in-alt"></i> Login
                </button>
            </form>
            <div style="margin-top: 2rem; text-align: center; font-size: 0.85rem; color: var(--text-muted);">
                <p>Admin? Use your admin ID to access the dashboard.</p>
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
            <div class="card mb-4" style="margin-bottom: 2rem;">
                <h3>Add New Student</h3>
                <form id="addUserForm" class="grid grid-cols-2" style="margin-top: 1.5rem; gap: 1rem; align-items: end;">
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="newUserName" class="form-control" placeholder="John Doe" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Grade</label>
                        <select id="newUserGrade" class="form-control">
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
                        <label class="form-label">Contact Number</label>
                        <input type="text" id="newUserPhone" class="form-control" placeholder="9876543210" required>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label class="form-label">Address</label>
                        <textarea id="newUserAddress" class="form-control" rows="1" placeholder="Flat No. 1, Pune" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="grid-column: span 2;">Create Student Account</button>
                </form>
            </div>
            <div class="card">
                <h3>Student List</h3>
                <div class="table-container">
                    <table id="studentsTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Grade</th>
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
                <h3>Attendance</h3>
                <h2 style="font-size: 2.5rem; margin-top: 1rem; color: var(--accent-primary);" id="studentAttPercent">--%</h2>
                <p class="text-muted" style="margin-top: 0.5rem;">Overall Present</p>
            </div>
            <div class="card" style="grid-column: span 2;">
                <h3>Recent Notifications</h3>
                <div id="studentNoticesList" style="margin-top: 1rem; height: 120px; overflow-y: auto;">
                    <p class="text-muted">Loading...</p>
                </div>
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
    </div>
`;
