// Initialize products when the script loads
if (typeof ProductManager === 'undefined') {
    // If ProductManager is not loaded, initialize with default products
    const defaultProducts = [
        { id: 1, name: 'Espresso', price: 8, description: 'Cafea puternică și aromată', category: 'Specialty Coffee' },
        { id: 2, name: 'Limonadă Clasică', price: 12, description: 'Lămâie proaspăt storsă', category: 'Lemonades' },
        { id: 3, name: 'Cola', price: 10, description: 'Băutură răcoritoare cu cola', category: 'Soft Drinks' },
        { id: 4, name: 'Irish Coffee', price: 18, description: 'Cafea cu whiskey și frișcă', category: 'Espresso & Spirits' },
        { id: 5, name: 'Mojito', price: 20, description: 'Rom, mentă, lămâie, apă minerală', category: 'Cocktails' },
        { id: 6, name: 'Fresh de portocale', price: 12, description: 'Portocale proaspăt stoarse', category: 'Mocktails' },
        { id: 7, name: 'Bere la halbă', price: 10, description: 'Bere rece la halbă', category: 'Beer' }
    ];
    
    if (!localStorage.getItem('cafeteca_products')) {
        localStorage.setItem('cafeteca_products', JSON.stringify(defaultProducts));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Load and display products
    // Function to get categories from localStorage or use default categories
    function getCategories() {
        // Try to get categories from localStorage first
        const savedCategories = JSON.parse(localStorage.getItem('cafeteca_categories') || '[]');
        
        // If no categories in localStorage, use default categories
        if (savedCategories.length === 0) {
            return [
                'Specialty Coffee',
                'Lemonades',
                'Soft Drinks',
                'Cocktails',
                'Beer',
                'Mocktails',
                'Espresso & Spirits'
            ];
        }
        
        return savedCategories;
    }
    
    function loadMenuProducts() {
        // Get products from localStorage or use empty array if not found
        const products = JSON.parse(localStorage.getItem('cafeteca_products') || '[]');
        
        // Group products by category
        const productsByCategory = {};
        const categories = getCategories();
        
        // Initialize categories with empty arrays
        categories.forEach(category => {
            productsByCategory[category] = [];
        });
        
        // Group products by category
        products.forEach(product => {
            if (product.category) {
                if (!productsByCategory[product.category]) {
                    // If we encounter a category that's not in our list, add it
                    categories.push(product.category);
                    productsByCategory[product.category] = [];
                }
                productsByCategory[product.category].push(product);
            }
        });
        
        // Sort products by name within each category
        Object.keys(productsByCategory).forEach(category => {
            productsByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
        });
        
        // Update the menu with products
        updateMenuWithProducts(productsByCategory);
    }
    
    function updateMenuWithProducts(productsByCategory) {
        // Get the menu container
        const menuContainer = document.querySelector('.menu-container .container');
        if (!menuContainer) return;
        
        // Create a new container for the menu sections
        const newMenuContainer = document.createElement('div');
        newMenuContainer.className = 'container';
        
        // Create a menu section for each category that has products
        Object.entries(productsByCategory).forEach(([category, products]) => {
            if (products.length === 0) return;
            
            // Create section element
            const section = document.createElement('section');
            const categoryId = category.toLowerCase().replace(/\s+/g, '-');
            section.id = categoryId;
            section.className = 'menu-section';
            
            // Section title
            const title = document.createElement('h2');
            title.className = 'menu-section-title';
            title.innerHTML = `<i class="fas fa-${getCategoryIcon(category)}"></i> ${category}`;
            
            // Menu grid
            const grid = document.createElement('div');
            grid.className = 'menu-grid';
            
            // Add products to the grid
            products.forEach(product => {
                const item = document.createElement('div');
                item.className = 'menu-item';
                item.innerHTML = `
                    <h3>${product.name}</h3>
                    <p class="price">${formatPrice(product.price)}</p>
                    <p class="description">${product.description}</p>
                `;
                grid.appendChild(item);
            });
            
            // Assemble the section
            section.appendChild(title);
            section.appendChild(grid);
            newMenuContainer.appendChild(section);
        });
        
        // Replace the old menu content with the new one
        menuContainer.parentNode.replaceChild(newMenuContainer, menuContainer);
    }
    
    function getCategoryIcon(category) {
        const icons = {
            'Specialty Coffee': 'coffee',
            'Lemonades': 'lemon',
            'Soft Drinks': 'glass-whiskey',
            'Cocktails': 'cocktail',
            'Beer': 'beer',
            'Mocktails': 'glass-whiskey',
            'Espresso & Spirits': 'coffee'
        };
        return icons[category] || 'utensils';
    }
    
    function formatPrice(price) {
        return `${parseFloat(price).toFixed(2)} RON`;
    }
    
    // Initial load
    loadMenuProducts();
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const mainNav = document.querySelector('.main-nav');
    const menuLinks = document.querySelectorAll('.main-nav a');
    const menuCategoryLinks = document.querySelectorAll('.menu-category');
    const menuSections = document.querySelectorAll('.menu-section');
    
    // Toggle mobile menu
    function toggleMenu() {
        hamburger.classList.toggle('active');
        mainNav.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.main-nav') && !e.target.closest('.hamburger')) {
            hamburger.classList.remove('active');
            mainNav.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Close menu when clicking a link
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) { // Only for mobile
                toggleMenu();
            }
        });
    });
    
    // Hamburger click event
    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });
    }
    
    // Highlight active menu category on scroll
    function highlightMenu() {
        if (menuSections.length === 0) return;
        
        let fromTop = window.scrollY + 200; // Adjust this value as needed
        
        menuSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (fromTop >= sectionTop && fromTop < sectionTop + sectionHeight) {
                menuCategoryLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Add click event listeners to menu category links
    menuCategoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 150,
                    behavior: 'smooth'
                });
                
                // Update active state
                menuCategoryLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Initial highlight check
    highlightMenu();
    
    // Update highlight on scroll
    window.addEventListener('scroll', highlightMenu);
    
    // Add animation to menu items
    const menuItems = document.querySelectorAll('.menu-item');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Apply initial styles and observe each menu item
    menuItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(item);
    });
});
