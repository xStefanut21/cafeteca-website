document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    
    // Toggle mobile menu
    function toggleMenu() {
        hamburger.classList.toggle('active');
        mainNav.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        // Toggle between menu and close icon
        const spans = hamburger.querySelectorAll('span');
        if (hamburger.classList.contains('active')) {
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
    }
    
    // Initialize hamburger if it exists
    if (hamburger && mainNav) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });
        
        // Close menu when clicking on a nav link
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 992) { // Only for mobile
                    toggleMenu();
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.main-nav') && !e.target.closest('.hamburger') && window.innerWidth <= 992) {
                if (hamburger.classList.contains('active')) {
                    toggleMenu();
                }
            }
        });
    }
    
    // Handle window resize
    function handleResize() {
        if (window.innerWidth > 992 && hamburger && mainNav) {
            // Reset mobile menu on desktop
            if (hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                mainNav.classList.remove('active');
                body.classList.remove('menu-open');
                
                // Reset hamburger icon
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    }
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleResize();
});
