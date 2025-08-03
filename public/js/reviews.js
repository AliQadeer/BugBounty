document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadAllSolutions();
});

let selectedRating = 0;
let editingReviewId = null;
let deletingReviewId = null;
let currentReportId = null;

function setupEventListeners() {
    // Tab switching
    document.getElementById('allSolutionsTab').addEventListener('click', () => switchTab('all'));
    document.getElementById('mySolutionsTab').addEventListener('click', () => switchTab('my'));
    
    // Modal handlers
    setupModalHandlers();
    
    // Star rating for add review modal
    setupStarRating('.add-stars', 'addRatingValue');
    
    // Star rating for edit modal
    setupStarRating('.edit-stars', 'editRatingValue');
    
    // Form submissions
    document.getElementById('addReviewForm').addEventListener('submit', handleAddReviewSubmit);
    document.getElementById('editReviewForm').addEventListener('submit', handleEditReviewSubmit);
    
    // Delete confirmation
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteConfirm);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    
    // Cancel buttons
    document.getElementById('cancelAdd').addEventListener('click', closeAddReviewModal);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
}

function setupStarRating(selector, inputId) {
    const starContainer = document.querySelector(selector);
    if (!starContainer) return;
    
    const stars = starContainer.querySelectorAll('.star');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            document.getElementById(inputId).value = rating;
            updateStarDisplay(starContainer, rating);
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            updateStarDisplay(starContainer, rating);
        });
    });
    
    starContainer.addEventListener('mouseleave', function() {
        const currentRating = parseInt(document.getElementById(inputId).value) || 0;
        updateStarDisplay(starContainer, currentRating);
    });
}

function updateStarDisplay(container, rating) {
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function switchTab(tab) {
    const allTab = document.getElementById('allSolutionsTab');
    const myTab = document.getElementById('mySolutionsTab');
    const allSolutions = document.getElementById('allSolutions');
    const mySolutions = document.getElementById('mySolutions');
    
    if (tab === 'all') {
        allTab.classList.add('active');
        myTab.classList.remove('active');
        allSolutions.classList.add('active');
        mySolutions.classList.remove('active');
        loadAllSolutions();
    } else {
        myTab.classList.add('active');
        allTab.classList.remove('active');
        mySolutions.classList.add('active');
        allSolutions.classList.remove('active');
        loadMySolutions();
    }
}

function loadAllSolutions() {
    const container = document.getElementById('allSolutionsList');
    container.innerHTML = '<div class="loading-solutions">Loading solutions...</div>';
    
    fetchMethod('/api/solution-reviews/solutions', (status, data) => {
        if (status === 200) {
            displaySolutions(data, container, false);
        } else {
            container.innerHTML = '<div class="empty-solutions">Failed to load solutions</div>';
        }
    }, 'GET');
}

function loadMySolutions() {
    const container = document.getElementById('mySolutionsList');
    container.innerHTML = '<div class="loading-solutions">Loading your solutions...</div>';
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        container.innerHTML = '<div class="empty-solutions">Please log in to view your solutions</div>';
        return;
    }
    
    fetchMethod('/api/solution-reviews/solutions', (status, data) => {
        if (status === 200) {
            // Filter solutions by current user
            const mySolutions = data.filter(solution => solution.user_id === currentUser.id);
            displaySolutions(mySolutions, container, true);
        } else {
            container.innerHTML = '<div class="empty-solutions">Failed to load your solutions</div>';
        }
    }, 'GET');
}

function displaySolutions(solutions, container, isMyTab = false) {
    if (solutions.length === 0) {
        container.innerHTML = '<div class="empty-solutions">No solutions found</div>';
        return;
    }
    
    const currentUser = getCurrentUser();
    
    const html = solutions.map(solution => {
        const avgRating = solution.avg_rating ? parseFloat(solution.avg_rating).toFixed(1) : 'No ratings';
        const reviewCount = solution.review_count || 0;
        
        return `
            <div class="solution-item">
                <div class="solution-header">
                    <div class="vulnerability-info">
                        <h4>${escapeHtml(solution.type)}</h4>
                        <p class="vulnerability-desc">${escapeHtml(solution.description)}</p>
                        <div class="solution-meta">
                            <span class="points">Points: ${solution.points}</span>
                            <span class="reporter">By: ${escapeHtml(solution.reporter_username)}</span>
                            ${solution.closer_username ? `<span class="closer">Closed by: ${escapeHtml(solution.closer_username)}</span>` : ''}
                        </div>
                    </div>
                    <div class="rating-info">
                        <div class="avg-rating">
                            ${typeof avgRating === 'string' ? avgRating : `${generateStarRating(Math.round(avgRating))} (${avgRating})`}
                        </div>
                        <div class="review-count">${reviewCount} review${reviewCount !== 1 ? 's' : ''}</div>
                    </div>
                </div>
                
                <div class="solution-content">
                    <h5>Solution:</h5>
                    <p class="solution-text">${escapeHtml(solution.solution || 'No solution provided yet')}</p>
                </div>
                
                <div class="solution-actions">
                    <button class="action-btn" onclick="loadSolutionReviews(${solution.id})">View Reviews</button>
                    ${currentUser && currentUser.id !== solution.user_id ? 
                        `<button class="action-btn primary" onclick="openAddReviewModal(${solution.id})">Add Review</button>` 
                        : ''}
                </div>
                
                <div id="reviews-${solution.id}" class="solution-reviews" style="display: none;">
                    <!-- Reviews will be loaded here -->
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function loadSolutionReviews(reportId) {
    const reviewsContainer = document.getElementById(`reviews-${reportId}`);
    const isVisible = reviewsContainer.style.display !== 'none';
    
    if (isVisible) {
        reviewsContainer.style.display = 'none';
        return;
    }
    
    reviewsContainer.innerHTML = '<div class="loading-reviews">Loading reviews...</div>';
    reviewsContainer.style.display = 'block';
    
    fetchMethod(`/api/solution-reviews/report/${reportId}`, (status, data) => {
        if (status === 200) {
            displaySolutionReviews(data, reviewsContainer, reportId);
        } else {
            reviewsContainer.innerHTML = '<div class="empty-reviews">Failed to load reviews</div>';
        }
    }, 'GET');
}

function displaySolutionReviews(reviews, container, reportId) {
    if (reviews.length === 0) {
        container.innerHTML = '<div class="empty-reviews">No reviews yet for this solution.</div>';
        return;
    }
    
    const currentUser = getCurrentUser();
    
    const html = reviews.map(review => {
        const canEdit = currentUser && review.user_id === currentUser.id;
        
        return `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-user">${escapeHtml(review.username)}</div>
                    <div class="review-rating">
                        ${generateStarRating(review.rating)}
                    </div>
                </div>
                <div class="review-comment">${escapeHtml(review.comment)}</div>
                <div class="review-meta">
                    <div class="review-date">${formatDate(review.created_at)}</div>
                    ${canEdit ? `
                        <div class="review-actions">
                            <button class="edit-btn" onclick="openEditModal(${review.id}, ${review.rating}, '${escapeHtml(review.comment).replace(/'/g, "\\'")}')">Edit</button>
                            <button class="delete-btn" onclick="openDeleteModal(${review.id})">Delete</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function openAddReviewModal(reportId) {
    currentReportId = reportId;
    document.getElementById('addReportId').value = reportId;
    document.getElementById('addRatingValue').value = 0;
    document.getElementById('addComment').value = '';
    updateStarDisplay(document.querySelector('.add-stars'), 0);
    document.getElementById('addReviewModal').style.display = 'block';
}

function closeAddReviewModal() {
    document.getElementById('addReviewModal').style.display = 'none';
    currentReportId = null;
    clearError('addError');
}

function handleAddReviewSubmit(e) {
    e.preventDefault();
    
    const rating = parseInt(document.getElementById('addRatingValue').value);
    const comment = document.getElementById('addComment').value.trim();
    const reportId = document.getElementById('addReportId').value;
    
    if (rating === 0) {
        showError('addError', 'Please select a rating');
        return;
    }
    
    if (!comment) {
        showError('addError', 'Please enter a review comment');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    const reviewData = {
        report_id: reportId,
        rating: rating,
        comment: comment
    };
    
    const token = getStoredToken();
    fetchMethod('/api/solution-reviews', (status, data) => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';
        
        if (status === 201) {
            closeAddReviewModal();
            loadAllSolutions(); // Refresh the solutions to update avg ratings
            // Also refresh reviews if they're currently displayed
            const reviewsContainer = document.getElementById(`reviews-${reportId}`);
            if (reviewsContainer.style.display !== 'none') {
                loadSolutionReviews(reportId);
            }
        } else {
            let errorMessage = 'Failed to submit review';
            if (data.error) {
                errorMessage = data.error;
            }
            showError('addError', errorMessage);
        }
    }, 'POST', reviewData, token);
}

function openEditModal(reviewId, rating, comment) {
    editingReviewId = reviewId;
    
    document.getElementById('editRatingValue').value = rating;
    document.getElementById('editComment').value = comment;
    
    // Update star display
    updateStarDisplay(document.querySelector('.edit-stars'), rating);
    
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingReviewId = null;
    clearError('editError');
}

function handleEditReviewSubmit(e) {
    e.preventDefault();
    
    const rating = parseInt(document.getElementById('editRatingValue').value);
    const comment = document.getElementById('editComment').value.trim();
    
    if (rating === 0) {
        showError('editError', 'Please select a rating');
        return;
    }
    
    if (!comment) {
        showError('editError', 'Please enter a review comment');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    const reviewData = {
        rating: rating,
        comment: comment
    };
    
    const token = getStoredToken();
    fetchMethod(`/api/solution-reviews/${editingReviewId}`, (status, data) => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Review';
        
        if (status === 200) {
            closeEditModal();
            loadAllSolutions(); // Refresh to update ratings
        } else {
            let errorMessage = 'Failed to update review';
            if (data.error) {
                errorMessage = data.error;
            }
            showError('editError', errorMessage);
        }
    }, 'PUT', reviewData, token);
}

function openDeleteModal(reviewId) {
    deletingReviewId = reviewId;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deletingReviewId = null;
    clearError('deleteError');
}

function handleDeleteConfirm() {
    if (!deletingReviewId) return;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting...';
    
    const token = getStoredToken();
    fetchMethod(`/api/solution-reviews/${deletingReviewId}`, (status, data) => {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Delete';
        
        if (status === 200) {
            closeDeleteModal();
            loadAllSolutions(); // Refresh to update ratings
        } else {
            let errorMessage = 'Failed to delete review';
            if (data.error) {
                errorMessage = data.error;
            }
            showError('deleteError', errorMessage);
        }
    }, 'DELETE', null, token);
}

function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<span class="star active">★</span>';
        } else {
            stars += '<span class="star">★</span>';
        }
    }
    return stars;
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

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}