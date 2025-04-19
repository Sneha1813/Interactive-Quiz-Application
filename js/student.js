/**
 * Student JavaScript File
 * This file contains all the functionality for the student interface including:
 * - Authentication
 * - Exam taking
 * - Results viewing
 * - Dashboard management
 */

// Local storage keys for consistent data access
const STORAGE_KEYS = {
    STUDENTS: 'students',    // Key for storing student data
    EXAMS: 'exams',         // Key for storing exam data
    RESULTS: 'results'       // Key for storing exam results
};

/**
 * Handle student login form submission
 * Validates credentials and redirects to dashboard if successful
 * @param {Event} event - The form submission event
 */
function handleStudentLogin(event) {
    event.preventDefault();
    const studentId = document.getElementById('studentId').value;
    const password = document.getElementById('password').value;

    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS));
    const student = students.find(s => s.id === studentId && s.password === password);

    if (student) {
        localStorage.setItem('currentStudent', JSON.stringify(student));
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid credentials!');
    }
}

/**
 * Handle student logout
 * Removes student session and redirects to home page
 */
function logout() {
    localStorage.removeItem('currentStudent');
    window.location.href = '../index.html';
}

/**
 * Check if student is logged in
 * Redirects to login page if not authenticated
 */
function checkStudentAuth() {
    if (!localStorage.getItem('currentStudent') && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

/**
 * Show/hide dashboard tabs
 * @param {string} tabId - The ID of the tab to show
 */
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

/**
 * Load and display available exams for the student
 * Shows exam status (completed/pending) and appropriate actions
 */
function loadAvailableExams() {
    const exams = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS));
    const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS));
    const currentStudent = JSON.parse(localStorage.getItem('currentStudent'));
    const examList = document.getElementById('examList');
    
    if (examList) {
        examList.innerHTML = exams.map(exam => {
            // Check if student has completed this exam
            const completedExam = results.find(r => 
                r.studentId === currentStudent.id && 
                r.examId === exam.id
            );
            
            return `
                <div class="exam-card">
                    <h3>${exam.title}</h3>
                    <div class="exam-info">
                        <p><strong>Description:</strong> ${exam.description}</p>
                        <p><strong>Duration:</strong> ${exam.duration} minutes</p>
                        <p><strong>Status:</strong> 
                            <span class="status-badge ${completedExam ? 'status-completed' : 'status-pending'}">
                                ${completedExam ? 'Completed' : 'Pending'}
                            </span>
                        </p>
                    </div>
                    <div class="exam-actions">
                        ${!completedExam ? 
                            `<button class="btn btn-primary" onclick="startExam('${exam.id}')">Start Exam</button>` :
                            `<button class="btn" onclick="viewResult('${exam.id}')">View Result</button>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }
}

/**
 * Start a selected exam
 * Stores exam data in localStorage and redirects to exam page
 * @param {string} examId - The ID of the exam to start
 */
function startExam(examId) {
    const exam = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS))
        .find(e => e.id === examId);
    
    if (exam) {
        localStorage.setItem('currentExam', JSON.stringify(exam));
        window.location.href = 'exam.html';
    }
}

/**
 * Load and display student's exam results
 * Shows exam title, date, score, and completion status
 */
function loadResults() {
    const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS));
    const exams = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS));
    const currentStudent = JSON.parse(localStorage.getItem('currentStudent'));
    const resultsList = document.getElementById('resultsList');
    
    if (resultsList) {
        // Filter results for current student
        const studentResults = results.filter(r => r.studentId === currentStudent.id);
        resultsList.innerHTML = studentResults.map(result => {
            const exam = exams.find(e => e.id === result.examId);
            return `
                <tr>
                    <td>${exam ? exam.title : 'N/A'}</td>
                    <td>${new Date(result.date).toLocaleDateString()}</td>
                    <td>${result.score}</td>
                    <td>
                        <span class="status-badge status-completed">Completed</span>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

/**
 * Update student name in the dashboard header
 * Retrieves current student data from localStorage
 */
function updateStudentName() {
    const currentStudent = JSON.parse(localStorage.getItem('currentStudent'));
    const studentNameElement = document.getElementById('studentName');
    if (studentNameElement && currentStudent) {
        studentNameElement.textContent = currentStudent.name;
    }
}

/**
 * Initialize the page
 * Checks authentication and loads appropriate data
 */
document.addEventListener('DOMContentLoaded', () => {
    checkStudentAuth();
    updateStudentName();
    
    // Load appropriate data based on current page
    if (window.location.href.includes('dashboard.html')) {
        loadAvailableExams();
        loadResults();
    }
}); 