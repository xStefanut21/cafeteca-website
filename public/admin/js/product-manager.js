// Product Management Functions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the products table
    loadProductsTable();
    
    // Add event listener for the add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', showAddProductForm);
    }
    
    // Handle form submission
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Initialize categories dropdown
    initializeCategorySelect();
});

// Load products into the table
function loadProductsTable() {
    const products = JSON.parse(localStorage.getItem('cafeteca_products') || '[]');
    const tbody = document.querySelector('#productsTable tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="5" class="text-center">
                Nu există produse în meniu. Adaugă unul nou!
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }
    
    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.name}</td>
            <td>${formatPrice(product.price)}</td>
            <td>${product.category}</td>
            <td>${product.description || '-'}</td>
            <td class="actions">
                <button class="btn-edit" data-id="${product.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Add event listeners for edit and delete buttons
        tr.querySelector('.btn-edit').addEventListener('click', () => editProduct(product.id));
        tr.querySelector('.btn-delete').addEventListener('click', () => confirmDeleteProduct(product.id));
        
        tbody.appendChild(tr);
    });
}

// Show add product form
function showAddProductForm() {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    
    // Reset form
    const form = document.getElementById('productForm');
    form.reset();
    form.dataset.editMode = 'false';
    
    // Update modal title
    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Adaugă Produs Nou';
    }
    
    // Show modal
    $(modal).modal('show');
}

// Handle form submission
function handleProductSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const isEdit = form.dataset.editMode === 'true';
    const productId = isEdit ? parseInt(document.getElementById('productId').value) : Date.now();
    
    // Get form values
    const name = document.getElementById('name').value;
    const price = parseFloat(document.getElementById('price').value);
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    
    if (!name || isNaN(price) || !category) {
        showAlert('Te rog completează toate câmpurile obligatorii!', 'error');
        return;
    }
    
    const product = {
        id: productId,
        name: name,
        price: price,
        category: category,
        description: description
    };
    
    let products = JSON.parse(localStorage.getItem('cafeteca_products') || '[]');
    
    if (isEdit) {
        // Update existing product
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = product;
            showAlert('Produs actualizat cu succes!', 'success');
        } else {
            showAlert('Produsul nu a fost găsit!', 'error');
            return;
        }
    } else {
        // Add new product
        products.push(product);
        showAlert('Produs adăugat cu succes!', 'success');
    }
    
    try {
        // Save to localStorage
        localStorage.setItem('cafeteca_products', JSON.stringify(products));
        
        // Reload table
        loadProductsTable();
        
        // Hide modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        if (modal) {
            modal.hide();
        }
        
        // Reset form
        form.reset();
        form.dataset.editMode = 'false';
        
    } catch (error) {
        console.error('Error saving product:', error);
        showAlert('A apărut o eroare la salvarea produsului!', 'error');
    }
}

// Edit product
function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('cafeteca_products') || '[]');
    const product = products.find(p => p.id === id);
    
    if (!product) {
        showAlert('Produsul nu a fost găsit!', 'error');
        return;
    }
    
    const modal = document.getElementById('productModal');
    if (!modal) return;
    
    // Get form elements
    const form = document.getElementById('productForm');
    const productIdInput = document.getElementById('productId');
    const nameInput = document.getElementById('name');
    const priceInput = document.getElementById('price');
    const categorySelect = document.getElementById('category');
    const descriptionInput = document.getElementById('description');
    
    if (!productIdInput || !nameInput || !priceInput || !categorySelect || !descriptionInput) {
        console.error('Form elements not found');
        return;
    }
    
    // Fill form with product data
    productIdInput.value = product.id;
    nameInput.value = product.name || '';
    priceInput.value = product.price || '';
    descriptionInput.value = product.description || '';
    
    // Set category, ensuring the value exists in the select
    if (product.category) {
        const categoryOption = Array.from(categorySelect.options).find(
            option => option.value === product.category
        );
        if (categoryOption) {
            categorySelect.value = product.category;
        }
    }
    
    // Set edit mode
    form.dataset.editMode = 'true';
    
    // Update modal title
    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Editează Produs';
    }
    
    // Initialize Bootstrap modal and show it
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Confirm product deletion
function confirmDeleteProduct(id) {
    if (confirm('Ești sigur că dorești să ștergi acest produs?')) {
        deleteProduct(id);
    }
}

// Delete product
function deleteProduct(id) {
    const products = JSON.parse(localStorage.getItem('cafeteca_products') || '[]');
    const filteredProducts = products.filter(p => p.id !== id);
    
    localStorage.setItem('cafeteca_products', JSON.stringify(filteredProducts));
    showAlert('Produs șters cu succes!', 'success');
    loadProductsTable();
}

// Initialize category select dropdown
function initializeCategorySelect() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect) return;
    
    // Store the current selected value if any
    const currentValue = categorySelect.value;
    
    // Clear existing options except the first one (which is usually a placeholder)
    while (categorySelect.options.length > 0) {
        categorySelect.remove(0);
    }
    
    // Add default/placeholder option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selectează o categorie';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    categorySelect.appendChild(defaultOption);
    
    // Get categories from localStorage or use default categories
    const savedCategories = JSON.parse(localStorage.getItem('cafeteca_categories') || '[]');
    const defaultCategories = [
        'Specialty Coffee',
        'Lemonades',
        'Soft Drinks',
        'Cocktails',
        'Beer',
        'Mocktails',
        'Espresso & Spirits'
    ];
    
    // Combine saved and default categories, remove duplicates, and sort
    const allCategories = [...new Set([...savedCategories, ...defaultCategories])].sort();
    
    // Add categories to the select element
    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    // Restore the selected value if it still exists
    if (currentValue && allCategories.includes(currentValue)) {
        categorySelect.value = currentValue;
    }
    
    // If we're in edit mode, make sure the product's category is selected
    const form = document.getElementById('productForm');
    if (form && form.dataset.editMode === 'true') {
        const productId = document.getElementById('productId')?.value;
        if (productId) {
            const products = JSON.parse(localStorage.getItem('cafeteca_products') || '[]');
            const product = products.find(p => p.id.toString() === productId);
            if (product && product.category) {
                categorySelect.value = product.category;
            }
        }
    }
}

// Format price
function formatPrice(price) {
    return `${parseFloat(price).toFixed(2)} RON`;
}

// Show alert message
function showAlert(message, type = 'success') {
    // You can use SweetAlert2 or a simple alert
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            text: message,
            icon: type,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    } else {
        alert(message);
    }
}

// Update dashboard counts
function updateDashboardCounts() {
    const products = JSON.parse(localStorage.getItem('cafeteca_products') || '[]');
    const categories = JSON.parse(localStorage.getItem('cafeteca_categories') || '[]');
    
    // Update products count
    const productsCount = document.getElementById('products-count');
    if (productsCount) {
        productsCount.textContent = products.length;
    }
    
    // Update categories count
    const categoriesCount = document.getElementById('categories-count');
    if (categoriesCount) {
        categoriesCount.textContent = categories.length;
    }
    
    // Make the categories count clickable
    const categoriesCard = document.querySelector('.card:nth-child(2)');
    if (categoriesCard) {
        categoriesCard.style.cursor = 'pointer';
        categoriesCard.addEventListener('click', function() {
            const categoriesLink = document.querySelector('[data-section="categories"] a');
            if (categoriesLink) {
                categoriesLink.click();
            }
        });
    }
    
    console.log('Dashboard counts updated:', { products: products.length, categories: categories.length });
}

// Call updateDashboardCounts when the page loads
document.addEventListener('DOMContentLoaded', function() {
    updateDashboardCounts();
});

// Make functions available globally
window.ProductManager = {
    loadProductsTable,
    showAddProductForm,
    editProduct,
    deleteProduct,
    updateDashboardCounts
};
