/**
 * Main Application Entry Point
 * Initializes all modules and components
 */

// Module URLs carry a version: _headers asks for no-cache on /js/*, but the
// zone's Browser Cache TTL caches them for 4h in production anyway, and this
// keeps a fresh app.js from pairing with stale cached modules. See CLAUDE.md
// (Important Notes 7) for bumping the token across every page, CSS and JS.
import { Navigation } from './modules/navigation.js?v=redesign-2';
import { ThemeManager } from './modules/theme.js?v=redesign-2';
import { Animations } from './modules/animations.js?v=redesign-2';

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
    this.setupFormHandling();
    
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