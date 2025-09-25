// Global state
let menuItems = [];
let events = [];

// DOM Elements
let sidebar, sidebarToggle, navLinks, logoutBtn, menuItemModal, addMenuItemBtn;
let closeModalBtns, menuItemForm, fileUpload, imagePreview, tabButtons;
let currentEditingItem = null;
let currentEditingEvent = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize DOM elements
    initializeElements();
    
    // Check authentication status
    await checkAuth();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize the dashboard
    await initDashboard();
});

function initializeElements() {
    sidebar = document.querySelector('.sidebar');
    sidebarToggle = document.querySelector('.sidebar-toggle');
    navLinks = document.querySelectorAll('.sidebar-nav a');
    logoutBtn = document.getElementById('logoutBtn');
    menuItemModal = document.getElementById('menuItemModal');
    addMenuItemBtn = document.getElementById('addMenuItem');
    closeModalBtns = document.querySelectorAll('.close-modal');
    menuItemForm = document.getElementById('menuItemForm');
    fileUpload = document.getElementById('itemImage');
    imagePreview = document.getElementById('imagePreview');
    tabButtons = document.querySelectorAll('.tab-btn');
}

function setupEventListeners() {
    // Toggle sidebar on mobile
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavLinkClick);
    });
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });
    
    // Add menu item button
    if (addMenuItemBtn) {
        addMenuItemBtn.addEventListener('click', () => {
            currentEditingItem = null;
            resetMenuItemForm();
            menuItemModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === menuItemModal) {
            closeModals();
        }
    });
    
    // File upload preview
    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }
    
    // Menu item form submission
    if (menuItemForm) {
        menuItemForm.addEventListener('submit', handleMenuItemSubmit);
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Authentication functions
async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth', {
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error('Not authenticated');
        }
        
        const data = await response.json();
        if (!data.isAuthenticated) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'login.html';
    }
}

async function handleLogout(e) {
    if (e) e.preventDefault();
    
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        if (response.ok) {
            // Clear any client-side auth data
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('username');
            
            // Redirect to login
            window.location.href = 'login.html';
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('error', 'Logout Failed', 'An error occurred during logout');
    }
}

// Menu Item Functions
async function loadMenuItems() {
    try {
        const response = await fetch('/api/menu');
        if (!response.ok) throw new Error('Failed to load menu items');
        
        const data = await response.json();
        menuItems = data.items || [];
        renderMenuItems();
    } catch (error) {
        console.error('Error loading menu items:', error);
        showAlert('error', 'Error', 'Failed to load menu items');
    }
}

async function saveMenuItem(menuItem) {
    try {
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ item: menuItem })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save menu item');
        }
        
        await loadMenuItems();
        return true;
    } catch (error) {
        console.error('Error saving menu item:', error);
        showAlert('error', 'Error', error.message || 'Failed to save menu item');
        return false;
    }
}

async function deleteMenuItem(itemId) {
    try {
        const response = await fetch(`/api/menu/${itemId}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete menu item');
        }
        
        await loadMenuItems();
        return true;
    } catch (error) {
        console.error('Error deleting menu item:', error);
        showAlert('error', 'Error', error.message || 'Failed to delete menu item');
        return false;
    }
}

function renderMenuItems(filterCategory = 'all') {
    const menuTable = document.querySelector('.menu-items-table tbody');
    if (!menuTable) return;
    
    const filteredItems = filterCategory === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === filterCategory);
    
    menuTable.innerHTML = filteredItems.map(item => `
        <tr>
            <td><div class="item-image">${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}">` : '<i class="fas fa-utensils"></i>'}</div></td>
            <td>${escapeHtml(item.name)}</td>
            <td>${formatCategory(item.category)}</td>
            <td>$${parseFloat(item.price || 0).toFixed(2)}</td>
            <td><span class="status-badge ${item.status === 'available' ? 'available' : 'unavailable'}">${item.status === 'available' ? 'Available' : 'Unavailable'}</span></td>
            <td class="actions">
                <button class="btn-icon edit" data-id="${item.id}" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" data-id="${item.id}" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.btn-icon.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.currentTarget.getAttribute('data-id');
            editMenuItem(itemId);
        });
    });
    
    document.querySelectorAll('.btn-icon.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.currentTarget.getAttribute('data-id');
            confirmDeleteMenuItem(itemId);
        });
    });
}

function editMenuItem(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    currentEditingItem = item;
    
    // Fill the form with item data
    document.getElementById('itemName').value = item.name || '';
    document.getElementById('itemCategory').value = item.category || '';
    document.getElementById('itemPrice').value = item.price || '';
    document.getElementById('itemStatus').value = item.status || 'available';
    document.getElementById('itemDescription').value = item.description || '';
    
    // Set image preview if exists
    if (item.imageUrl) {
        imagePreview.innerHTML = `
            <div class="preview-image">
                <img src="${item.imageUrl}" alt="Preview">
                <button type="button" class="remove-image">&times;</button>
            </div>
        `;
        
        // Add event listener to remove button
        const removeBtn = imagePreview.querySelector('.remove-image');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                imagePreview.innerHTML = '';
                if (fileUpload) fileUpload.value = '';
                if (currentEditingItem) currentEditingItem.imageUrl = '';
            });
        }
    } else {
        imagePreview.innerHTML = '';
    }
    
    // Show the modal
    menuItemModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

async function confirmDeleteMenuItem(itemId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will permanently delete the menu item.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
        await deleteMenuItem(itemId);
        showAlert('success', 'Deleted!', 'The menu item has been deleted.');
    }
}

async function handleMenuItemSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(menuItemForm);
    const menuItem = {
        name: formData.get('itemName'),
        category: formData.get('itemCategory'),
        price: parseFloat(formData.get('itemPrice')),
        status: formData.get('itemStatus'),
        description: formData.get('itemDescription')
    };
    
    // If editing, include the ID
    if (currentEditingItem) {
        menuItem.id = currentEditingItem.id;
        // Keep existing image URL if not changed
        if (currentEditingItem.imageUrl && !fileUpload.files[0]) {
            menuItem.imageUrl = currentEditingItem.imageUrl;
        }
    }
    
    // Handle file upload if a new file is selected
    if (fileUpload.files[0]) {
        const file = fileUpload.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            });
            
            if (!uploadResponse.ok) {
                throw new Error('File upload failed');
            }
            
            const { url } = await uploadResponse.json();
            menuItem.imageUrl = url;
        } catch (error) {
            console.error('Error uploading file:', error);
            showAlert('error', 'Error', 'Failed to upload image');
            return;
        }
    }
    
    // Show loading state
    const submitBtn = menuItemForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
        const success = await saveMenuItem(menuItem);
        
        if (success) {
            showAlert('success', 'Success', 'Menu item saved successfully!');
            closeModals();
            resetMenuItemForm();
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

function resetMenuItemForm() {
    if (menuItemForm) menuItemForm.reset();
    if (imagePreview) imagePreview.innerHTML = '';
    if (fileUpload) fileUpload.value = '';
    currentEditingItem = null;
}

// Event Functions (similar structure to menu items)
async function loadEvents() {
    try {
        const response = await fetch('/api/events');
        if (!response.ok) throw new Error('Failed to load events');
        
        events = await response.json();
        renderEvents();
    } catch (error) {
        console.error('Error loading events:', error);
        showAlert('error', 'Error', 'Failed to load events');
    }
}

function renderEvents() {
    const eventsContainer = document.querySelector('.events-grid');
    if (!eventsContainer) return;
    
    if (events.length === 0) {
        eventsContainer.innerHTML = '<p class="no-events">No events found. Add your first event!</p>';
        return;
    }
    
    eventsContainer.innerHTML = events.map(event => `
        <div class="event-card" data-id="${event.id}">
            <div class="event-image">
                ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.title}">` : ''}
                <div class="event-date">
                    <span class="day">${formatDate(event.date, 'DD')}</span>
                    <span class="month">${formatDate(event.date, 'MMM')}</span>
                </div>
            </div>
            <div class="event-details">
                <h3>${escapeHtml(event.title)}</h3>
                <p class="event-time"><i class="far fa-clock"></i> ${formatTime(event.startTime)} - ${formatTime(event.endTime)}</p>
                <p class="event-description">${truncateText(event.description, 100)}</p>
                <div class="event-actions">
                    <span class="status-badge ${event.status === 'active' ? 'active' : 'inactive'}">
                        ${event.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <div class="action-buttons">
                        <button class="btn-icon edit" data-id="${event.id}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete" data-id="${event.id}" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.event-card .btn-icon.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventId = e.currentTarget.getAttribute('data-id');
            // Implement edit event functionality
            console.log('Edit event:', eventId);
        });
    });
    
    document.querySelectorAll('.event-card .btn-icon.delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const eventId = e.currentTarget.getAttribute('data-id');
            // Implement delete event functionality
            console.log('Delete event:', eventId);
        });
    });
}

// UI Helper Functions
function toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
    if (sidebar) sidebar.classList.toggle('show');
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.classList.toggle('expanded');
}

function handleNavLinkClick(e) {
    e.preventDefault();
    const section = this.parentElement.getAttribute('data-section');
    
    if (section) {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update active nav item
        navLinks.forEach(link => {
            link.parentElement.classList.remove('active');
        });
        this.parentElement.classList.add('active');
        
        // Close sidebar on mobile after selection
        if (window.innerWidth < 992) {
            toggleSidebar();
        }
    }
}

function handleTabClick() {
    const category = this.getAttribute('data-category');
    
    // Update active tab
    tabButtons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    
    // Filter menu items
    renderMenuItems(category === 'all' ? 'all' : category);
}

function closeModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('show'));
    document.body.style.overflow = '';
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
        showAlert('error', 'Invalid File', 'Please select an image file (JPEG, PNG, GIF)');
        e.target.value = '';
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('error', 'File Too Large', 'Image must be less than 5MB');
        e.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        imagePreview.innerHTML = `
            <div class="preview-image">
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="remove-image">&times;</button>
            </div>
        `;
        
        // Add event listener to remove button
        const removeBtn = imagePreview.querySelector('.remove-image');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                imagePreview.innerHTML = '';
                if (fileUpload) fileUpload.value = '';
                if (currentEditingItem) currentEditingItem.imageUrl = '';
            });
        }
    };
    
    reader.onerror = function() {
        showAlert('error', 'Error', 'Failed to read the file');
    };
    
    reader.readAsDataURL(file);
}

// Utility Functions
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(dateString, format = 'YYYY-MM-DD') {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year)
        .replace('MMM', monthNames[date.getMonth()] || '');
}

function formatTime(timeString) {
    if (!timeString) return '';
    
    // Handle both 24h and 12h formats
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = minutes || '00';
    
    if (hour === 0) {
        return `12:${minute} AM`;
    } else if (hour < 12) {
        return `${hour}:${minute} AM`;
    } else if (hour === 12) {
        return `12:${minute} PM`;
    } else {
        return `${hour - 12}:${minute} PM`;
    }
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return escapeHtml(text);
    return escapeHtml(text.substring(0, maxLength)) + '...';
}

function formatCategory(category) {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function showAlert(icon, title, text) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: icon,
            title: title,
            text: text,
            confirmButtonColor: '#6f4e37',
            confirmButtonText: 'OK'
        });
    } else {
        alert(`${title}: ${text}`);
    }
}

// Initialize the dashboard
async function initDashboard() {
    try {
        // Load initial data
        await Promise.all([
            loadMenuItems(),
            loadEvents()
        ]);
        
        // Show dashboard by default
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) dashboardSection.classList.add('active');
        
        // Set first nav item as active
        const firstNavItem = document.querySelector('.sidebar-nav li[data-section]');
        if (firstNavItem) firstNavItem.classList.add('active');
        
        console.log('Dashboard initialized');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showAlert('error', 'Error', 'Failed to initialize dashboard');
    }
}
