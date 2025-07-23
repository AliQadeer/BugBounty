document.addEventListener('DOMContentLoaded', function() {
    showMainMenu();
    setupEventListeners();
});

let selectedVulnerability = null;
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;

// Quiz questions for each vulnerability type
const quizQuestions = {
    'XSS': [
        {
            question: 'What does XSS stand for?',
            options: ['Cross-Site Scripting', 'X-ray Security System', 'eXtended SQL Syntax', 'X-Site Security'],
            correct: 0
        },
        {
            question: 'Which type of XSS is stored on the server?',
            options: ['Reflected XSS', 'Persistent XSS', 'DOM-based XSS', 'Blind XSS'],
            correct: 1
        },
        {
            question: 'What is the primary defense against XSS?',
            options: ['SQL sanitization', 'Input validation and output encoding', 'Firewall rules', 'Password encryption'],
            correct: 1
        },
        {
            question: 'Which HTML tag is commonly exploited in XSS attacks?',
            options: ['<div>', '<script>', '<table>', '<form>'],
            correct: 1
        },
        {
            question: 'What does CSP help prevent?',
            options: ['SQL Injection', 'Cross-Site Scripting', 'CSRF attacks', 'Session hijacking'],
            correct: 1
        }
    ],
    'SQL Injection': [
        {
            question: 'What is SQL Injection?',
            options: ['A virus', 'Database attack via malicious SQL', 'Network protocol', 'Encryption method'],
            correct: 1
        },
        {
            question: 'Which SQL operator is often used in injection attacks?',
            options: ['SELECT', 'OR', 'CREATE', 'DROP'],
            correct: 1
        },
        {
            question: 'What is the best defense against SQL injection?',
            options: ['Strong passwords', 'Prepared statements', 'Encryption', 'Firewalls'],
            correct: 1
        },
        {
            question: 'What does the UNION operator do in SQL injection?',
            options: ['Deletes data', 'Combines results from multiple queries', 'Encrypts data', 'Creates backups'],
            correct: 1
        },
        {
            question: 'Which character is commonly used to comment out SQL code?',
            options: ['#', '--', '//', '<!--'],
            correct: 1
        }
    ],
    'Cross Site Request Forgery': [
        {
            question: 'What does CSRF stand for?',
            options: ['Cross-Site Request Forgery', 'Cyber Security Risk Framework', 'Client Server Response Format', 'Critical System Resource Failure'],
            correct: 0
        },
        {
            question: 'How does CSRF attack work?',
            options: ['By stealing passwords', 'By tricking users into unwanted actions', 'By corrupting databases', 'By blocking network traffic'],
            correct: 1
        },
        {
            question: 'What is the primary defense against CSRF?',
            options: ['Strong passwords', 'CSRF tokens', 'Encryption', 'Firewalls'],
            correct: 1
        },
        {
            question: 'CSRF attacks exploit what aspect of web applications?',
            options: ['User trust', 'Browser trust in authenticated users', 'Weak encryption', 'Poor passwords'],
            correct: 1
        },
        {
            question: 'Which HTTP method is most vulnerable to CSRF?',
            options: ['GET', 'POST', 'PUT', 'DELETE'],
            correct: 0
        }
    ]
};

function setupEventListeners() {
    // Action buttons on main menu
    document.getElementById('openReportBtn').addEventListener('click', showOpenReportSection);
    document.getElementById('closeReportBtn').addEventListener('click', showCloseReportSection);
    
    // Quiz navigation
    document.getElementById('nextQuestionBtn').addEventListener('click', nextQuestion);
    document.getElementById('submitQuizBtn').addEventListener('click', submitQuiz);
    
    // Results buttons
    document.getElementById('newQuizBtn').addEventListener('click', showMainMenu);
    document.getElementById('confirmCloseBtn').addEventListener('click', handleCloseReport);
    document.getElementById('closeAnotherBtn').addEventListener('click', showMainMenu);
}

function showMainMenu() {
    hideAllSections();
    document.getElementById('mainMenu').classList.add('active');
    resetQuizState();
}

function showOpenReportSection() {
    hideAllSections();
    document.getElementById('openReportSection').classList.add('active');
    loadVulnerabilityTypes();
}

function showCloseReportSection() {
    hideAllSections();
    document.getElementById('closeReportSection').classList.add('active');
}

function hideAllSections() {
    document.querySelectorAll('.play-section').forEach(section => {
        section.classList.remove('active');
    });
}

function loadVulnerabilityTypes() {
    const container = document.getElementById('vulnerabilityTypes');
    container.innerHTML = '<div class="loading">Loading vulnerabilities...</div>';
    
    API.getVulnerabilities(function(status, data) {
        if (status === 200) {
            displayVulnerabilityTypes(data);
        } else {
            container.innerHTML = '<div class="error-message">Failed to load vulnerabilities</div>';
        }
    });
}

function displayVulnerabilityTypes(vulnerabilities) {
    const container = document.getElementById('vulnerabilityTypes');
    
    if (vulnerabilities.length === 0) {
        container.innerHTML = '<div class="empty-state">No vulnerabilities available</div>';
        return;
    }
    
    const html = vulnerabilities.map(vuln => `
        <div class="vulnerability-option" onclick="selectVulnerability(${vuln.id}, '${escapeHtml(vuln.type)}', ${vuln.points})">
            <h3>${escapeHtml(vuln.type)}</h3>
            <p>${escapeHtml(vuln.description)}</p>
            <div class="vulnerability-points">${vuln.points} Points</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function selectVulnerability(id, type, points) {
    selectedVulnerability = { id, type, points };
    
    // Check if we have quiz questions for this vulnerability type
    if (quizQuestions[type]) {
        startQuiz(type);
    } else {
        // Fallback to generic questions or direct report creation
        alert('Quiz not available for this vulnerability type. Creating report directly...');
        createDirectReport();
    }
}

function startQuiz(vulnerabilityType) {
    hideAllSections();
    document.getElementById('quizSection').classList.add('active');
    
    currentQuiz = [...quizQuestions[vulnerabilityType]]; // Copy questions
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;
    
    document.getElementById('quizTitle').textContent = `${vulnerabilityType} Knowledge Quiz`;
    
    showCurrentQuestion();
}

function showCurrentQuestion() {
    const question = currentQuiz[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;
    
    // Update progress
    document.getElementById('quizProgressFill').style.width = `${progress}%`;
    document.getElementById('quizProgressText').textContent = `Question ${currentQuestionIndex + 1} of ${currentQuiz.length}`;
    
    // Display question
    document.getElementById('questionText').textContent = question.question;
    
    // Display options
    const optionsHtml = question.options.map((option, index) => `
        <div class="answer-option" data-answer="${index}">
            ${escapeHtml(option)}
        </div>
    `).join('');
    
    document.getElementById('answerOptions').innerHTML = optionsHtml;
    
    // Add click handlers to options
    document.querySelectorAll('.answer-option').forEach(option => {
        option.addEventListener('click', selectAnswer);
    });
    
    // Update buttons
    document.getElementById('nextQuestionBtn').style.display = currentQuestionIndex < currentQuiz.length - 1 ? 'inline-block' : 'none';
    document.getElementById('submitQuizBtn').style.display = currentQuestionIndex === currentQuiz.length - 1 ? 'inline-block' : 'none';
    document.getElementById('nextQuestionBtn').disabled = true;
}

function selectAnswer(event) {
    // Remove previous selection
    document.querySelectorAll('.answer-option').forEach(opt => opt.classList.remove('selected'));
    
    // Mark current selection
    event.target.classList.add('selected');
    
    // Store answer
    const answerIndex = parseInt(event.target.dataset.answer);
    userAnswers[currentQuestionIndex] = answerIndex;
    
    // Enable next button
    document.getElementById('nextQuestionBtn').disabled = false;
    document.getElementById('submitQuizBtn').disabled = false;
}

function nextQuestion() {
    currentQuestionIndex++;
    showCurrentQuestion();
}

function submitQuiz() {
    // Calculate score
    score = 0;
    for (let i = 0; i < currentQuiz.length; i++) {
        if (userAnswers[i] === currentQuiz[i].correct) {
            score++;
        }
    }
    
    if (score === currentQuiz.length) {
        // Perfect score - create report
        createReportFromQuiz();
    } else {
        // Show failure result
        showQuizFailure();
    }
}

function createReportFromQuiz() {
    const user = getCurrentUser();
    if (!user || !selectedVulnerability) return;
    
    const reportData = {
        user_id: user.id,
        vulnerability_id: selectedVulnerability.id
    };
    
    API.createReport(reportData, function(status, data) {
        if (status === 201) {
            showQuizSuccess(data);
        } else {
            alert('Failed to create report. Please try again.');
            showMainMenu();
        }
    });
}

function createDirectReport() {
    const user = getCurrentUser();
    if (!user || !selectedVulnerability) return;
    
    const reportData = {
        user_id: user.id,
        vulnerability_id: selectedVulnerability.id
    };
    
    API.createReport(reportData, function(status, data) {
        if (status === 201) {
            showDirectReportSuccess(data);
        } else {
            alert('Failed to create report. Please try again.');
            showMainMenu();
        }
    });
}

function showQuizSuccess(reportData) {
    hideAllSections();
    document.getElementById('quizResults').classList.add('active');
    
    const user = getCurrentUser();
    
    const resultsHtml = `
        <div class="success-badge">Perfect Score! 🎉</div>
        <div class="result-item">
            <span class="result-label">Report ID:</span>
            <span class="result-value">${reportData.id}</span>
        </div>
        <div class="result-item">
            <span class="result-label">User ID:</span>
            <span class="result-value">${reportData.user_id}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Vulnerability ID:</span>
            <span class="result-value">${reportData.vulnerability_id}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Status:</span>
            <span class="result-value">Open (${reportData.status})</span>
        </div>
        <div class="result-item">
            <span class="result-label">Reputation Points:</span>
            <span class="result-value">${reportData.user_reputation}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Current Rank:</span>
            <span class="result-value">${user.rank_name || 'Bronze'}</span>
        </div>
    `;
    
    document.getElementById('resultsContent').innerHTML = resultsHtml;
    
    // Update user reputation
    if (user && reportData.user_reputation) {
        const updatedUser = { ...user, reputation: reportData.user_reputation };
        setCurrentUser(updatedUser);
    }
}

function showQuizFailure() {
    hideAllSections();
    document.getElementById('quizResults').classList.add('active');
    
    const resultsHtml = `
        <div class="error-message">Quiz Failed</div>
        <p>You scored ${score} out of ${currentQuiz.length} questions.</p>
        <p>You need a perfect score to submit a report. Study the vulnerability type and try again!</p>
    `;
    
    document.getElementById('resultsContent').innerHTML = resultsHtml;
}

function handleCloseReport() {
    const user = getCurrentUser();
    if (!user) return;
    
    const confirmBtn = document.getElementById('confirmCloseBtn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Loading...';
    
    // First, get all open reports
    API.getAllReports(function(status, data) {
        if (status === 200) {
            // Find an open report to close
            const openReports = data.filter(report => report.status === 0);
            
            if (openReports.length === 0) {
                alert('No open reports available to close!');
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Close Report';
                return;
            }
            
            // Close the first open report
            const reportToClose = openReports[0];
            const updateData = {
                status: 1,
                user_id: user.id
            };
            
            confirmBtn.textContent = 'Closing...';
            
            API.updateReport(reportToClose.id, updateData, function(updateStatus, updateResult) {
                if (updateStatus === 200) {
                    showCloseResults(updateResult);
                } else {
                    alert('Failed to close report. Please try again.');
                }
                
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Close Report';
            });
        } else {
            alert('Failed to load reports. Please try again.');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Close Report';
        }
    });
}

function showCloseResults(results) {
    hideAllSections();
    document.getElementById('closeResults').classList.add('active');
    
    const resultsHtml = `
        <div class="result-item">
            <span class="result-label">Report ID:</span>
            <span class="result-value">${results.id}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Status:</span>
            <span class="result-value">Closed (${results.status})</span>
        </div>
        <div class="result-item">
            <span class="result-label">Closer ID:</span>
            <span class="result-value">${results.closer_id}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Reputation Points:</span>
            <span class="result-value">${results.user_reputation}</span>
        </div>
        ${results.badge_awarded ? `
            <div class="result-item">
                <span class="result-label">Badge Awarded:</span>
                <span class="result-value">${results.badge_awarded}</span>
            </div>
        ` : '<div class="result-item"><span class="result-label">Badge:</span><span class="result-value">None awarded</span></div>'}
    `;
    
    document.getElementById('closeResultsContent').innerHTML = resultsHtml;
    
    // Update user reputation
    const user = getCurrentUser();
    if (user) {
        const updatedUser = { ...user, reputation: results.user_reputation };
        setCurrentUser(updatedUser);
    }
}

function resetQuizState() {
    selectedVulnerability = null;
    currentQuiz = null;
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}