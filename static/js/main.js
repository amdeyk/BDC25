// static/js/main.js
import Utils from './utils.js';

/**
 * Main application functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeTooltips();
    initializePopovers();
    initializeFormValidation();
    initializeSideMenu();
    initializeHelpSystem();
    handleSearchForm();
    
    // Initialize any data tables
    if (typeof $.fn.DataTable !== 'undefined') {
        initializeDataTables();
    }
    
    // Initialize any charts
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }
});

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Initialize Bootstrap popovers
 */
function initializePopovers() {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}

/**
 * Initialize side menu for mobile
 */
function initializeSideMenu() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (!sidebarToggle) return;
    
    sidebarToggle.addEventListener('click', e => {
        e.preventDefault();
        document.body.classList.toggle('sidebar-toggled');
        document.querySelector('.sidebar').classList.toggle('toggled');
    });
}

/**
 * Initialize help system
 */
function initializeHelpSystem() {
    const helpTrigger = document.querySelector('.help-trigger');
    if (!helpTrigger) return;
    
    helpTrigger.addEventListener('click', () => {
        const helpOverlay = document.getElementById('helpOverlay');
        if (helpOverlay) {
            helpOverlay.style.display = helpOverlay.style.display === 'none' ? 'flex' : 'none';
        }
    });
    
    // Close help when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.closest('.help-trigger') || e.target.closest('.help-content')) return;
        
        const helpOverlay = document.getElementById('helpOverlay');
        if (helpOverlay && helpOverlay.style.display !== 'none') {
            helpOverlay.style.display = 'none';
        }
    });
    
    // Show help content for specific features
    window.showHelpFor = function(feature) {
        const helpContent = document.getElementById('helpContent');
        const template = document.getElementById(`help-${feature}`);
        
        if (helpContent && template) {
            helpContent.innerHTML = template.innerHTML;
        }
    };
    
    // Start guided tour
    window.startGuidedTour = function() {
        alert('Guided tour functionality will be implemented here');
        // Here you would typically integrate with a tour library
        // like Shepherd.js or Intro.js
    };
}

/**
 * Initialize DataTables for tables
 */
function initializeDataTables() {
    $('.datatable').each(function() {
        $(this).DataTable({
            responsive: true,
            language: {
                search: "Search:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                paginate: {
                    first: "First",
                    last: "Last",
                    next: "Next",
                    previous: "Previous"
                }
            }
        });
    });
}

/**
 * Initialize charts on the page
 */
function initializeCharts() {
    // Registration trend chart
    const registrationCtx = document.getElementById('registrationTrendChart');
    if (registrationCtx) {
        const data = JSON.parse(registrationCtx.dataset.values || '[]');
        const labels = JSON.parse(registrationCtx.dataset.labels || '[]');
        
        new Chart(registrationCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Registrations',
                    data: data,
                    borderColor: '#1a237e',
                    backgroundColor: 'rgba(26, 35, 126, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Registration Trend'
                    }
                }
            }
        });
    }
    
    // Guest distribution chart
    const distributionCtx = document.getElementById('guestDistributionChart');
    if (distributionCtx) {
        const data = JSON.parse(distributionCtx.dataset.values || '[]');
        const labels = JSON.parse(distributionCtx.dataset.labels || '[]');
        
        new Chart(distributionCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#1a237e', '#2e7d32', '#e65100', 
                        '#01579b', '#6a1b9a', '#c62828'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Guest Type Distribution'
                    }
                }
            }
        });
    }
}

/**
 * Handle search form submission
 */
function handleSearchForm() {
    const searchForm = document.getElementById('searchForm');
    if (!searchForm) return;
    
    searchForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const searchInput = document.getElementById('searchInput');
        if (!searchInput || !searchInput.value.trim()) return;
        
        const searchTerm = searchInput.value.trim();
        
        Utils.toggleLoadingSpinner(true);
        
        fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else if (data.results) {
                    updateSearchResults(data.results);
                }
            })
            .catch(error => {
                console.error('Search error:', error);
                showToast('Error', 'Failed to perform search. Please try again.', 'error');
            })
            .finally(() => {
                Utils.toggleLoadingSpinner(false);
            });
    });
}

/**
 * Update search results on the page
 * @param {Array} results - Search results
 */
function updateSearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h5 class="empty-state-title">No results found</h5>
                <p class="empty-state-description">
                    Try different keywords or check for typos
                </p>
            </div>
        `;
        return;
    }
    
    // Add new results
    results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'card mb-3 slide-up';
        resultElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">${result.name}</h5>
                    <span class="badge bg-primary">${result.role}</span>
                </div>
                <p class="card-text text-muted mb-2">ID: ${result.id}</p>
                <p class="card-text">${result.phone || 'No phone'} | ${result.email || 'No email'}</p>
                <a href="/single_guest/${result.id}" class="btn btn-primary btn-sm">
                    <i class="fas fa-eye me-1"></i> View Details
                </a>
            </div>
        `;
        resultsContainer.appendChild(resultElement);
    });
}

/**
 * Show a toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, warning, info)
 */
function showToast(title, message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.className = 'toast fade-in';
    toast.id = toastId;
    
    const typeClass = {
        success: 'bg-success',
        error: 'bg-danger',
        warning: 'bg-warning',
        info: 'bg-info'
    }[type] || 'bg-info';
    
    const typeIcon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';
    
    toast.innerHTML = `
        <div class="toast-header">
            <i class="${typeIcon} me-2 text-${type}"></i>
            <strong class="me-auto">${title}</strong>
            <small>just now</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 5000
    });
    
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Export functions for global use
window.Utils = Utils;
window.showToast = showToast;
window.toggleHelpOverlay = function() {
    const helpOverlay = document.getElementById('helpOverlay');
    if (helpOverlay) {
        helpOverlay.style.display = helpOverlay.style.display === 'none' ? 'flex' : 'none';
    }
};