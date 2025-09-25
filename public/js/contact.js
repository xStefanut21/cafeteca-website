document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                subject: document.getElementById('subject').value.trim(),
                message: document.getElementById('message').value.trim()
            };
            
            // Simple validation
            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                showAlert('error', 'Eroare', 'Toate câmpurile sunt obligatorii!');
                return;
            }
            
            if (!isValidEmail(formData.email)) {
                showAlert('error', 'Eroare', 'Vă rugăm introduceți o adresă de email validă!');
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se trimite...';
            
            try {
                // Here you would typically send the form data to your server
                // For now, we'll simulate a successful submission
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Show success message
                showAlert('success', 'Succes!', 'Mesajul dumneavoastră a fost trimis cu succes! Vă vom contacta în curând.');
                
                // Reset form
                contactForm.reset();
                
            } catch (error) {
                console.error('Error submitting form:', error);
                showAlert('error', 'Eroare', 'A apărut o eroare la trimiterea mesajului. Vă rugăm încercați din nou mai târziu.');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
    
    // Email validation helper function
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Show alert function
    function showAlert(icon, title, text) {
        // You can replace this with a more sophisticated alert system
        // For now, we'll use the browser's alert
        alert(`${title}: ${text}`);
        
        // If you're using a library like SweetAlert2, you could do:
        // Swal.fire({
        //     icon: icon,
        //     title: title,
        //     text: text,
        //     confirmButtonColor: '#c7a17a',
        // });
    }
});
