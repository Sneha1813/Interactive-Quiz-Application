/**
 * Admin JavaScript File
 * This file contains all the functionality for the admin dashboard including:
 * - Authentication
 * - Student management
 * - Exam management
 * - Question management
 * - Results viewing
 */

// Admin credentials (in a real application, this would be handled server-side)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Local storage keys for consistent data access
const STORAGE_KEYS = {
    STUDENTS: 'students',    // Key for storing student data
    EXAMS: 'exams',         // Key for storing exam data
    RESULTS: 'results'       // Key for storing exam results
};

/**
 * Initialize local storage with empty arrays if data doesn't exist
 * This ensures the application has the required data structure to work with
 */
function initializeStorage() {
    console.log('Initializing storage...'); // Debug log
    
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
        console.log('Initialized students array'); // Debug log
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
        localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify([]));
        console.log('Initialized exams array'); // Debug log
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.RESULTS)) {
        localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
        console.log('Initialized results array'); // Debug log
    }
    
    // Check if 'results' key exists (without the STORAGE_KEYS prefix)
    if (!localStorage.getItem('results')) {
        localStorage.setItem('results', JSON.stringify([]));
        console.log('Initialized plain results array'); // Debug log
    }
    
    // Log current state of results
    console.log('Current results:', JSON.parse(localStorage.getItem('results') || '[]')); // Debug log
    console.log('Current STORAGE_KEYS.RESULTS:', JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]')); // Debug log
}

/**
 * Handle admin login form submission
 * Validates credentials and redirects to dashboard if successful
 * @param {Event} event - The form submission event
 */
function handleAdminLogin(event) {
    event.preventDefault();
    console.log('Login attempt...');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Expected username:', ADMIN_CREDENTIALS.username);
    console.log('Expected password:', ADMIN_CREDENTIALS.password);

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        console.log('Login successful!');
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('currentAdmin', JSON.stringify({ username: 'admin' }));
        window.location.href = 'dashboard.html';
    } else {
        console.log('Login failed!');
        alert('Invalid credentials! Please use:\nUsername: admin\nPassword: admin123');
    }
}

/**
 * Handle admin logout
 * Removes admin session and redirects to home page
 */
function logout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = '../index.html';
}

/**
 * Check if admin is logged in
 * Redirects to login page if not authenticated
 */
function checkAdminAuth() {
    if (!localStorage.getItem('adminLoggedIn') && !window.location.href.includes('login.html')) {
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
    
    // Load appropriate data when switching tabs
    if (tabId === 'questions') {
        loadExamSelect();
        loadQuestions();
    }
}

/**
 * Handle adding a new student
 * Validates input and stores student data in localStorage
 * @param {Event} event - The form submission event
 */
function handleAddStudent(event) {
    event.preventDefault();
    const name = document.getElementById('studentName').value;
    const id = document.getElementById('studentId').value;
    const password = document.getElementById('studentPassword').value;

    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS));
    
    // Check if student ID already exists
    if (students.some(student => student.id === id)) {
        alert('Student ID already exists!');
        return;
    }

    students.push({ id, name, password });
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    
    // Display credentials
    document.getElementById('newStudentId').textContent = id;
    document.getElementById('newStudentPassword').textContent = password;
    document.getElementById('studentCredentials').style.display = 'block';
    
    alert('Student added successfully!');
    event.target.reset();
    loadStudents();
}

/**
 * Load and display all students in the table
 * Retrieves student data from localStorage and updates the UI
 */
function loadStudents() {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS));
    const studentList = document.getElementById('studentList');
    
    if (studentList) {
        studentList.innerHTML = students.map(student => `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>
                    <button class="btn" onclick="resetStudentPassword('${student.id}')">Reset Password</button>
                    <button class="btn" onclick="deleteStudent('${student.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

/**
 * Reset a student's password to a random string
 * @param {string} studentId - The ID of the student
 */
function resetStudentPassword(studentId) {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS));
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex !== -1) {
        const newPassword = Math.random().toString(36).substring(2, 8);
        students[studentIndex].password = newPassword;
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        
        alert(`Password reset for ${students[studentIndex].name}:\nNew password: ${newPassword}`);
    }
}

/**
 * Delete a student from the system
 * @param {string} studentId - The ID of the student to delete
 */
function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS));
        const updatedStudents = students.filter(student => student.id !== studentId);
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedStudents));
        loadStudents();
    }
}

/**
 * Handle creating a new exam
 * Validates input and stores exam data in localStorage
 * @param {Event} event - The form submission event
 */
function handleCreateExam(event) {
    event.preventDefault();
    const title = document.getElementById('examTitle').value;
    const description = document.getElementById('examDescription').value;
    const duration = document.getElementById('examDuration').value;

    const exams = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS));
    const newExam = {
        id: Date.now().toString(),
        title,
        description,
        duration,
        questions: []
    };

    exams.push(newExam);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    
    alert('Exam created successfully!');
    event.target.reset();
    loadExams();
}

/**
 * Load and display all exams in the table
 * Retrieves exam data from localStorage and updates the UI
 */
function loadExams() {
    const exams = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS));
    const examList = document.getElementById('examList');
    
    if (examList) {
        examList.innerHTML = exams.map(exam => `
            <tr>
                <td>${exam.title}</td>
                <td>${exam.description}</td>
                <td>${exam.duration} minutes</td>
                <td>${exam.questions ? exam.questions.length : 0} questions</td>
                <td>
                    <button class="btn" onclick="editExam('${exam.id}')">Edit</button>
                    <button class="btn" onclick="deleteExam('${exam.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

/**
 * Delete an exam from the system
 * @param {string} examId - The ID of the exam to delete
 */
function deleteExam(examId) {
    if (confirm('Are you sure you want to delete this exam?')) {
        const exams = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS));
        const updatedExams = exams.filter(exam => exam.id !== examId);
        localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(updatedExams));
        loadExams();
    }
}

/**
 * Load exam select dropdown with all available exams
 * Used in the questions tab for selecting which exam to add questions to
 */
function loadExamSelect() {
    const exams = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS));
    const examSelect = document.getElementById('examSelect');
    
    if (examSelect) {
        examSelect.innerHTML = '<option value="">Select Exam</option>' + 
            exams.map(exam => `<option value="${exam.id}">${exam.title}</option>`).join('');
            
        // Add event listener to load questions when an exam is selected
        examSelect.addEventListener('change', function() {
            loadQuestions(this.value);
        });
    }
}

/**
 * Add a new option input field to the question form
 * Creates a new option input with radio button for correct answer selection
 */
function addOption() {
    const optionsContainer = document.getElementById('optionsContainer');
    const optionCount = optionsContainer.children.length;
    
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-input';
    optionDiv.innerHTML = `
        <input type="text" class="form-control" placeholder="Option ${optionCount + 1}" required>
        <input type="radio" name="correctAnswer" value="${optionCount}" required> Correct
    `;
    
    optionsContainer.appendChild(optionDiv);
}

/**
 * Handle adding a new question to an exam
 * Validates input and stores question data in localStorage
 * @param {Event} event - The form submission event
 */
function handleAddQuestion(event) {
    event.preventDefault();
    console.log('Adding question...');
    
    const examId = document.getElementById('examSelect').value;
    const questionText = document.getElementById('questionText').value;
    const optionInputs = document.querySelectorAll('#optionsContainer .option-input input[type="text"]');
    const correctAnswerInput = document.querySelector('input[name="correctAnswer"]:checked');
    
    console.log('Exam ID:', examId);
    console.log('Question Text:', questionText);
    console.log('Options:', optionInputs.length);
    console.log('Correct Answer:', correctAnswerInput ? correctAnswerInput.value : 'None selected');
    
    if (!examId || !questionText || !correctAnswerInput) {
        alert('Please fill all required fields and select a correct answer');
        return;
    }
    
    const options = Array.from(optionInputs).map(input => input.value);
    const correctAnswer = parseInt(correctAnswerInput.value);
    
    const exams = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS));
    const examIndex = exams.findIndex(e => e.id === examId);
    
    if (examIndex !== -1) {
        if (!exams[examIndex].questions) {
            exams[examIndex].questions = [];
        }
        
        const newQuestion = {
            id: Date.now().toString(),
            text: questionText,
            options: options,
            correctAnswer: correctAnswer
        };
        
        console.log('Adding question:', newQuestion);
        
        exams[examIndex].questions.push(newQuestion);
        localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
        
        alert('Question added successfully!');
        
        // Reset form
        document.getElementById('questionText').value = '';
        document.querySelectorAll('input[name="correctAnswer"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Reload questions for the current exam
        loadQuestions(examId);
    } else {
        alert('Error: Exam not found');
    }
}

/**
 * Load and display questions for the selected exam
 * Retrieves question data from localStorage and updates the UI
 * @param {string} [examId] - Optional ID of the exam to load questions for
 */
function loadQuestions(examId) {
    // If no examId is provided, try to get it from the select element
    if (!examId) {
        const examSelect = document.getElementById('examSelect');
        if (examSelect) {
            examId = examSelect.value;
        }
    }
    
    const questionsList = document.getElementById('questionsList');
    
    if (!examId || !questionsList) {
        if (questionsList) {
            questionsList.innerHTML = '<p>Please select an exam to view its questions</p>';
        }
        return;
    }
    
    const exams = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS));
    const exam = exams.find(e => e.id === examId);
    
    if (exam && exam.questions) {
        questionsList.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Question</th>
                            <th>Options</th>
                            <th>Correct Answer</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${exam.questions.map((question, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${question.text}</td>
                                <td>${question.options.join(', ')}</td>
                                <td>${question.options[question.correctAnswer]}</td>
                                <td>
                                    <button class="btn" onclick="deleteQuestion('${examId}', '${question.id}')">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        questionsList.innerHTML = '<p>No questions added yet</p>';
    }
}

/**
 * Delete a question from an exam
 * @param {string} examId - The ID of the exam
 * @param {string} questionId - The ID of the question to delete
 */
function deleteQuestion(examId, questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        const exams = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS));
        const examIndex = exams.findIndex(e => e.id === examId);
        
        if (examIndex !== -1 && exams[examIndex].questions) {
            exams[examIndex].questions = exams[examIndex].questions.filter(q => q.id !== questionId);
            localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
            loadQuestions();
        }
    }
}

/**
 * Load and display exam results
 * Retrieves results data from localStorage and updates the UI
 */
function loadResults() {
    // Try to get results from both possible keys
    let results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]');
    
    // If no results found with STORAGE_KEYS.RESULTS, try the plain 'results' key
    if (results.length === 0) {
        results = JSON.parse(localStorage.getItem('results') || '[]');
        console.log('Using plain results key:', results); // Debug log
    } else {
        console.log('Using STORAGE_KEYS.RESULTS:', results); // Debug log
    }
    
    const resultsList = document.getElementById('resultsList');
    
    if (resultsList) {
        if (results.length === 0) {
            resultsList.innerHTML = '<tr><td colspan="5" style="text-align: center;">No results available yet</td></tr>';
            return;
        }
        
        // Sort results by date (newest first)
        const sortedResults = [...results].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        
        resultsList.innerHTML = sortedResults.map(result => `
            <tr>
                <td>${result.studentId || 'N/A'}</td>
                <td>${result.studentName || 'Unknown Student'}</td>
                <td>${result.examTitle || 'Unknown Exam'}</td>
                <td>${result.score}%</td>
                <td>${result.date || 'N/A'}</td>
            </tr>
        `).join('');
    } else {
        console.error('Results list element not found'); // Debug log
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeStorage();
    checkAdminAuth();
    
    // Load appropriate data based on current page
    if (window.location.href.includes('dashboard.html')) {
        loadStudents();
        loadExams();
        loadResults();
    }
}); 