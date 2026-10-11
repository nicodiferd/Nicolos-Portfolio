/**
 * Animations Module
 * Magnetic hero buttons (index.html [data-magnetic]) and scroll reveal
 * ([data-aos] on bandit.html / homelab.html)
 */

export class Animations {
  constructor() {
    this.init();
  }

  init() {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      this.setupMagneticButtons();
    }
    this.setupScrollAnimations();
  }

  setupMagneticButtons() {
    const magneticElements = document.querySelectorAll('[data-magnetic]');

    magneticElements.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const strength = element.getAttribute('data-magnetic') || 0.3;

        element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });

      element.addEventListener('mouseleave', () => {
        element.style.transform = '';
      });
    });
  }

  // AOS-like scroll animations
  setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');

    if (!animatedElements.length) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements immediately
      animatedElements.forEach(element => {
        element.classList.add('aos-animate');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add aos-animate class to trigger animation
          entry.target.classList.add('aos-animate');
          // Stop observing this element
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Start observing all elements
    animatedElements.forEach(element => {
      // Check if element is already in viewport on load
      const rect = element.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0;

      if (inViewport) {
        // If already in viewport, animate immediately
        element.classList.add('aos-animate');
      } else {
        // Otherwise, observe for when it comes into view
        observer.observe(element);
      }
    });
  }
}
