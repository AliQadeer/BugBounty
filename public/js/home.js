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
    
    // This would be a new endpoint to get recent reports
    // For now, show placeholder content
    container.innerHTML = `
        <div class="activity-item">
            <div class="activity-text">Recent bug hunting activity will appear here</div>
            <div class="activity-time">Coming soon</div>
        </div>
    `;
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