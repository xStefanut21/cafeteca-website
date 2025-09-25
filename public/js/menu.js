document.addEventListener('DOMContentLoaded', function() {
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
