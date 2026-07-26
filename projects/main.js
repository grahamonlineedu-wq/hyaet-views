/* main.js - Essential Scripts */

// 1. Mobile Menu Interactivity
// A developer site must look great on mobile. This script toggles the navigation.

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenu.classList.toggle('is-active'); // For potential hamburger animation
        });
    }
});

// 2. Future Backend Integration Placeholder
// As a full stack developer, this script will be used to communicate with an API.

async function fetchProjectData() {
    // In a real full-stack application, this would fetch data from your Node.js/Python backend.
    const apiUrl = '/api/projects'; 

    try {
        // console.log("Initializing data fetch from backend...");
        // const response = await fetch(apiUrl);
        // if (!response.ok) throw new Error('Network response failure.');
        // const data = await response.json();
        // Dynamic DOM insertion logic would follow...
        // console.log("Backend integration ready. Placeholder data accepted.");
    } catch (error) {
        // console.error("Error connecting to full-stack API:", error);
    }
}

// Automatically initiate placeholder call (commented out for basic front-end launch)
// fetchProjectData();

// 1. Mobile Menu Interactivity
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 2. Interactive Contact Form Handler
    const contactForm = document.querySelector('#contact-form');
    const feedback = document.querySelector('#form-feedback');

    if (contactForm && feedback) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevents page reload
            
            // Emulate a professional secure API pipeline transmission
            feedback.textContent = "Transmitting securely to development pipeline...";
            feedback.className = "form-feedback info";
            
            setTimeout(() => {
                feedback.textContent = "Thank you! Message successfully processed by the virtual development server.";
                feedback.className = "form-feedback success";
                contactForm.reset();
            }, 1500);
        });
    }
});

