// Notifications Management
export default class Notifications {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.maxNotifications = 5;
        this.autoHideDelay = 5000; // 5 seconds
        this.init();
    }
    
    init() {
        // Create notifications container if it doesn't exist
        if (!document.getElementById('notifications-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notifications-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notifications-container');
        }
        
        // Load stored notifications
        this.loadStoredNotifications();
    }
    
    show(options) {
        const notification = {
            id: Date.now() + Math.random(),
            type: options.type || 'info',
            title: options.title || this.getDefaultTitle(options.type),
            message: options.message || '',
            duration: options.duration || this.autoHideDelay,
            actions: options.actions || [],
            timestamp: new Date().toISOString()
        };
        
        // Add to notifications array
        this.notifications.unshift(notification);
        
        // Limit number of notifications
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }
        
        // Create and show notification element
        this.createNotificationElement(notification);
        
        // Store notification
        this.storeNotification(notification);
        
        // Auto-hide if duration is set
        if (notification.duration > 0) {
            setTimeout(() => {
                this.hide(notification.id);
            }, notification.duration);
        }
        
        return notification.id;
    }
    
    createNotificationElement(notification) {
        const toast = document.createElement('div');
        toast.id = `notification-${notification.id}`;
        toast.className = `toast toast-${notification.type}`;
        
        // Icon based on type
        const icon = this.getIcon(notification.type);
        
        // Actions HTML
        const actionsHTML = notification.actions.length > 0 ? `
            <div class="toast-actions mt-2">
                ${notification.actions.map(action => `
                    <button class="btn btn-sm btn-${action.type || 'primary'}" 
                            data-action="${action.action}" 
                            data-notification-id="${notification.id}">
                        ${action.text}
                    </button>
                `).join('')}
            </div>
        ` : '';
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${notification.title}</div>
                <div class="toast-message">${notification.message}</div>
                ${actionsHTML}
            </div>
            <button class="toast-close" data-notification-id="${notification.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to container
        this.container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Add event listeners
        this.addNotificationEventListeners(toast, notification.id);
    }
    
    addNotificationEventListeners(toast, notificationId) {
        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide(notificationId);
            });
        }
        
        // Action buttons
        const actionBtns = toast.querySelectorAll('[data-action]');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                this.handleAction(action, notificationId);
                this.hide(notificationId);
            });
        });
        
        // Auto-remove when animation ends
        toast.addEventListener('animationend', (e) => {
            if (e.animationName === 'toastProgress' && e.target === toast) {
                this.hide(notificationId);
            }
        });
    }
    
    hide(notificationId) {
        const toast = document.getElementById(`notification-${notificationId}`);
        if (!toast) return;
        
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            // Remove from notifications array
            const index = this.notifications.findIndex(n => n.id === notificationId);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }
    
    hideAll() {
        const toasts = this.container.querySelectorAll('.toast');
        toasts.forEach(toast => {
            const notificationId = toast.id.replace('notification-', '');
            this.hide(notificationId);
        });
    }
    
    getDefaultTitle(type) {
        switch (type) {
            case 'success':
                return 'Sucesso!';
            case 'error':
                return 'Erro!';
            case 'warning':
                return 'Atenção!';
            case 'info':
                return 'Informação';
            default:
                return 'Notificação';
        }
    }
    
    getIcon(type) {
        switch (type) {
            case 'success':
                return 'fas fa-check-circle';
            case 'error':
                return 'fas fa-exclamation-circle';
            case 'warning':
                return 'fas fa-exclamation-triangle';
            case 'info':
                return 'fas fa-info-circle';
            default:
                return 'fas fa-bell';
        }
    }
    
    handleAction(action, notificationId) {
        switch (action) {
            case 'reload':
                window.location.reload();
                break;
            case 'dashboard':
                if (window.app) {
                    window.app.loadPage('dashboard');
                }
                break;
            case 'settings':
                if (window.app) {
                    window.app.loadPage('configuracoes');
                }
                break;
            // Add more actions as needed
        }
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('notification:action', {
            detail: { action, notificationId }
        }));
    }
    
    storeNotification(notification) {
        try {
            const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
            stored.unshift(notification);
            
            // Keep only last 50 notifications
            if (stored.length > 50) {
                stored.length = 50;
            }
            
            localStorage.setItem('notifications', JSON.stringify(stored));
        } catch (error) {
            console.error('❌ Erro ao armazenar notificação:', error);
        }
    }
    
    loadStoredNotifications() {
        try {
            const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
            this.notifications = stored.slice(0, this.maxNotifications);
        } catch (error) {
            console.error('❌ Erro ao carregar notificações armazenadas:', error);
        }
    }
    
    getUnreadCount() {
        return this.notifications.length;
    }
    
    showSuccess(message, options = {}) {
        return this.show({
            type: 'success',
            message,
            ...options
        });
    }
    
    showError(message, options = {}) {
        return this.show({
            type: 'error',
            message,
            ...options
        });
    }
    
    showWarning(message, options = {}) {
        return this.show({
            type: 'warning',
            message,
            ...options
        });
    }
    
    showInfo(message, options = {}) {
        return this.show({
            type: 'info',
            message,
            ...options
        });
    }
    
    showConfirm(message, options = {}) {
        return this.show({
            type: 'warning',
            title: 'Confirmação',
            message,
            duration: 0, // Don't auto-hide
            actions: [
                {
                    text: options.confirmText || 'Confirmar',
                    type: 'primary',
                    action: 'confirm'
                },
                {
                    text: options.cancelText || 'Cancelar',
                    type: 'ghost',
                    action: 'cancel'
                }
            ],
            ...options
        });
    }
    
    // Advanced notification types
    showProgress(title, message) {
        const notificationId = this.show({
            type: 'info',
            title,
            message,
            duration: 0 // Don't auto-hide
        });
        
        return {
            update: (newMessage, newTitle = null) => {
                const toast = document.getElementById(`notification-${notificationId}`);
                if (toast) {
                    const messageEl = toast.querySelector('.toast-message');
                    if (messageEl) {
                        messageEl.textContent = newMessage;
                    }
                    
                    if (newTitle) {
                        const titleEl = toast.querySelector('.toast-title');
                        if (titleEl) {
                            titleEl.textContent = newTitle;
                        }
                    }
                }
            },
            complete: (success = true, finalMessage = null) => {
                const toast = document.getElementById(`notification-${notificationId}`);
                if (toast) {
                    if (finalMessage) {
                        const messageEl = toast.querySelector('.toast-message');
                        if (messageEl) {
                            messageEl.textContent = finalMessage;
                        }
                    }
                    
                    // Change icon based on success
                    const iconEl = toast.querySelector('.toast-icon i');
                    if (iconEl) {
                        iconEl.className = success ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
                    }
                    
                    // Change type
                    toast.className = `toast toast-${success ? 'success' : 'error'}`;
                    
                    // Auto-hide after 3 seconds
                    setTimeout(() => {
                        this.hide(notificationId);
                    }, 3000);
                }
            },
            dismiss: () => {
                this.hide(notificationId);
            }
        };
    }
    
    showSystemNotification(title, message, options = {}) {
        // Check if browser supports notifications
        if (!("Notification" in window)) {
            return this.showInfo(message, { title, ...options });
        }
        
        // Check if permission is granted
        if (Notification.permission === "granted") {
            this.showBrowserNotification(title, message, options);
        } else if (Notification.permission !== "denied") {
            // Request permission
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.showBrowserNotification(title, message, options);
                } else {
                    // Fallback to in-app notification
                    this.showInfo(message, { title, ...options });
                }
            });
        } else {
            // Fallback to in-app notification
            this.showInfo(message, { title, ...options });
        }
    }
    
    showBrowserNotification(title, message, options = {}) {
        const notification = new Notification(title, {
            body: message,
            icon: options.icon || '/favicon.ico',
            badge: options.badge || '/favicon.ico',
            tag: options.tag || 'taxi-system',
            requireInteraction: options.requireInteraction || false,
            silent: options.silent || false
        });
        
        // Handle click
        notification.onclick = () => {
            window.focus();
            notification.close();
            
            if (options.onClick) {
                options.onClick();
            }
        };
        
        // Auto-close after 5 seconds if not requireInteraction
        if (!options.requireInteraction) {
            setTimeout(() => {
                notification.close();
            }, 5000);
        }
        
        return notification;
    }
    
    // Batch operations
    showBatch(messages, type = 'info') {
        const results = [];
        
        messages.forEach((msg, index) => {
            setTimeout(() => {
                const id = this.show({
                    type,
                    message: msg.message,
                    title: msg.title || `Item ${index + 1} de ${messages.length}`,
                    duration: 3000
                });
                results.push(id);
            }, index * 500); // Stagger notifications
        });
        
        return results;
    }
    
    // Notification history
    getHistory(limit = 20) {
        try {
            const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
            return stored.slice(0, limit);
        } catch (error) {
            console.error('❌ Erro ao obter histórico de notificações:', error);
            return [];
        }
    }
    
    clearHistory() {
        localStorage.removeItem('notifications');
        this.notifications = [];
    }
    
    // Cleanup
    destroy() {
        this.hideAll();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}