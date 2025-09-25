document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in (basic check)
    if (!localStorage.getItem('admin_logged_in') && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('admin_logged_in');
            window.location.href = 'login.html';
        });
    }

    // Initialize the appropriate page
    if (document.getElementById('productForm')) {
        initializeProductForm();
        loadProducts();
    }
});

// Initialize product form
function initializeProductForm() {
    const form = document.getElementById('productForm');
    const categorySelect = document.getElementById('category');
    const productIdInput = document.getElementById('productId');
    
    // Populate categories
    window.ProductManager.CATEGORIES.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const product = {
            name: document.getElementById('name').value,
            price: parseFloat(document.getElementById('price').value),
            description: document.getElementById('description').value,
            category: document.getElementById('category').value
        };
        
        const productId = productIdInput.value;
        
        if (productId) {
            // Update existing product
            window.ProductManager.updateProduct(parseInt(productId), product);
            showAlert('Produs actualizat cu succes!', 'success');
        } else {
            // Add new product
            window.ProductManager.addProduct(product);
            showAlert('Produs adăugat cu succes!', 'success');
        }
        
        form.reset();
        productIdInput.value = '';
        loadProducts();
    });
}

// Load products into the table
function loadProducts() {
    const products = window.ProductManager.getProducts();
    const tbody = document.querySelector('#productsTable tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.name}</td>
            <td>${window.ProductManager.formatPrice(product.price)}</td>
            <td>${product.category}</td>
            <td>${product.description}</td>
            <td class="actions">
                <button class="btn-edit" data-id="${product.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            if (confirm('Sigur doriți să ștergeți acest produs?')) {
                window.ProductManager.deleteProduct(productId);
                loadProducts();
                showAlert('Produs șters cu succes!', 'success');
            }
        });
    });
}

// Edit product
function editProduct(id) {
    const products = window.ProductManager.getProducts();
    const product = products.find(p => p.id === id);
    
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('name').value = product.name;
        document.getElementById('price').value = product.price;
        document.getElementById('description').value = product.description;
        document.getElementById('category').value = product.category;
        
        // Scroll to form
        document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
    }
}

// Show alert message
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    // Remove alert after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Login functionality
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // In a real app, you would validate against a server
    if (username === 'admin' && password === 'admin') {
        localStorage.setItem('admin_logged_in', 'true');
        window.location.href = 'dashboard.html';
    } else {
        showAlert('Nume de utilizator sau parolă incorectă!', 'error');
    }
}

// Add login form handler if on login page
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}
