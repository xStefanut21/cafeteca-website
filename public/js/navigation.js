document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            // Toggle between menu and close icon
            const spans = this.querySelectorAll('span');
            if (this.classList.contains('active')) {
                // Transform to X
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                // Revert to hamburger
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) { // Only for mobile
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                body.classList.remove('menu-open');
                
                // Revert hamburger icon
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = mainNav.contains(event.target) || menuToggle.contains(event.target);
        if (!isClickInside && window.innerWidth <= 992) {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            body.classList.remove('menu-open');
            
            // Revert hamburger icon
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});

// Handle window resize
window.addEventListener('resize', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    
    if (window.innerWidth > 992) {
        // Reset mobile menu on desktop
        if (menuToggle) menuToggle.classList.remove('active');
        if (mainNav) mainNav.classList.remove('active');
        body.classList.remove('menu-open');
    }
});
