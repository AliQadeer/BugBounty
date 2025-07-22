document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadAllReviews();
});

let selectedRating = 0;
let editingReviewId = null;
let deletingReviewId = null;

function setupEventListeners() {
    // Star rating for new review
    setupStarRating('.star-rating:not(.edit-stars)');
    
    // Star rating for edit modal
    setupStarRating('.edit-stars');
    
    // Review form submission
    document.getElementById('reviewForm').addEventListener('submit', handleReviewSubmit);
    
    // Edit review form submission
    document.getElementById('editReviewForm').addEventListener('submit', handleEditReviewSubmit);
    
    // Tab switching
    document.getElementById('allReviewsTab').addEventListener('click', () => switchTab('all'));
    document.getElementById('myReviewsTab').addEventListener('click', () => switchTab('my'));
    
    // Modal handlers
    setupModalHandlers();
    
    // Delete confirmation
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteConfirm);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
}

function setupStarRating(selector) {
    const starContainers = document.querySelectorAll(selector);
    
    starContainers.forEach(container => {
        const stars = container.querySelectorAll('.star');
        const isEditStars = container.classList.contains('edit-stars');
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                
                if (isEditStars) {
                    document.getElementById('editRatingValue').value = rating;
                    updateStarDisplay(container, rating);
                } else {
                    selectedRating = rating;
                    document.getElementById('ratingValue').value = rating;
                    updateStarDisplay(container, rating);
                }
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.dataset.rating);
                updateStarDisplay(container, rating);
            });
        });
        
        container.addEventListener('mouseleave', function() {
            const currentRating = isEditStars ? 
                parseInt(document.getElementById('editRatingValue').value) : 
                selectedRating;
            updateStarDisplay(container, currentRating);
        });
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

function handleReviewSubmit(e) {
    e.preventDefault();
    
    const rating = parseInt(document.getElementById('ratingValue').value);
    const comment = document.getElementById('reviewComment').value.trim();
    
    if (rating === 0) {
        showError('reviewError', 'Please select a rating');
        return;
    }
    
    if (!comment) {
        showError('reviewError', 'Please enter a review comment');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    API.createReview({ rating, comment }, function(status, data) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';
        
        if (status === 201) {
            showSuccess('reviewSuccess', 'Review submitted successfully!');
            
            // Reset form
            document.getElementById('reviewForm').reset();
            selectedRating = 0;
            document.getElementById('ratingValue').value = 0;
            updateStarDisplay(document.querySelector('.star-rating:not(.edit-stars)'), 0);
            
            // Reload reviews
            loadAllReviews();
            
            // Switch to all reviews tab to show the new review
            switchTab('all');
        } else {
            let errorMessage = 'Failed to submit review';
            if (data.error) {
                errorMessage = data.error;
            }
            showError('reviewError', errorMessage);
        }
    });
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
    
    API.updateReview(editingReviewId, { rating, comment }, function(status, data) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Review';
        
        if (status === 200) {
            closeEditModal();
            loadAllReviews();
            if (document.getElementById('myReviewsTab').classList.contains('active')) {
                loadMyReviews();
            }
        } else {
            let errorMessage = 'Failed to update review';
            if (data.error) {
                errorMessage = data.error;
            }
            showError('editError', errorMessage);
        }
    });
}

function switchTab(tab) {
    const allTab = document.getElementById('allReviewsTab');
    const myTab = document.getElementById('myReviewsTab');
    const allReviews = document.getElementById('allReviews');
    const myReviews = document.getElementById('myReviews');
    
    if (tab === 'all') {
        allTab.classList.add('active');
        myTab.classList.remove('active');
        allReviews.classList.add('active');
        myReviews.classList.remove('active');
        loadAllReviews();
    } else {
        myTab.classList.add('active');
        allTab.classList.remove('active');
        myReviews.classList.add('active');
        allReviews.classList.remove('active');
        loadMyReviews();
    }
}

function loadAllReviews() {
    const container = document.getElementById('allReviewsList');
    container.innerHTML = '<div class="loading-reviews">Loading reviews...</div>';
    
    API.getReviews(function(status, data) {
        if (status === 200) {
            displayReviews(data, container, false);
        } else {
            container.innerHTML = '<div class="empty-reviews">Failed to load reviews</div>';
        }
    });
}

function loadMyReviews() {
    const container = document.getElementById('myReviewsList');
    container.innerHTML = '<div class="loading-reviews">Loading your reviews...</div>';
    
    API.getMyReviews(function(status, data) {
        if (status === 200) {
            displayReviews(data, container, true);
        } else {
            container.innerHTML = '<div class="empty-reviews">Failed to load your reviews</div>';
        }
    });
}

function displayReviews(reviews, container, showActions = false) {
    if (reviews.length === 0) {
        container.innerHTML = '<div class="empty-reviews">No reviews found</div>';
        return;
    }
    
    const currentUser = getCurrentUser();
    
    const html = reviews.map(review => {
        const canEdit = showActions || (currentUser && review.username === currentUser.username);
        
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

function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<span class="star">★</span>';
        } else {
            stars += '<span class="star empty">★</span>';
        }
    }
    return stars;
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
    
    // Clear error messages
    const errorElement = document.getElementById('editError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function openDeleteModal(reviewId) {
    deletingReviewId = reviewId;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deletingReviewId = null;
}

function handleDeleteConfirm() {
    if (!deletingReviewId) return;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting...';
    
    API.deleteReview(deletingReviewId, function(status, data) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Delete';
        
        if (status === 200) {
            closeDeleteModal();
            loadAllReviews();
            if (document.getElementById('myReviewsTab').classList.contains('active')) {
                loadMyReviews();
            }
        } else {
            let errorMessage = 'Failed to delete review';
            if (data.error) {
                errorMessage = data.error;
            }
            showError('deleteError', errorMessage);
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
    
    // Cancel buttons
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}