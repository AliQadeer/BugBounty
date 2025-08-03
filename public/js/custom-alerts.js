// Custom Alert System
class CustomAlert {
    constructor() {
        this.container = null;
        this.alerts = [];
        this.init();
    }

    init() {
        // Create alert container if it doesn't exist
        if (!document.querySelector('.alert-container')) {
            this.container = document.createElement('div');
            this.container.className = 'alert-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.alert-container');
        }
    }

    show(options = {}) {
        const {
            type = 'info',
            title = this.getDefaultTitle(type),
            message = '',
            duration = 5000,
            dismissible = true,
            actions = null
        } = options;

        const alertId = 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const alertElement = document.createElement('div');
        alertElement.className = `custom-alert ${type}`;
        alertElement.id = alertId;

        // Create alert content
        alertElement.innerHTML = `
            <div class="alert-header">
                <h4 class="alert-title">
                    <span class="alert-icon"></span>
                    ${title}
                </h4>
                ${dismissible ? '<button class="alert-close" aria-label="Close alert">&times;</button>' : ''}
            </div>
            <div class="alert-body">${message}</div>
            ${actions ? this.createActions(actions, alertId) : ''}
            ${duration > 0 ? '<div class="alert-progress"></div>' : ''}
        `;

        // Add to container
        this.container.appendChild(alertElement);
        this.alerts.push({ id: alertId, element: alertElement, duration });

        // Set up event listeners
        this.setupEventListeners(alertElement, alertId, actions);

        // Auto-dismiss if duration is set
        if (duration > 0) {
            this.setupAutoDismiss(alertElement, alertId, duration);
        }

        return alertId;
    }

    createActions(actions, alertId) {
        const actionsHtml = actions.map(action => {
            const btnClass = action.primary ? 'alert-btn primary' : 'alert-btn';
            return `<button class="${btnClass}" data-action="${action.action}" data-alert-id="${alertId}">
                ${action.text}
            </button>`;
        }).join('');

        return `<div class="alert-actions">${actionsHtml}</div>`;
    }

    setupEventListeners(alertElement, alertId, actions) {
        // Close button
        const closeBtn = alertElement.querySelector('.alert-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.dismiss(alertId));
        }

        // Action buttons
        if (actions) {
            const actionButtons = alertElement.querySelectorAll('[data-action]');
            actionButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const actionName = e.target.dataset.action;
                    const action = actions.find(a => a.action === actionName);
                    if (action && action.callback) {
                        action.callback();
                    }
                    if (action && action.dismissOnClick !== false) {
                        this.dismiss(alertId);
                    }
                });
            });
        }

        // Keyboard navigation
        alertElement.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.dismiss(alertId);
            }
        });
    }

    setupAutoDismiss(alertElement, alertId, duration) {
        const progressBar = alertElement.querySelector('.alert-progress');
        
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.transitionDuration = duration + 'ms';
            
            // Start progress animation
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 10);
        }

        // Auto dismiss
        setTimeout(() => {
            this.dismiss(alertId);
        }, duration);
    }

    dismiss(alertId) {
        const alertData = this.alerts.find(alert => alert.id === alertId);
        if (!alertData) return;

        const alertElement = alertData.element;
        alertElement.classList.add('closing');

        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.parentNode.removeChild(alertElement);
            }
            this.alerts = this.alerts.filter(alert => alert.id !== alertId);
        }, 300);
    }

    dismissAll() {
        this.alerts.forEach(alert => {
            this.dismiss(alert.id);
        });
    }

    getDefaultTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || 'Alert';
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show({ ...options, type: 'success', message });
    }

    error(message, options = {}) {
        return this.show({ ...options, type: 'error', message });
    }

    warning(message, options = {}) {
        return this.show({ ...options, type: 'warning', message });
    }

    info(message, options = {}) {
        return this.show({ ...options, type: 'info', message });
    }

    confirm(options = {}) {
        const {
            title = 'Confirm Action',
            message = 'Are you sure you want to proceed?',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            onConfirm = () => {},
            onCancel = () => {}
        } = options;

        return this.show({
            type: 'warning',
            title,
            message,
            duration: 0, // Don't auto-dismiss
            dismissible: false,
            actions: [
                {
                    text: cancelText,
                    action: 'cancel',
                    callback: onCancel
                },
                {
                    text: confirmText,
                    action: 'confirm',
                    primary: true,
                    callback: onConfirm
                }
            ]
        });
    }
}

// Initialize global alert system
const alertSystem = new CustomAlert();

// Override native alert function
window.originalAlert = window.alert;
window.alert = function(message) {
    alertSystem.error(message, {
        title: 'Alert',
        duration: 0, // Don't auto-dismiss for native alert replacement
        dismissible: true
    });
};

// Global convenience functions
window.showAlert = {
    success: (message, options) => alertSystem.success(message, options),
    error: (message, options) => alertSystem.error(message, options),
    warning: (message, options) => alertSystem.warning(message, options),
    info: (message, options) => alertSystem.info(message, options),
    confirm: (options) => alertSystem.confirm(options),
    dismiss: (id) => alertSystem.dismiss(id),
    dismissAll: () => alertSystem.dismissAll()
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomAlert;
}