document.addEventListener('DOMContentLoaded', function() {
    showMainMenu();
    setupEventListeners();
});

let selectedVulnerability = null;
let reportToClose = null;

function setupEventListeners() {
    // Action buttons on main menu
    document.getElementById('openReportBtn').addEventListener('click', showOpenReportSection);
    document.getElementById('closeReportBtn').addEventListener('click', showCloseReportSection);
    
    // Solution submission
    document.getElementById('submitSolutionBtn').addEventListener('click', submitSolution);
    
    // Solution input for closing reports
    document.getElementById('submitCloseSolutionBtn').addEventListener('click', submitClosingSolution);
    
    // Results buttons
    document.getElementById('newReportBtn').addEventListener('click', showMainMenu);
    document.getElementById('closeAnotherBtn').addEventListener('click', showMainMenu);
}

function showMainMenu() {
    hideAllSections();
    document.getElementById('mainMenu').classList.add('active');
    resetState();
}

function showOpenReportSection() {
    hideAllSections();
    document.getElementById('openReportSection').classList.add('active');
    loadVulnerabilityTypes();
}

function showCloseReportSection() {
    hideAllSections();
    document.getElementById('closeReportSection').classList.add('active');
    loadReportsForClosing();
}

function showSolutionInputSection() {
    if (!reportToClose) return;
    
    hideAllSections();
    document.getElementById('solutionInputSection').classList.add('active');
    
    // Populate report info
    document.getElementById('closingReportType').textContent = reportToClose.type;
    document.getElementById('closingReportUser').textContent = reportToClose.reporter_username;
    document.getElementById('closingReportDescription').textContent = reportToClose.description || 'No description provided';
    document.getElementById('closingReportPoints').textContent = reportToClose.points;
    
    // Clear previous solution text
    document.getElementById('closingSolutionText').value = '';
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
        <div class="vulnerability-option" onclick="selectVulnerability(${vuln.id}, '${escapeHtml(vuln.type)}', ${vuln.points}, '${escapeHtml(vuln.description)}')">
            <h3>${escapeHtml(vuln.type)}</h3>
            <p>${escapeHtml(vuln.description)}</p>
            <div class="vulnerability-points">${vuln.points} Points</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function selectVulnerability(id, type, points, description) {
    selectedVulnerability = { id, type, points, description };
    showSolutionSection();
}

function showSolutionSection() {
    hideAllSections();
    document.getElementById('solutionSection').classList.add('active');
    
    // Populate vulnerability info
    document.getElementById('selectedVulnType').textContent = selectedVulnerability.type;
    document.getElementById('selectedVulnDescription').textContent = selectedVulnerability.description;
    document.getElementById('selectedVulnPoints').textContent = selectedVulnerability.points;
    
    // Clear previous solution text
    document.getElementById('solutionText').value = '';
}

function submitSolution() {
    const descriptionText = document.getElementById('solutionText').value.trim();
    
    if (!descriptionText) {
        showAlert.warning('Please enter a description of the vulnerability before submitting.', {
            title: 'Missing Description',
            duration: 4000
        });
        return;
    }
    
    const user = getCurrentUser();
    if (!user || !selectedVulnerability) return;
    
    const reportData = {
        user_id: user.id,
        vulnerability_id: selectedVulnerability.id,
        description: descriptionText
    };
    
    // Disable button to prevent double submission
    const submitBtn = document.getElementById('submitSolutionBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    API.createReport(reportData, function(status, data) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Report';
        
        if (status === 201) {
            showSolutionSuccess(data);
        } else {
            showAlert.error('Failed to create report. Please try again.', {
                title: 'Submission Failed',
                duration: 5000
            });
        }
    });
}

function showSolutionSuccess(reportData) {
    hideAllSections();
    document.getElementById('solutionResults').classList.add('active');
    
    const user = getCurrentUser();
    
    const resultsHtml = `
        <div class="success-badge">Report Submitted! 🎉</div>
        <div class="result-item">
            <span class="result-label">Report ID:</span>
            <span class="result-value">${reportData.id}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Vulnerability Type:</span>
            <span class="result-value">${selectedVulnerability.type}</span>
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
                showAlert.info('No open reports available to close!', {
                    title: 'No Open Reports',
                    duration: 4000
                });
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
                    showAlert.error('Failed to close report. Please try again.', {
                        title: 'Close Failed',
                        duration: 5000
                    });
                }
                
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Close Report';
            });
        } else {
            showAlert.error('Failed to load reports. Please try again.', {
                title: 'Load Failed',
                duration: 5000
            });
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

// Reports management functions
function loadReportsForClosing() {
    const loadingDiv = document.getElementById('loadingReports');
    const errorDiv = document.getElementById('errorReports');
    const containerDiv = document.getElementById('reportsListContainer');
    
    // Show loading state
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    containerDiv.style.display = 'none';
    
    fetchMethod('/api/reports', (status, data) => {
        loadingDiv.style.display = 'none';
        
        if (status === 200 && data) {
            displayReportsForClosing(data);
        } else {
            console.error('Error loading reports:', status, data);
            showReportsError('Failed to load reports: ' + (data?.error || 'Server error'));
        }
    }, 'GET');
}

function displayReportsForClosing(reports) {
    const containerDiv = document.getElementById('reportsListContainer');
    const errorDiv = document.getElementById('errorReports');
    
    if (!reports || reports.length === 0) {
        containerDiv.innerHTML = '<div class="no-reports">No reports available</div>';
        containerDiv.style.display = 'block';
        return;
    }
    
    const reportsHtml = reports.map(report => `
        <div class="report-item">
            <div class="report-header">
                <span class="report-id">Report #${report.id}</span>
                <span class="report-status ${report.status ? 'status-closed' : 'status-open'}">
                    ${report.status ? 'CLOSED' : 'OPEN'}
                </span>
            </div>
            
            <div class="vulnerability-details">
                <div class="vulnerability-type">${escapeHtml(report.type)}</div>
                <div class="vulnerability-description">${escapeHtml(report.vulnerability_description)}</div>
                <div class="vulnerability-points">Points: ${report.points}</div>
            </div>
            
            ${report.description ? `
                <div class="report-description-section">
                    <strong>Report Description:</strong>
                    <div class="user-report-description">${escapeHtml(report.description)}</div>
                </div>
            ` : ''}
            
            <div class="reporter-info">
                Reported by: <strong>${escapeHtml(report.reporter_username)}</strong>
            </div>
            
            ${report.status ? `
                <div class="closer-info">
                    Closed by: <strong>${escapeHtml(report.closer_username || 'Unknown')}</strong>
                    ${report.closed_at ? `on ${new Date(report.closed_at).toLocaleDateString()}` : ''}
                </div>
            ` : `
                <button class="close-report-btn" onclick="closeReport(${report.id})" id="closeBtn${report.id}">
                    Provide Solution
                </button>
            `}
        </div>
    `).join('');
    
    containerDiv.innerHTML = reportsHtml;
    containerDiv.style.display = 'block';
    errorDiv.style.display = 'none';
}

function closeReport(reportId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showReportsError('Please log in to close reports');
        return;
    }
    
    // Get the report data and show solution input section
    fetchMethod(`/api/reports/${reportId}`, (status, data) => {
        if (status === 200 && data) {
            reportToClose = data;
            showSolutionInputSection();
        } else {
            console.error('Error fetching report:', status, data);
            showReportsError('Failed to load report details: ' + (data?.error || 'Server error'));
        }
    }, 'GET');
}

function submitClosingSolution() {
    const solutionText = document.getElementById('closingSolutionText').value.trim();
    
    if (!solutionText) {
        showAlert.warning('Please provide a solution before closing the report.', {
            title: 'Missing Solution',
            duration: 4000
        });
        return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser || !reportToClose) return;
    
    const submitBtn = document.getElementById('submitCloseSolutionBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Closing Report...';
    
    fetchMethod(`/api/reports/${reportToClose.id}/close`, (status, data) => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Close Report with Solution';
        
        if (status === 200 && data) {
            showCloseResults(data);
            reportToClose = null;
        } else {
            console.error('Error closing report:', status, data);
            showAlert.error('Failed to close report: ' + (data?.error || 'Server error'), {
                title: 'Close Failed',
                duration: 5000
            });
        }
    }, 'PATCH', {
        closer_id: currentUser.id,
        solution: solutionText
    });
}

function showReportsError(message) {
    const errorDiv = document.getElementById('errorReports');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showCloseSuccess(reportId, badgeAwarded) {
    console.log(`Report ${reportId} closed successfully`);
    
    if (badgeAwarded) {
        // Show badge award notification
        const successMessage = `🎉 Congratulations! You earned the "${badgeAwarded}" badge for closing reports!`;
        
        // Create and show badge notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #28a745, #20c997);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            z-index: 1000;
            font-weight: bold;
            max-width: 300px;
            animation: slideInRight 0.5s ease-out;
        `;
        notification.textContent = successMessage;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
        
        console.log(`🏆 Badge awarded: ${badgeAwarded}`);
    }
}

function resetState() {
    selectedVulnerability = null;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}