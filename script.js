// ========================
// GLOBAL VARIABLES
// ========================
let currentTheme = 'light';
let isReduceMotion = false;
let modalTimer;

// ========================
// THEME TOGGLE
// ========================
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

body.setAttribute('data-theme', currentTheme);

themeToggleBtn.addEventListener('click', () => {
    const theme = body.getAttribute('data-theme');
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    currentTheme = newTheme;
    body.setAttribute('data-theme', newTheme);
    themeToggleBtn.innerHTML = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// ========================
// REDUCE MOTION TOGGLE
// ========================
const reduceMotionBtn = document.getElementById('reduce-motion-toggle');

reduceMotionBtn.addEventListener('click', () => {
    isReduceMotion = !isReduceMotion;
    
    if (isReduceMotion) {
        body.classList.add('reduce-motion');
        reduceMotionBtn.classList.add('active');
        reduceMotionBtn.innerHTML = '✅ Motion Reduced';
    } else {
        body.classList.remove('reduce-motion');
        reduceMotionBtn.classList.remove('active');
        reduceMotionBtn.innerHTML = '🎭 Reduce Motion';
    }
});

// ========================
// MOBILE MENU TOGGLE
// ========================
const mobileMenuBtn = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.innerHTML = '☰';
    });
});

// ========================
// SMOOTH SCROLLING
// ========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================
// BACK TO TOP BUTTON
// ========================
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ========================
// INTERSECTION OBSERVER ANIMATIONS
// ========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
    observer.observe(el);
});

// ========================
// VIDEO CLICK HANDLER
// ========================
document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => {
        const thumbnail = card.querySelector('img');
        const videoId = thumbnail.src.match(/vi\/([^\/]+)/)[1];
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    });
});

// ========================
// MODAL FUNCTIONALITY
// ========================
const modal = document.getElementById('rsvp-modal');
const modalClose = document.getElementById('modal-close');
const modalMessage = document.getElementById('modal-message');
const modalDetails = document.getElementById('modal-details');
const modalCountdown = document.getElementById('modal-countdown');
const modalIcon = document.getElementById('modal-icon');

// Function to show modal with personalized message
function showModal(userName, userCountry, userEmail) {
    // Personalize the message
    modalMessage.textContent = `Welcome to Celldown, ${userName}!`;
    
    // Update details with user info
    modalDetails.innerHTML = `
        <p><strong>RSVP Confirmed for:</strong></p>
        <p>👤 ${userName}</p>
        <p>🌍 ${userCountry}</p>
        <p>📧 ${userEmail}</p>
        <p>📍 Gotham Hall • 1356 Broadway at 36th Street, New York, NY 10018</p>
        <p>📅 October 23-26, 2024</p>
        <p>We'll send you a confirmation email with more details!</p>
    `;
    
    // Start icon animation based on motion preference
    if (!isReduceMotion && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        modalIcon.classList.add('animate');
    }
    
    // Show modal
    modal.classList.add('show');
    
    // Start countdown
    startModalCountdown();
}

// Function to hide modal
function hideModal() {
    modal.classList.remove('show');
    modalIcon.classList.remove('animate');
    clearTimeout(modalTimer);
}

// Function to start countdown timer
function startModalCountdown() {
    let seconds = 5;
    modalCountdown.textContent = `Closing in ${seconds} seconds...`;
    
    const countdownInterval = setInterval(() => {
        seconds--;
        modalCountdown.textContent = `Closing in ${seconds} seconds...`;
        
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            hideModal();
        }
    }, 1000);
    
    // Also set a timeout as backup
    modalTimer = setTimeout(() => {
        clearInterval(countdownInterval);
        hideModal();
    }, 5000);
}

// Modal close button event
modalClose.addEventListener('click', hideModal);

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        hideModal();
    }
});

// ========================
// RSVP FORM HANDLER
// ========================
const rsvpForm = document.getElementById('rsvp-form');
const successMessage = document.getElementById('success-message');
const participantsList = document.getElementById('participants') || document.querySelector('.rsvp-participants');
const rsvpCount = document.getElementById('count') || document.getElementById('rsvp-count');
const submitText = document.getElementById('submit-text');
const loading = document.getElementById('loading');

let participantCount = parseInt(rsvpCount?.textContent || "3");

// Email validation helper
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Phone validation helper
function isValidPhone(phone) {
    // Allow various phone formats (10 digits, with or without formatting)
    const phonePattern = /^[\+]?[1-9]?[\d\s\-\(\)\.]{10,15}$/;
    return phonePattern.test(phone.replace(/\D/g, '')) && phone.replace(/\D/g, '').length >= 10;
}

// Form validation
function validateForm() {
    let containsErrors = false;
    const fullname = document.getElementById("full-name");
    const email = document.getElementById("email");
    const country = document.getElementById("country");
    const phone = document.getElementById("phone");

    // Reset all errors first
    [fullname, email, country, phone].forEach(field => {
        field.classList.remove("error");
    });

    // Validate full name
    if (fullname.value.trim().length < 2) {
        fullname.classList.add("error");
        setTimeout(() => {
            fullname.value = "";
            fullname.placeholder = "Not a full name!";
        }, 100);
        containsErrors = true;
    }

    // Validate email
    if (!isValidEmail(email.value.trim())) {
        email.classList.add("error");
        setTimeout(() => {
            email.value = "";
            email.placeholder = "Not an email!";
        }, 100);
        containsErrors = true;
    }

    // Validate country
    if (country.value.trim().length < 2) {
        country.classList.add("error");
        setTimeout(() => {
            country.value = "";
            country.placeholder = "Not a country!";
        }, 100);
        containsErrors = true;
    }

    // Validate phone
    if (!isValidPhone(phone.value.trim())) {
        phone.classList.add("error");
        setTimeout(() => {
            phone.value = "";
            phone.placeholder = "Not a number!";
        }, 100);
        containsErrors = true;
    }

    return !containsErrors;
}

// Add participant to list
function addParticipant(fullname, location) {
    const participant = document.createElement("div");
    participant.className = "participant";
    participant.textContent = `📵 ${fullname} from ${location}`;
    participantsList.appendChild(participant);
    
    participantCount++;
    if (rsvpCount) rsvpCount.textContent = participantCount;
}

// Reset form placeholders on focus
document.querySelectorAll('#rsvp-form input').forEach(input => {
    input.addEventListener('focus', () => {
        if (input.classList.contains('error')) {
            input.classList.remove('error');
            input.placeholder = input.getAttribute('data-original-placeholder') || '';
        }
    });
    
    // Store original placeholder
    input.setAttribute('data-original-placeholder', input.placeholder);
});

// Form submit handler
rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    if (submitText) submitText.style.display = 'none';
    if (loading) loading.style.display = 'inline-block';
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get form data
    const fullname = document.getElementById("full-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const country = document.getElementById("country").value.trim();
    
    // Add participant to list
    addParticipant(fullname, country);
    
    // Show success message
    if (successMessage) {
        successMessage.style.display = 'block';
        setTimeout(() => successMessage.style.display = 'none', 5000);
    }
    
    // Show modal with personalized message
    showModal(fullname, country, email);
    
    // Reset form
    rsvpForm.reset();
    
    // Reset button state
    if (submitText) submitText.style.display = 'inline';
    if (loading) loading.style.display = 'none';
});

// ========================
// ACCESSIBILITY IMPROVEMENTS
// ========================

// Respect user's motion preferences
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isReduceMotion = true;
    body.classList.add('reduce-motion');
    reduceMotionBtn.classList.add('active');
    reduceMotionBtn.innerHTML = '✅ Motion Reduced';
}

// Focus management for modal
modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
});

// ========================
// INITIALIZATION
// ========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Celldown website loaded successfully!');
    
    // Set initial focus to close button when modal is shown
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (modal.classList.contains('show')) {
                    setTimeout(() => modalClose.focus(), 100);
                }
            }
        });
    });
    
    observer.observe(modal, { attributes: true });
});