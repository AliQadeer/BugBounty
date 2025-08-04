document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    setupModalHandlers();
});

let currentSelectedItem = null;

// GitHub image URL mapping function
function getGitHubImageUrl(itemName) {
    const baseUrl = 'https://raw.githubusercontent.com/jeeejeeb/IMAGESCA2/main/';
    const imageMap = {
        'cyber helmet': 'cyber%20helmet.png',
        'diamond knuckles': 'diamond%20knuckles.png',
        'fire gauntlets': 'fire%20gauntlets.png',
        'frost cape': 'frost%20cape.png',
        'gas mask': 'gas%20mask.png',
        'golden crown': 'golden%20crown.png',
        'golden skull mask': 'golden%20skull%20mask.png',
        'inferno cloak': 'inferno%20cloak.png',
        'iron stompers': 'iron%20stompers.png',
        'lava boots': 'lava%20boots.png',
        'mystery quiz item box': 'mystery%20quiz%20item%20box.png',
        'ninja mask': 'ninja%20mask.png',
        'phantom cape': 'phantom%20cape.png',
        'royal blue cape': 'royal%20blue%20cape.png',
        'samurai headband': 'samurai%20headband.png',
        'shadow gloves': 'shadow%20gloves.png',
        'shadow walkers': 'shadow%20walkers.png',
        'silken gloves': 'silken%20gloves.png',
        'speed boots': 'speed%20boots.png',
        'vigilante mask': 'vigilante%20mask.png',
        'wizard hat': 'wizard%20hat.png'
    };
    
    const fileName = imageMap[itemName.toLowerCase()] || itemName.toLowerCase().replace(/\s+/g, '%20') + '.png';
    return baseUrl + fileName;
}

function loadUserProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Update basic user info
    document.getElementById('userRank').textContent = user.rank_name || 'Bronze Hunter';
    document.getElementById('userReputation').textContent = user.reputation || 0;
    document.getElementById('totalReputation').textContent = user.reputation || 0;
    
    // Load fresh user data
    API.getUserById(user.id, function(status, data) {
        if (status === 200 && data.length > 0) {
            const userData = data[0];
            updateUserDisplay(userData);
            updateCurrentUser(userData);
        }
    });
    
    // Load user inventory
    loadUserInventory(user.id);
    
    // Load user badges (placeholder for now)
    loadUserBadges();
    
    // Load user statistics
    loadUserStatistics();
    
    // Update rank progress
    updateRankProgress(user.reputation || 0);
}

function updateUserDisplay(userData) {
    document.getElementById('userRank').textContent = userData.rank_name ? `${userData.rank_name} Hunter` : 'Bronze Hunter';
    document.getElementById('userReputation').textContent = userData.reputation || 0;
    document.getElementById('totalReputation').textContent = userData.reputation || 0;
    
    updateRankProgress(userData.reputation || 0);
}

function updateCurrentUser(userData) {
    const updatedUser = {
        id: userData.id,
        username: userData.username,
        reputation: userData.reputation,
        rank_id: userData.rank_id,
        rank_name: userData.rank_name
    };
    setCurrentUser(updatedUser);
}

function loadUserInventory(userId) {
    const container = document.getElementById('userItems');
    container.innerHTML = '<div class="loading">Loading items...</div>';
    
    API.getUserInventory(userId, function(status, data) {
        if (status === 200) {
            displayUserItems(data);
        } else {
            displayEmptyInventory();
        }
    });
}

function displayUserItems(items) {
    const container = document.getElementById('userItems');
    
    if (items.length === 0) {
        displayEmptyInventory();
        return;
    }
    
    const html = items.map(item => `
        <div class="item-slot ${item.equipped ? 'equipped' : ''}" onclick="openItemModal(${item.item_id}, '${escapeHtml(item.name)}', '${escapeHtml(item.type)}', ${item.equipped || false})">
            <img src="${getGitHubImageUrl(item.name)}" 
                 alt="${escapeHtml(item.name)}" 
                 class="item-image"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
            <div class="empty-slot" style="display: none;">${escapeHtml(item.name)}</div>
            ${item.equipped ? '<div class="equipped-indicator">EQUIPPED</div>' : ''}
        </div>
    `).join('');
    
    // Fill remaining slots up to 12
    const remainingSlots = Math.max(0, 12 - items.length);
    const emptySlots = Array(remainingSlots).fill('<div class="item-slot"><div class="empty-slot">Empty</div></div>').join('');
    
    container.innerHTML = html + emptySlots;
}

function displayEmptyInventory() {
    const container = document.getElementById('userItems');
    const emptySlots = Array(12).fill('<div class="item-slot"><div class="empty-slot">Empty</div></div>').join('');
    container.innerHTML = emptySlots;
}

function loadUserBadges() {
    const container = document.getElementById('userBadges');
    const user = getCurrentUser();
    
    if (!user) {
        displayEmptyBadges();
        return;
    }
    
    container.innerHTML = '<div class="loading">Loading badges...</div>';
    
    API.getUserBadges(user.id, function(status, data) {
        if (status === 200 && data) {
            displayUserBadges(data);
        } else {
            displayEmptyBadges();
        }
    });
}

function displayUserBadges(badges) {
    const container = document.getElementById('userBadges');
    
    if (badges.length === 0) {
        displayEmptyBadges();
        return;
    }
    
    const html = badges.map(badge => `
        <div class="badge-item earned">
            <div class="badge-name">${escapeHtml(badge.name)}</div>
            <div class="badge-description">Earned for ${escapeHtml(badge.vulnerability_type)} expertise</div>
            <div class="badge-date">Awarded: ${badge.awarded_at ? new Date(badge.awarded_at).toLocaleDateString() : 'Recently'}</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

function displayEmptyBadges() {
    const container = document.getElementById('userBadges');
    container.innerHTML = `
        <div class="no-badges">
            <p>No badges earned yet!</p>
            <p>Close 15 reports of the same vulnerability type to earn badges.</p>
        </div>
    `;
}

function loadUserStatistics() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Use existing getAllReports endpoint to calculate user statistics
    API.getAllReports(function(status, data) {
        if (status === 200) {
            calculateUserStatistics(data, user.id);
        } else {
            // Set default values if API fails
            document.getElementById('reportsSubmitted').textContent = '0';
            document.getElementById('reportsClosed').textContent = '0';
        }
    });
}

function calculateUserStatistics(allReports, userId) {
    // Count reports submitted by this user (reports they originally created/found)
    const reportsSubmitted = allReports.filter(report => report.user_id === userId).length;
    
    // Count reports closed by this user (status = 1 and closer_id = userId)
    // Use closer_id to identify who actually closed the report
    const reportsClosed = allReports.filter(report => report.status === 1 && report.closer_id === userId).length;
    
    // Update the display
    document.getElementById('reportsSubmitted').textContent = reportsSubmitted.toString();
    document.getElementById('reportsClosed').textContent = reportsClosed.toString();
    document.getElementById('totalReputation').textContent = user.reputation || '0';
}

function updateRankProgress(reputation) {
    const ranks = [
        { name: 'Bronze', min: 0, max: 100 },
        { name: 'Silver', min: 101, max: 300 },
        { name: 'Gold', min: 301, max: 600 },
        { name: 'Expert', min: 601, max: 999 },
        { name: 'Legend', min: 1000, max: 1499 },
        { name: 'Master', min: 1500, max: 1999 },
        { name: 'Grandmaster', min: 2000, max: Infinity }
    ];
    
    let currentRank = ranks.find(rank => reputation >= rank.min && reputation <= rank.max) || ranks[0];
    let nextRank = ranks.find(rank => rank.min > reputation);
    
    if (nextRank) {
        const progress = ((reputation - currentRank.min) / (nextRank.min - currentRank.min)) * 100;
        document.querySelector('.progress-fill').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('rankProgress').textContent = `${reputation} / ${nextRank.min}`;
    } else {
        document.querySelector('.progress-fill').style.width = '100%';
        document.getElementById('rankProgress').textContent = `${reputation} (Max Rank)`;
    }
}

function openItemModal(itemId, itemName, itemType, isEquipped) {
    currentSelectedItem = { id: itemId, name: itemName, type: itemType, equipped: isEquipped };
    
    document.getElementById('modalItemName').textContent = itemName;
    document.getElementById('modalItemType').textContent = `Type: ${itemType}`;
    
    // Set item image
    const modalImage = document.getElementById('modalItemImage');
    modalImage.src = getGitHubImageUrl(itemName);
    modalImage.onerror = function() {
        this.style.display = 'none';
    };
    
    // Show/hide equip buttons based on current equipped status
    const equipBtn = document.getElementById('equipItemBtn');
    const unequipBtn = document.getElementById('unequipItemBtn');
    
    if (equipBtn && unequipBtn) {
        if (isEquipped) {
            equipBtn.style.display = 'none';
            unequipBtn.style.display = 'inline-block';
        } else {
            equipBtn.style.display = 'inline-block';
            unequipBtn.style.display = 'none';
        }
    }
    
    document.getElementById('itemModal').style.display = 'block';
}

function setupModalHandlers() {
    // Close modal
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Equip item button
    const equipBtn = document.getElementById('equipItemBtn');
    if (equipBtn) {
        equipBtn.addEventListener('click', equipItem);
    }
    
    // Unequip item button
    const unequipBtn = document.getElementById('unequipItemBtn');
    if (unequipBtn) {
        unequipBtn.addEventListener('click', unequipItem);
    }
}

function equipItem() {
    if (!currentSelectedItem) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    const equipBtn = document.getElementById('equipItemBtn');
    equipBtn.disabled = true;
    equipBtn.textContent = 'Equipping...';
    
    const equipData = {
        user_id: user.id,
        shop_item_id: currentSelectedItem.id
    };
    
    API.equipItem(equipData, function(status, data) {
        equipBtn.disabled = false;
        equipBtn.textContent = 'Equip';
        
        if (status === 200) {
            // Success - refresh inventory and close modal
            document.getElementById('itemModal').style.display = 'none';
            loadUserInventory(user.id);
            showSuccess('equipSuccess', `${currentSelectedItem.name} equipped successfully!`);
        } else {
            let errorMessage = 'Failed to equip item';
            if (data && data.error) {
                errorMessage = data.error;
            }
            showError('equipError', errorMessage);
        }
    });
}

function unequipItem() {
    if (!currentSelectedItem) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    const unequipBtn = document.getElementById('unequipItemBtn');
    unequipBtn.disabled = true;
    unequipBtn.textContent = 'Unequipping...';
    
    const unequipData = {
        user_id: user.id,
        shop_item_id: currentSelectedItem.id
    };
    
    API.unequipItem(unequipData, function(status, data) {
        unequipBtn.disabled = false;
        unequipBtn.textContent = 'Unequip';
        
        if (status === 200) {
            // Success - refresh inventory and close modal
            document.getElementById('itemModal').style.display = 'none';
            loadUserInventory(user.id);
            showSuccess('equipSuccess', `${currentSelectedItem.name} unequipped successfully!`);
        } else {
            let errorMessage = 'Failed to unequip item';
            if (data && data.error) {
                errorMessage = data.error;
            }
            showError('equipError', errorMessage);
        }
    });
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}