document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for category navigation
    const navLinks = document.querySelectorAll('.category-nav a');
    const menuSections = document.querySelectorAll('.menu-section');
    
    // Highlight active section in navigation
    function highlightNav() {
        let scrollPosition = window.scrollY + 100;
        
        menuSections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Smooth scroll to section
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update active state
                navLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Scroll hint functionality
    const scrollHint = document.querySelector('.menu-scroll-hint');
    if (scrollHint) {
        scrollHint.addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight - 80,
                behavior: 'smooth'
            });
        });
    }
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe menu items for scroll animations
    document.querySelectorAll('.menu-item').forEach(item => {
        observer.observe(item);
    });
    
    // Initial highlight on page load
    highlightNav();
    
    // Update highlight on scroll
    window.addEventListener('scroll', () => {
        highlightNav();
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            highlightNav();
        }, 250);
    });
});
