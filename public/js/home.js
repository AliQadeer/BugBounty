document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadVulnerabilities();
    setupEventListeners();
});

function loadUserData() {
    const user = getCurrentUser();
    if (user) {
        // Update user display
        document.getElementById('usernameDisplay').textContent = user.username;
        document.getElementById('userReputation').textContent = user.reputation || 0;
        document.getElementById('userRank').textContent = user.rank_name || 'Bronze';
        
        // Refresh user data from server
        API.getUserById(user.id, function(status, data) {
            if (status === 200 && data.length > 0) {
                const userData = data[0];
                const updatedUser = {
                    id: userData.id,
                    username: userData.username,
                    reputation: userData.reputation,
                    rank_id: userData.rank_id,
                    rank_name: userData.rank_name || 'Bronze'
                };
                
                setCurrentUser(updatedUser);
                
                // Update display with fresh data
                document.getElementById('userReputation').textContent = userData.reputation || 0;
                document.getElementById('userRank').textContent = userData.rank_name || 'Bronze';
            }
        });
    }
}

function loadVulnerabilities() {
    const vulnerabilitiesContainer = document.getElementById('vulnerabilitiesList');
    vulnerabilitiesContainer.innerHTML = '<div class="loading">Loading vulnerabilities...</div>';
    
    API.getVulnerabilities(function(status, data) {
        if (status === 200) {
            displayVulnerabilities(data);
        } else {
            vulnerabilitiesContainer.innerHTML = '<div class="error-message">Failed to load vulnerabilities</div>';
        }
    });
}

function displayVulnerabilities(vulnerabilities) {
    const container = document.getElementById('vulnerabilitiesList');
    
    if (vulnerabilities.length === 0) {
        container.innerHTML = '<div class="empty-state">No vulnerabilities available</div>';
        return;
    }
    
    const html = vulnerabilities.map(vuln => `
        <div class="vulnerability-card">
            <div class="vulnerability-type">${escapeHtml(vuln.type)}</div>
            <div class="vulnerability-description">${escapeHtml(vuln.description)}</div>
            <div class="vulnerability-points">${vuln.points} Points</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function loadRecentActivity() {
    const container = document.getElementById('recentReports');
    container.innerHTML = '<div class="loading">Loading recent activity...</div>';
    
    API.getAllReports(function(status, data) {
        if (status === 200) {
            displayRecentActivity(data);
        } else {
            container.innerHTML = '<div class="error-message">Failed to load recent activity</div>';
        }
    });
}

function displayRecentActivity(reports) {
    const container = document.getElementById('recentReports');
    
    if (reports.length === 0) {
        container.innerHTML = '<div class="empty-state">No recent activity</div>';
        return;
    }
    
    // Show only the last 5 reports
    const recentReports = reports.slice(0, 5);
    
    const html = recentReports.map(report => {
        const statusText = report.status === 0 ? 'Reported' : 'Resolved';
        const statusClass = report.status === 0 ? 'status-open' : 'status-closed';
        
        return `
            <div class="activity-item">
                <div class="activity-text">
                    <strong>${escapeHtml(report.username)}</strong> ${statusText.toLowerCase()} 
                    <span class="vulnerability-type">${escapeHtml(report.type)}</span>
                    <span class="activity-points">+${report.points} pts</span>
                </div>
                <div class="activity-status ${statusClass}">${statusText}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function setupEventListeners() {
    // Enter the Realm button
    const enterRealmBtn = document.getElementById('enterRealmBtn');
    if (enterRealmBtn) {
        enterRealmBtn.addEventListener('click', function() {
            window.location.href = 'play.html';
        });
    }
    
    // Load recent activity
    loadRecentActivity();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}