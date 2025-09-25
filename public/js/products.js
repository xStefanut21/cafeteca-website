// Product Management System
const PRODUCTS_KEY = 'cafeteca_products';
const CATEGORIES = [
    'Specialty Coffee',
    'Lemonades',
    'Soft Drinks',
    'Cocktails',
    'Beer',
    'Mocktails',
    'Espresso & Spirits'
];

// Initialize products in localStorage if not exists
function initializeProducts() {
    if (!localStorage.getItem(PRODUCTS_KEY)) {
        const defaultProducts = [
            { id: Date.now(), name: 'Espresso', price: 8, description: 'Cafea puternică și aromată', category: 'Specialty Coffee' },
            { id: Date.now() + 1, name: 'Limonadă Clasică', price: 12, description: 'Lămâie proaspăt storsă', category: 'Lemonades' }
        ];
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
        return defaultProducts;
    }
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY));
}

// Get all products
function getProducts() {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
}

// Save products to localStorage
function saveProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

// Add a new product
function addProduct(product) {
    const products = getProducts();
    const newProduct = {
        id: Date.now(),
        ...product
    };
    products.push(newProduct);
    saveProducts(products);
    return newProduct;
}

// Update an existing product
function updateProduct(id, updatedProduct) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedProduct };
        saveProducts(products);
        return products[index];
    }
    return null;
}

// Delete a product
function deleteProduct(id) {
    const products = getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    saveProducts(filteredProducts);
    return id;
}

// Get products by category
function getProductsByCategory() {
    const products = getProducts();
    const productsByCategory = {};
    
    // Initialize categories
    CATEGORIES.forEach(category => {
        productsByCategory[category] = [];
    });
    
    // Group products by category
    products.forEach(product => {
        if (productsByCategory[product.category]) {
            productsByCategory[product.category].push(product);
        }
    });
    
    // Sort products by name within each category
    Object.keys(productsByCategory).forEach(category => {
        productsByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return productsByCategory;
}

// Format price
function formatPrice(price) {
    return `${price.toFixed(2)} RON`;
}

// Initialize the products when the script loads
initializeProducts();

// Export functions for use in other files
window.ProductManager = {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    CATEGORIES,
    formatPrice
};
