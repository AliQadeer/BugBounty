document.addEventListener('DOMContentLoaded', function() {
    loadUserReputation();
    loadShopItems();
    setupEventListeners();
});

let allShopItems = [];
let userOwnedItems = [];
let selectedItem = null;
let mysteryQuizData = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizScore = 0;

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
    
    // Mystery quiz handlers
    document.getElementById('nextQuestionBtn').addEventListener('click', nextMysteryQuestion);
    document.getElementById('submitQuizBtn').addEventListener('click', submitMysteryQuiz);
    
    // Pop-up handlers
    document.getElementById('successOkBtn').addEventListener('click', closeSuccessPopup);
    document.getElementById('failureOkBtn').addEventListener('click', closeFailurePopup);
    document.getElementById('checkProfileBtn').addEventListener('click', goToProfile);
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
    
    // Check if this is a mystery box item
    if (itemType === 'mystery') {
        openMysteryQuizModal();
        return;
    }
    
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
        shop_item_id: selectedItem.id
    };
    
    API.purchaseItem(purchaseData, function(status, data) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Purchase';
        
        console.log('Purchase response:', status, data); // Debug log
        
        if (status === 200 || status === 201) {
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
            if (modal.id === 'mysteryQuizModal') {
                closeMysteryQuizModal();
            } else if (modal.id === 'mysterySuccessPopup') {
                closeSuccessPopup();
            } else if (modal.id === 'mysteryFailurePopup') {
                closeFailurePopup();
            } else {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            if (e.target.id === 'mysteryQuizModal') {
                closeMysteryQuizModal();
            } else if (e.target.id === 'mysterySuccessPopup') {
                closeSuccessPopup();
            } else if (e.target.id === 'mysteryFailurePopup') {
                closeFailurePopup();
            } else {
                e.target.style.display = 'none';
            }
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Mystery Box Quiz Questions (random vulnerability questions)
const mysteryQuizQuestions = {
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

function openMysteryQuizModal() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Check if user can afford the mystery box
    if (user.reputation < selectedItem.cost) {
        alert('Insufficient reputation points!');
        return;
    }
    
    // Generate random quiz from available vulnerability types
    const vulnerabilityTypes = Object.keys(mysteryQuizQuestions);
    const randomType = vulnerabilityTypes[Math.floor(Math.random() * vulnerabilityTypes.length)];
    
    mysteryQuizData = {
        questions: [...mysteryQuizQuestions[randomType]], // Copy questions
        vulnerabilityType: randomType
    };
    
    currentQuestionIndex = 0;
    userAnswers = [];
    quizScore = 0;
    
    document.getElementById('mysteryQuizModal').style.display = 'block';
    showMysteryQuestion();
}

function showMysteryQuestion() {
    const question = mysteryQuizData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / mysteryQuizData.questions.length) * 100;
    
    // Update progress
    document.getElementById('quizProgressFill').style.width = `${progress}%`;
    document.getElementById('quizProgressText').textContent = `Question ${currentQuestionIndex + 1} of ${mysteryQuizData.questions.length}`;
    
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
    document.querySelectorAll('#mysteryQuizModal .answer-option').forEach(option => {
        option.addEventListener('click', selectMysteryAnswer);
    });
    
    // Update buttons
    document.getElementById('nextQuestionBtn').style.display = currentQuestionIndex < mysteryQuizData.questions.length - 1 ? 'inline-block' : 'none';
    document.getElementById('submitQuizBtn').style.display = currentQuestionIndex === mysteryQuizData.questions.length - 1 ? 'inline-block' : 'none';
    document.getElementById('nextQuestionBtn').disabled = true;
    document.getElementById('submitQuizBtn').disabled = true;
}

function selectMysteryAnswer(event) {
    // Remove previous selection
    document.querySelectorAll('#mysteryQuizModal .answer-option').forEach(opt => opt.classList.remove('selected'));
    
    // Mark current selection
    event.target.classList.add('selected');
    
    // Store answer
    const answerIndex = parseInt(event.target.dataset.answer);
    userAnswers[currentQuestionIndex] = answerIndex;
    
    // Enable next/submit button
    document.getElementById('nextQuestionBtn').disabled = false;
    document.getElementById('submitQuizBtn').disabled = false;
}

function nextMysteryQuestion() {
    currentQuestionIndex++;
    showMysteryQuestion();
}

function submitMysteryQuiz() {
    console.log('Submit quiz called');
    console.log('User answers:', userAnswers);
    console.log('Quiz questions length:', mysteryQuizData.questions.length);
    
    // Show loading state
    const submitBtn = document.getElementById('submitQuizBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    // Calculate score
    quizScore = 0;
    for (let i = 0; i < mysteryQuizData.questions.length; i++) {
        if (userAnswers[i] === mysteryQuizData.questions[i].correct) {
            quizScore++;
        }
        console.log(`Question ${i+1}: User answered ${userAnswers[i]}, correct is ${mysteryQuizData.questions[i].correct}`);
    }
    
    console.log('Final score:', quizScore);
    
    if (quizScore === mysteryQuizData.questions.length) {
        console.log('Perfect score - showing success');
        // Perfect score - purchase mystery box and give random item
        handleMysteryBoxPurchase();
    } else {
        console.log('Failed score - showing failure');
        // Failed quiz - still deduct reputation but no reward
        handleMysteryBoxFailure();
    }
    
    // Reset button after a delay (in case of errors)
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 10000);
}

function handleMysteryBoxPurchase() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Get a random item from shop (excluding mystery items and already owned items)
    let availableItems = allShopItems.filter(item => item.type !== 'mystery' && !userOwnedItems.includes(item.id));
    
    if (availableItems.length === 0) {
        showSuccessPopup(null, 'Perfect score! Congratulations! Unfortunately, no new items available to reward right now.');
        closeMysteryQuizModal();
        return;
    }
    
    const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    console.log('Selected random item:', randomItem);
    console.log('User owned items:', userOwnedItems);
    console.log('User reputation:', user.reputation);
    
    // Check if user has enough reputation to "purchase" the item (we'll refund it immediately)
    if (user.reputation < randomItem.cost) {
        // User doesn't have enough reputation for the temporary purchase, so just give them a cheaper item
        const cheaperItems = availableItems.filter(item => item.cost <= user.reputation);
        if (cheaperItems.length === 0) {
            showSuccessPopup(null, 'Perfect score! Congratulations! Unfortunately, your current reputation is too low to process rewards right now.');
            closeMysteryQuizModal();
            return;
        }
        randomItem = cheaperItems[Math.floor(Math.random() * cheaperItems.length)];
    }
    
    // Give the item for FREE as a reward by using the purchase API and then refunding
    const purchaseData = {
        user_id: user.id,
        shop_item_id: randomItem.id
    };
    
    API.purchaseItem(purchaseData, function(status, data) {
        console.log('Purchase API response:', status, data);
        if (status === 200 || status === 201) {
            // Item purchased (reputation deducted), now refund the reputation
            API.getUserById(user.id, function(userStatus, userData) {
                console.log('Get user API response:', userStatus, userData);
                if (userStatus === 200 && userData.length > 0) {
                    const currentUserData = userData[0];
                    const refundedReputation = currentUserData.reputation + randomItem.cost;
                    
                    // Refund the item cost
                    const refundData = { 
                        username: user.username,
                        reputation: refundedReputation 
                    };
                    API.updateUser(user.id, refundData, function(refundStatus, refundResult) {
                        console.log('Refund API response:', refundStatus, refundResult);
                        if (refundStatus === 200) {
                            // Update local user data
                            const updatedUser = { ...user, reputation: refundedReputation };
                            setCurrentUser(updatedUser);
                            document.getElementById('userReputation').textContent = refundedReputation;
                            
                            // Add item to owned items
                            userOwnedItems.push(randomItem.id);
                            
                            // Show success pop-up
                            showSuccessPopup(randomItem);
                            
                            // Close quiz modal immediately
                            closeMysteryQuizModal();
                        } else {
                            document.getElementById('quizError').textContent = 'Error processing reward. Please contact support.';
                            document.getElementById('quizError').style.display = 'block';
                        }
                    });
                }
            });
        } else {
            console.log('Purchase failed, trying different approach...');
            // If purchase fails, show success but with error message
            showSuccessPopup(null, 'Unfortunately, we couldn\'t process your reward right now. Please contact support with this quiz result.');
            closeMysteryQuizModal();
        }
    });
}

function handleMysteryBoxFailure() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Deduct exactly 300 reputation as penalty
    const penaltyAmount = 300;
    const newReputation = user.reputation - penaltyAmount;
    
    if (newReputation < 0) {
        document.getElementById('quizError').textContent = 'Insufficient reputation for mystery box penalty!';
        document.getElementById('quizError').style.display = 'block';
        return;
    }
    
    // Get fresh user data from database to ensure we have the correct username
    API.getUserById(user.id, function(userStatus, userData) {
        console.log('Get user for penalty:', userStatus, userData);
        if (userStatus === 200 && userData.length > 0) {
            const currentUserData = userData[0];
            
            // Update user reputation in database with fresh username from database
            const updateData = { 
                username: currentUserData.username,
                reputation: newReputation 
            };
            console.log('Updating user with data:', updateData);
            
            API.updateUser(user.id, updateData, function(status, data) {
                console.log('Penalty update API response:', status, data);
                if (status === 200) {
                    // Update local user data
                    const updatedUser = { ...user, reputation: newReputation };
                    setCurrentUser(updatedUser);
                    document.getElementById('userReputation').textContent = newReputation;
                    
                    // Show failure pop-up
                    showFailurePopup();
                    
                    // Close quiz modal immediately
                    closeMysteryQuizModal();
                } else {
                    document.getElementById('quizError').textContent = 'Error processing penalty. Please try again.';
                    document.getElementById('quizError').style.display = 'block';
                }
            });
        } else {
            document.getElementById('quizError').textContent = 'Error getting user data. Please try again.';
            document.getElementById('quizError').style.display = 'block';
        }
    });
}

function closeMysteryQuizModal() {
    document.getElementById('mysteryQuizModal').style.display = 'none';
    mysteryQuizData = null;
    currentQuestionIndex = 0;
    userAnswers = [];
    quizScore = 0;
    selectedItem = null;
    
    // Clear messages
    document.getElementById('quizError').style.display = 'none';
    document.getElementById('quizSuccess').style.display = 'none';
}

function showSuccessPopup(item, errorMessage = null) {
    if (errorMessage) {
        // Hide reward showcase and show error message
        document.querySelector('.reward-showcase').style.display = 'none';
        document.querySelector('.profile-reminder').style.display = 'none';
        document.getElementById('checkProfileBtn').style.display = 'none';
        document.getElementById('successMessage').innerHTML = errorMessage;
    } else if (item) {
        // Show reward showcase with item details
        document.querySelector('.reward-showcase').style.display = 'block';
        document.querySelector('.profile-reminder').style.display = 'block';
        document.getElementById('checkProfileBtn').style.display = 'inline-block';
        
        // Set item image
        const rewardImage = document.getElementById('rewardItemImage');
        const imagePath = `../images/${item.asset_url || item.name.toLowerCase().replace(/\s+/g, ' ') + '.png'}`;
        rewardImage.src = imagePath;
        rewardImage.onerror = function() {
            this.style.display = 'none';
            this.parentElement.innerHTML = '<div style="color: #FFD700; font-size: 2rem;">🎁</div>';
        };
        
        // Set item details
        document.getElementById('rewardItemName').textContent = item.name;
        document.getElementById('rewardItemType').textContent = item.type.charAt(0).toUpperCase() + item.type.slice(1);
        document.getElementById('rewardItemValue').textContent = `Worth: ${item.cost} reputation`;
        
        // Clear additional message
        document.getElementById('successMessage').innerHTML = '';
    } else {
        // No item case
        document.querySelector('.reward-showcase').style.display = 'none';
        document.querySelector('.profile-reminder').style.display = 'none';
        document.getElementById('checkProfileBtn').style.display = 'none';
        document.getElementById('successMessage').innerHTML = 'Congratulations on your perfect score!';
    }
    
    document.getElementById('mysterySuccessPopup').style.display = 'block';
}

function showFailurePopup() {
    const message = `
        <strong>You scored ${quizScore} out of ${mysteryQuizData.questions.length} questions correctly.</strong><br><br>
        You need a perfect score (5/5) to win an item.<br><br>
        <div style="color: #FFB6C1; font-weight: bold;">
            💸 300 reputation has been deducted as penalty
        </div>
        <div style="font-size: 0.9em; margin-top: 15px; opacity: 0.8;">
            Study harder and try again to win amazing rewards!
        </div>
    `;
    
    document.getElementById('failureMessage').innerHTML = message;
    document.getElementById('mysteryFailurePopup').style.display = 'block';
}

function closeSuccessPopup() {
    document.getElementById('mysterySuccessPopup').style.display = 'none';
    // Refresh shop display
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    filterItems(activeFilter);
}

function closeFailurePopup() {
    document.getElementById('mysteryFailurePopup').style.display = 'none';
}

function goToProfile() {
    // Close the success popup first
    closeSuccessPopup();
    // Navigate to profile page
    window.location.href = 'profile.html';
}