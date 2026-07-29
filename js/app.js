/**
 * Main Application Entry Point
 * Initializes all modules and components
 */

import { Navigation } from './modules/navigation.js';
import { ThemeManager } from './modules/theme.js';
import { Animations } from './modules/animations.js';

class App {
  constructor() {
    this.modules = {};
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onReady());
    } else {
      this.onReady();
    }
  }
  
  onReady() {
    // Initialize modules
    this.modules.navigation = new Navigation();
    this.modules.theme = new ThemeManager();
    this.modules.animations = new Animations();
    
    // Setup global features
    this.setupLazyLoading();
    this.setupFormHandling();
    this.setupPageTransitions();
    
    // Mark app as loaded
    document.body.classList.add('loaded');
    
    // Fallback: Force show all content after 1 second if animations haven't triggered
    setTimeout(() => {
      const hiddenElements = document.querySelectorAll('[data-aos]:not(.aos-animate)');
      hiddenElements.forEach(el => {
        el.classList.add('aos-animate');
      });
    }, 1000);
  }
  
  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
  
  setupFormHandling() {
    const forms = document.querySelectorAll('form[data-ajax]');
    
    forms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        try {
          const formData = new FormData(form);
          const response = await fetch(form.action, {
            method: form.method || 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            // Success
            form.reset();
            this.showNotification('Message sent successfully!', 'success');
          } else {
            throw new Error('Failed to send message');
          }
        } catch (error) {
          // Error
          this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
          // Reset button
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    });
  }
  
  setupPageTransitions() {
    // Smooth fade between pages
    const links = document.querySelectorAll('a:not([href^="#"]):not([href^="http"]):not([target="_blank"]):not([download])');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        
        document.body.classList.add('page-transition');
        
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    });
    
    // Handle browser back/forward
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        document.body.classList.remove('page-transition');
      }
    });
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    notification.setAttribute('role', type === 'error' ? 'alert' : 'status');
    notification.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    notification.setAttribute('aria-atomic', 'true');
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Create global app instance
window.app = new App();

// Export for use in other modules if needed
export default App;