// Category Management Functions
const CATEGORIES_KEY = 'cafeteca_categories';

// Initialize default categories if not exists
function initializeCategories() {
    if (!localStorage.getItem(CATEGORIES_KEY)) {
        const defaultCategories = [
            'Specialty Coffee',
            'Lemonades',
            'Soft Drinks',
            'Cocktails',
            'Beer',
            'Mocktails',
            'Espresso & Spirits'
        ];
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
        return defaultCategories;
    }
    return JSON.parse(localStorage.getItem(CATEGORIES_KEY));
}

// Get all categories
function getCategories() {
    return JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
}

// Add a new category
function addCategory(name) {
    const categories = getCategories();
    if (categories.includes(name)) {
        throw new Error('Această categorie există deja!');
    }
    categories.push(name);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return categories;
}

// Update a category
function updateCategory(oldName, newName) {
    const categories = getCategories();
    const index = categories.indexOf(oldName);
    
    if (index === -1) {
        throw new Error('Categoria nu a fost găsită!');
    }
    
    // Check if new name already exists
    if (categories.includes(newName) && oldName !== newName) {
        throw new Error('Această categorie există deja!');
    }
    
    // Update category in categories list
    categories[index] = newName;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    
    // Update all products with the old category name
    updateProductsCategory(oldName, newName);
    
    return categories;
}

// Delete a category
function deleteCategory(name) {
    const categories = getCategories();
    const index = categories.indexOf(name);
    
    if (index === -1) {
        throw new Error('Categoria nu a fost găsită!');
    }
    
    // Check if any products are using this category
    const products = JSON.parse(localStorage.getItem('cafeteca_products') || '[]');
    const productsInCategory = products.filter(p => p.category === name);
    
    if (productsInCategory.length > 0) {
        throw new Error('Nu puteți șterge această categorie deoarece există produse care o folosesc!');
    }
    
    categories.splice(index, 1);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    
    return categories;
}

// Update all products with a new category name
function updateProductsCategory(oldName, newName) {
    const products = JSON.parse(localStorage.getItem('cafeteca_products') || '[]');
    let updated = false;
    
    const updatedProducts = products.map(product => {
        if (product.category === oldName) {
            updated = true;
            return { ...product, category: newName };
        }
        return product;
    });
    
    if (updated) {
        localStorage.setItem('cafeteca_products', JSON.stringify(updatedProducts));
    }
    
    return updated;
}

// Initialize the categories management interface
document.addEventListener('DOMContentLoaded', function() {
    // Initialize categories if not exists
    initializeCategories();
    
    // Load categories when the categories section is shown
    document.addEventListener('click', function(e) {
        if (e.target.closest('[data-section="categories"]') || 
            e.target.closest('.categories-card')) {
            loadCategoriesTable();
        }
    });
    
    // Handle add category form submission
    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', handleAddCategory);
    }
    
    // Handle edit category modal
    $(document).on('show.bs.modal', '#editCategoryModal', function(event) {
        const button = event.relatedTarget;
        const oldName = button.getAttribute('data-category');
        const modal = this;
        
        modal.querySelector('#editCategoryName').value = oldName;
        modal.querySelector('form').dataset.oldName = oldName;
    });
    
    // Handle edit category form submission
    const editCategoryForm = document.getElementById('editCategoryForm');
    if (editCategoryForm) {
        editCategoryForm.addEventListener('submit', handleEditCategory);
    }
    
    // Handle delete category button
    $(document).on('click', '.btn-delete-category', function() {
        const categoryName = this.getAttribute('data-category');
        if (confirm(`Sunteți sigur că doriți să ștergeți categoria "${categoryName}"?`)) {
            try {
                deleteCategory(categoryName);
                showAlert('Categoria a fost ștearsă cu succes!', 'success');
                loadCategoriesTable();
            } catch (error) {
                showAlert(error.message, 'error');
            }
        }
    });
});

// Load categories into the table
function loadCategoriesTable() {
    const categories = getCategories();
    const tbody = document.querySelector('#categoriesTable tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (categories.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="3" class="text-center">
                Nu există categorii. Adaugă una nouă!
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }
    
    // Count products in each category
    const products = JSON.parse(localStorage.getItem('cafeteca_products') || '[]');
    const productCounts = {};
    
    products.forEach(product => {
        productCounts[product.category] = (productCounts[product.category] || 0) + 1;
    });
    
    // Add categories to the table
    categories.forEach(category => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${category}</td>
            <td>${productCounts[category] || 0} produse</td>
            <td class="actions">
                <button class="btn-edit" data-bs-toggle="modal" data-bs-target="#editCategoryModal" data-category="${category}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete btn-delete-category" data-category="${category}" ${productCounts[category] ? 'disabled title="Nu puteți șterge o categorie care conține produse"' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Update the categories count in the dashboard
    updateDashboardCounts();
}

// Handle add category form submission
function handleAddCategory(e) {
    e.preventDefault();
    
    const form = e.target;
    const nameInput = form.querySelector('input[name="name"]');
    const name = nameInput.value.trim();
    
    if (!name) {
        showAlert('Te rog introdu un nume pentru categorie!', 'error');
        return;
    }
    
    try {
        addCategory(name);
        showAlert('Categoria a fost adăugată cu succes!', 'success');
        form.reset();
        loadCategoriesTable();
        
        // Update the category select in the product form
        initializeCategorySelect();
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Handle edit category form submission
function handleEditCategory(e) {
    e.preventDefault();
    
    const form = e.target;
    const oldName = form.dataset.oldName;
    const newName = form.querySelector('input[name="name"]').value.trim();
    
    if (!newName) {
        showAlert('Te rog introdu un nume pentru categorie!', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Se actualizează...';
    
    try {
        // Update the category
        updateCategory(oldName, newName);
        
        // Show success message
        showAlert('Categoria a fost actualizată cu succes!', 'success');
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
        if (modal) {
            modal.hide();
        }
        
        // Reload all necessary UI components
        loadCategoriesTable();
        
        // If we have access to ProductManager, refresh the products table and category select
        if (typeof ProductManager !== 'undefined') {
            if (typeof ProductManager.loadProductsTable === 'function') {
                ProductManager.loadProductsTable();
            }
            if (typeof ProductManager.initializeCategorySelect === 'function') {
                ProductManager.initializeCategorySelect();
            }
        }
        
        // If we're on the menu page, refresh it
        if (typeof loadMenuProducts === 'function') {
            loadMenuProducts();
        }
        
        // Update dashboard counts
        if (typeof updateDashboardCounts === 'function') {
            updateDashboardCounts();
        }
        
        // Force a page reload to ensure all components are in sync
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        // Reset button state
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }
}

// Make functions available globally
window.CategoryManager = {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    loadCategoriesTable,
    initializeCategorySelect,
    updateProductsCategory
};

// Initialize categories when the script loads
initializeCategories();
