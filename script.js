document.addEventListener('DOMContentLoaded', function() {

    // --- Theme Toggling ---
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        if (themeIcon) updateThemeIcon(savedTheme);
    } else {
        // Set default theme if none saved
        const defaultTheme = 'dark';
        document.body.setAttribute('data-theme', defaultTheme);
        if (themeIcon) updateThemeIcon(defaultTheme);
    }
    
    // Toggle theme function
    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        if (themeIcon) updateThemeIcon(newTheme);
    }
    
    // Update icon based on theme
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun'; // Sun icon in dark mode (to switch to light)
        } else {
            themeIcon.className = 'fas fa-moon'; // Moon icon in light mode (to switch to dark)
        }
    }
    
    // Add click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // --- Timeline "View Full Timeline" Button ---
    const timelineMoreBtn = document.querySelector('.timeline-more .btn-outline');
    const hiddenTimelineItems = document.querySelectorAll('.timeline-item.hidden');

    // Only add listener if the button and hidden items exist
    if (timelineMoreBtn && hiddenTimelineItems.length > 0) {
        // Simple click handler for button element (no navigation to prevent)
        timelineMoreBtn.addEventListener('click', function() {
            // Show all hidden items
            hiddenTimelineItems.forEach(item => {
                item.style.display = 'block';
                item.classList.remove('hidden');
            });
            
            // Hide the button
            this.style.display = 'none';
        });
    } else if (timelineMoreBtn) {
        // If button exists but no hidden items, hide the button immediately
        timelineMoreBtn.style.display = 'none';
    }


    // --- Smooth Scroll for Navigation Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            // Handle the "#" case (often used for placeholder links)
            if (targetId === '#') {
                e.preventDefault(); // Prevent page jump
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
                return; // Exit function
            }

            // Handle internal links
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault(); // Prevent default anchor jump

                // Calculate offset dynamically (e.g., based on navbar height if fixed)
                const navbarHeight = document.querySelector('.navbar') ? document.querySelector('.navbar').offsetHeight : 0;
                const offsetTop = targetElement.offsetTop - navbarHeight - 20; // Adjust '- 20' for extra space

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            // If it's not '#' and not found on page, let the default browser behavior handle it (might be an external link)
        });
    });


    // --- Skill Bar Animation on Scroll ---
    const skillsSection = document.querySelector('#skills');
    let animated = false; // Flag to ensure animation runs only once

    function animateSkillBars() {
        // Check if already animated or section not found
        if (animated || !skillsSection) return;

        const progressItems = skillsSection.querySelectorAll('.progress-item');

        progressItems.forEach((item, index) => {
            const progressBar = item.querySelector('.progress');
            const percentageSpan = item.querySelector('.percentage');
            const targetWidth = parseInt(progressBar.getAttribute('data-width')) || parseInt(percentageSpan.textContent);

            if (progressBar && !isNaN(targetWidth)) {
                // Set a staggered delay for each progress bar
                setTimeout(() => {
                    progressBar.style.width = targetWidth + '%'; // Apply final width
                    // Optionally re-sync text if needed
                    if (percentageSpan) {
                        // Start percentage at 0 and animate it
                        let startValue = 0;
                        const duration = 2000; // 2 seconds to match CSS transition
                        const interval = 50; // Update every 50ms
                        const increment = targetWidth / (duration / interval);
                        
                        const counter = setInterval(() => {
                            startValue += increment;
                            if (startValue >= targetWidth) {
                                startValue = targetWidth;
                                clearInterval(counter);
                            }
                            percentageSpan.textContent = Math.round(startValue) + '%';
                        }, interval);
                    }
                }, index * 400); // 400ms delay between each bar starting
            }
        });

        animated = true; // Set flag to true after animation
    }

    // Use Intersection Observer for efficiency
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // When the section is at least 10% visible
                if (entry.isIntersecting) {
                    animateSkillBars();
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% is visible

        if (skillsSection) {
            observer.observe(skillsSection);
        }
    } else {
        // Fallback for older browsers (less efficient)
        window.addEventListener('scroll', function checkScroll() {
            if (!animated && skillsSection) {
                 const rect = skillsSection.getBoundingClientRect();
                 // Check if top of section is within viewport or already passed
                if (rect.top < window.innerHeight && rect.bottom >= 0) {
                    animateSkillBars();
                    // Consider removing listener if performance is an issue,
                    // but leaving it allows re-animation if needed (remove 'animated' flag logic then)
                    // window.removeEventListener('scroll', checkScroll);
                }
            }
        });
         // Initial check in case the element is already visible on load
         if (!animated && skillsSection) {
             const rect = skillsSection.getBoundingClientRect();
             if (rect.top < window.innerHeight && rect.bottom >= 0) {
                 animateSkillBars();
             }
         }
    }

    // --- Initialize skill bars text content from data-width ---
    // This ensures the correct percentage is displayed initially by CSS/HTML
    // before JS animation might start (or if JS fails).
    const initialProgressItems = document.querySelectorAll('#skills .progress-item');
    initialProgressItems.forEach(item => {
        const progressBar = item.querySelector('.progress');
        const percentageSpan = item.querySelector('.percentage');
        const targetWidth = progressBar ? progressBar.getAttribute('data-width') : null;
        if(targetWidth && percentageSpan){
             percentageSpan.textContent = targetWidth + '%';
        }
    });

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            
            // Get form data
            const formData = {
                name: contactForm.querySelector('#name').value.trim(),
                email: contactForm.querySelector('#email').value.trim(),
                message: contactForm.querySelector('#message').value.trim(),
                code: "77778888"
            };
            
            // Basic validation
            if (!formData.name || !formData.email || !formData.message) {
                showFormMessage('Please fill in all fields.', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showFormMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            hideFormMessage();
            
            try {
                const response = await fetch('https://contactus-fyeea9avc3d0awhb.centralus-01.azurewebsites.net/api/contactusform', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                // Handle success - 204 means successful with no content
                if (response.ok || response.status === 204) {
                    showFormMessage('Thank you! Your message has been sent successfully.', 'success');
                    contactForm.reset();
                    
                    // Remove focused labels after reset
                    setTimeout(() => {
                        const formInputs = contactForm.querySelectorAll('.form-group input, .form-group textarea');
                        formInputs.forEach(input => {
                            updateLabel(input);
                        });
                    }, 100);
                } else {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
            } catch (error) {
                console.error('Error:', error);
                
                // Check if it's a CORS error with status 204 (which actually means success)
                if (error.message.includes('Load failed') || error.message.includes('CORS')) {
                    // Assume success since 204 status was mentioned in console
                    showFormMessage('Your message has been sent successfully!', 'success');
                    contactForm.reset();
                    
                    // Remove focused labels after reset
                    setTimeout(() => {
                        const formInputs = contactForm.querySelectorAll('.form-group input, .form-group textarea');
                        formInputs.forEach(input => {
                            updateLabel(input);
                        });
                    }, 100);
                } else {
                    showFormMessage('Sorry, there was an error sending your message. Please try again.', 'error');
                }
            } finally {
                // Hide loading state
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    }
    
    function showFormMessage(message, type) {
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.className = `form-message ${type} show`;
        }
    }
    
    function hideFormMessage() {
        if (formMessage) {
            formMessage.classList.remove('show');
        }
    }

    // --- Form Labels Animation ---
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    
    formInputs.forEach(input => {
        // Handle initial state on page load
        updateLabel(input);
        
        // Handle focus and blur events
        input.addEventListener('focus', function() {
            updateLabel(this, true);
        });
        
        input.addEventListener('blur', function() {
            updateLabel(this);
        });
        
        input.addEventListener('input', function() {
            updateLabel(this);
        });
    });
    
    function updateLabel(input, isFocused = false) {
        const label = input.nextElementSibling;
        if (!label) return;
        
        if (isFocused || input.value.trim() !== '') {
            label.style.top = '-8px';
            label.style.fontSize = '12px';
            label.style.color = 'var(--primary-color)';
            label.style.fontWeight = '500';
        } else {
            label.style.top = '15px';
            label.style.fontSize = '16px';
            label.style.color = 'var(--muted-text)';
            label.style.fontWeight = 'normal';
        }
    }

});
