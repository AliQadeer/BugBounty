document.addEventListener('DOMContentLoaded', function() {
    loadUserReputation();
    loadShopItems();
    setupEventListeners();
});

let allShopItems = [];
let userOwnedItems = [];
let selectedItem = null;

function loadUserReputation() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('userReputation').textContent = user.reputation || 0;
        
        // Refresh user data
        API.getUserById(user.id, function(status, data) {
            if (status === 200 && data.length > 0) {
                const userData = data[0];
                document.getElementById('userReputation').textContent = userData.reputation || 0;
                
                // Update stored user data
                const updatedUser = { ...user, reputation: userData.reputation };
                setCurrentUser(updatedUser);
            }
        });
    }
}

function loadShopItems() {
    const container = document.getElementById('shopItems');
    container.innerHTML = '<div class="loading">Loading shop items...</div>';
    
    API.getShopItems(function(status, data) {
        if (status === 200) {
            allShopItems = data;
            loadUserInventory();
        } else {
            container.innerHTML = '<div class="empty-shop">Failed to load shop items</div>';
        }
    });
}

function loadUserInventory() {
    const user = getCurrentUser();
    if (!user) return;
    
    API.getUserInventory(user.id, function(status, data) {
        if (status === 200) {
            userOwnedItems = data.map(item => item.item_id);
        } else {
            userOwnedItems = [];
        }
        displayShopItems(allShopItems);
    });
}

function displayShopItems(items) {
    const container = document.getElementById('shopItems');
    
    if (items.length === 0) {
        container.innerHTML = '<div class="empty-shop">No items available</div>';
        return;
    }
    
    const html = items.map(item => {
        const isOwned = userOwnedItems.includes(item.id);
        
        return `
            <div class="shop-item ${isOwned ? 'owned' : ''}" onclick="openPurchaseModal(${item.id}, '${escapeHtml(item.name)}', '${escapeHtml(item.type)}', ${item.cost}, ${isOwned})">
                <div class="item-image-container">
                    <img src="../images/${item.asset_url || item.name.toLowerCase().replace(/\s+/g, ' ') + '.png'}" 
                         alt="${escapeHtml(item.name)}" 
                         class="item-image"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'empty-slot\\'>${escapeHtml(item.name)}</div>'">
                </div>
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-type">${escapeHtml(item.type)}</div>
                <div class="item-cost">
                    <img src="../images/shop_coin.png" alt="Coin" class="coin-icon-small">
                    ${item.cost}
                </div>
                <button class="purchase-btn" ${isOwned ? 'disabled' : ''}>
                    ${isOwned ? 'OWNED' : 'PURCHASE'}
                </button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            const filter = this.dataset.filter;
            filterItems(filter);
        });
    });
    
    // Modal handlers
    setupModalHandlers();
    
    // Purchase confirmation
    document.getElementById('confirmPurchaseBtn').addEventListener('click', handlePurchaseConfirm);
    document.getElementById('cancelPurchaseBtn').addEventListener('click', closePurchaseModal);
}

function filterItems(filter) {
    if (filter === 'all') {
        displayShopItems(allShopItems);
    } else {
        const filteredItems = allShopItems.filter(item => item.type === filter);
        displayShopItems(filteredItems);
    }
}

function openPurchaseModal(itemId, itemName, itemType, cost, isOwned) {
    if (isOwned) return;
    
    selectedItem = { id: itemId, name: itemName, type: itemType, cost: cost };
    
    document.getElementById('modalItemName').textContent = itemName;
    document.getElementById('modalItemType').textContent = `Type: ${itemType}`;
    document.getElementById('modalItemCost').textContent = cost;
    
    // Set item image
    const modalImage = document.getElementById('modalItemImage');
    modalImage.src = `../images/${itemName.toLowerCase().replace(/\s+/g, ' ')}.png`;
    modalImage.onerror = function() {
        this.src = '../images/default-item.png';
    };
    
    // Check if user can afford the item
    const user = getCurrentUser();
    const canAfford = user && user.reputation >= cost;
    
    const confirmBtn = document.getElementById('confirmPurchaseBtn');
    confirmBtn.disabled = !canAfford;
    
    if (!canAfford) {
        showError('purchaseError', 'Insufficient reputation points');
    } else {
        document.getElementById('purchaseError').style.display = 'none';
    }
    
    document.getElementById('purchaseModal').style.display = 'block';
}

function closePurchaseModal() {
    document.getElementById('purchaseModal').style.display = 'none';
    selectedItem = null;
    
    // Clear messages
    document.getElementById('purchaseError').style.display = 'none';
    document.getElementById('purchaseSuccess').style.display = 'none';
}

function handlePurchaseConfirm() {
    if (!selectedItem) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    const confirmBtn = document.getElementById('confirmPurchaseBtn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Purchasing...';
    
    const purchaseData = {
        user_id: user.id,
        item_id: selectedItem.id
    };
    
    API.purchaseItem(purchaseData, function(status, data) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Purchase';
        
        if (status === 200) {
            showSuccess('purchaseSuccess', 'Item purchased successfully!');
            
            // Update user reputation
            const newReputation = user.reputation - selectedItem.cost;
            const updatedUser = { ...user, reputation: newReputation };
            setCurrentUser(updatedUser);
            
            // Update reputation display
            document.getElementById('userReputation').textContent = newReputation;
            
            // Add item to owned items
            userOwnedItems.push(selectedItem.id);
            
            // Refresh shop display
            setTimeout(() => {
                closePurchaseModal();
                
                // Refresh the current filter
                const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
                filterItems(activeFilter);
            }, 2000);
        } else {
            let errorMessage = 'Failed to purchase item';
            if (data.error) {
                errorMessage = data.error;
            }
            showError('purchaseError', errorMessage);
        }
    });
}

function setupModalHandlers() {
    // Close modal when clicking the X
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
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}