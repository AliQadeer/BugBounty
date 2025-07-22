document.addEventListener('DOMContentLoaded', function() {
    loadLeaderboard();
    loadUserPosition();
});

function loadLeaderboard() {
    const container = document.getElementById('leaderboardList');
    container.innerHTML = '<div class="loading-leaderboard">Loading leaderboard...</div>';
    
    API.getLeaderboard(function(status, data) {
        if (status === 200) {
            displayLeaderboard(data);
        } else {
            container.innerHTML = '<div class="empty-leaderboard">Failed to load leaderboard</div>';
        }
    });
}

function displayLeaderboard(users) {
    const container = document.getElementById('leaderboardList');
    
    if (users.length === 0) {
        container.innerHTML = '<div class="empty-leaderboard">No users found</div>';
        return;
    }
    
    // Sort users by reputation (descending) and take top 10
    const topUsers = users
        .sort((a, b) => b.reputation - a.reputation)
        .slice(0, 10);
    
    const html = topUsers.map((user, index) => {
        const position = index + 1;
        let rankClass = '';
        let positionClass = '';
        
        if (position === 1) {
            rankClass = 'rank-1';
            positionClass = 'top-1';
        } else if (position === 2) {
            rankClass = 'rank-2';
            positionClass = 'top-2';
        } else if (position === 3) {
            rankClass = 'rank-3';
            positionClass = 'top-3';
        }
        
        return `
            <div class="leaderboard-entry ${positionClass}">
                <div class="entry-rank ${rankClass}">${position}</div>
                <div class="entry-name">${escapeHtml(user.username)}</div>
                <div class="entry-title">${escapeHtml(user.rank_name || 'Bronze')}</div>
                <div class="entry-reputation">${user.reputation || 0}</div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function loadUserPosition() {
    const user = getCurrentUser();
    if (!user) return;
    
    API.getLeaderboard(function(status, data) {
        if (status === 200) {
            updateUserPosition(data, user);
        }
    });
}

function updateUserPosition(allUsers, currentUser) {
    const positionCard = document.getElementById('userPosition');
    
    // Sort all users by reputation
    const sortedUsers = allUsers.sort((a, b) => b.reputation - a.reputation);
    
    // Find current user position
    const userIndex = sortedUsers.findIndex(user => user.id === currentUser.id);
    const position = userIndex !== -1 ? userIndex + 1 : '--';
    
    // Update position display
    document.querySelector('.position-rank').textContent = `#${position}`;
    document.querySelector('.position-name').textContent = currentUser.username;
    document.querySelector('.position-title').textContent = currentUser.rank_name || 'Bronze';
    document.querySelector('.position-reputation').textContent = `${currentUser.reputation || 0} RP`;
    
    // Highlight if user is in top 10
    if (position <= 10 && position !== '--') {
        positionCard.classList.add('top-10');
    } else {
        positionCard.classList.remove('top-10');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}