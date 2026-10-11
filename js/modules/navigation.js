/**
 * Navigation Module
 * Handles navigation behavior, mobile menu, scroll effects, and the skip link.
 * In-page anchor links scroll natively (html { scroll-behavior: smooth;
 * scroll-padding-top } in base.css), so the URL hash updates and reduced
 * motion is respected.
 */

export class Navigation {
  constructor() {
    this.nav = document.querySelector('.navigation');
    this.mobileToggle = document.querySelector('.navigation__toggle');
    this.mobileToggles = document.querySelectorAll('.navigation__toggle');
    this.mobileMenu = document.querySelector('.navigation__mobile');
    this.mobileOverlay = document.querySelector('.navigation__overlay');
    this.navLinks = document.querySelectorAll('.navigation__link');
    this.firstFocusable = null;
    this.lastFocusable = null;

    this.init();
  }

  init() {
    this.setupScrollEffect();
    this.setupMobileMenu();
    this.setupActiveLinks();
    this.setupSkipLink();
  }

  setupScrollEffect() {
    if (!this.nav) return;
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      // Add/remove scrolled class
      if (currentScroll > 50) {
        this.nav.classList.add('scrolled');
      } else {
        this.nav.classList.remove('scrolled');
      }

      // Hide/show on scroll
      if (currentScroll > lastScroll && currentScroll > 100) {
        this.nav.style.transform = 'translateY(-100%)';
      } else {
        this.nav.style.transform = 'translateY(0)';
      }

      lastScroll = currentScroll;
    });
  }

  setupMobileMenu() {
    if (!this.mobileToggle || !this.mobileMenu) return;

    // Closed menu stays out of the tab order and accessibility tree
    // (CSS also sets visibility: hidden while closed)
    this.mobileMenu.inert = true;

    this.mobileToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    });

    this.mobileOverlay?.addEventListener('click', () => {
      this.closeMobileMenu();
    });

    // Close menu when clicking on links. Focus is left to the link's own
    // navigation (in-page jump or page load) instead of the toggle.
    const mobileLinks = document.querySelectorAll('.navigation__mobile-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu({ restoreFocus: false });
      });
    });

    // Escape closes the menu and returns focus to the toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMobileMenuOpen()) {
        this.closeMobileMenu();
      }
    });

    // Trap focus inside mobile menu when open
    this.mobileMenu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      if (!this.firstFocusable || !this.lastFocusable) return;
      if (e.shiftKey && document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable.focus();
      }
    });

    // The menu is display: none above 768px; close it if the viewport grows
    // past that while open, so body scrolling is not left locked
    const desktop = window.matchMedia('(min-width: 769px)');
    const onBreakpoint = (e) => {
      if (e.matches && this.isMobileMenuOpen()) {
        this.closeMobileMenu({ restoreFocus: false });
      }
    };
    if (desktop.addEventListener) {
      desktop.addEventListener('change', onBreakpoint);
    } else if (desktop.addListener) {
      desktop.addListener(onBreakpoint);
    }
  }

  isMobileMenuOpen() {
    return this.mobileMenu.classList.contains('active');
  }

  toggleMobileMenu() {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.mobileMenu.inert = false;
    this.mobileMenu.classList.add('active');
    this.mobileOverlay?.classList.add('active');
    this.mobileToggle.classList.add('active');
    document.body.style.overflow = 'hidden';

    // ARIA state
    this.mobileMenu.setAttribute('aria-hidden', 'false');
    this.mobileToggles.forEach(t => t.setAttribute('aria-expanded', 'true'));

    // Focusable elements
    const focusables = this.mobileMenu.querySelectorAll('a, button, select, [tabindex]:not([tabindex="-1"])');
    this.firstFocusable = focusables[0];
    this.lastFocusable = focusables[focusables.length - 1];
    this.firstFocusable?.focus();
  }

  closeMobileMenu({ restoreFocus = true } = {}) {
    this.mobileMenu.classList.remove('active');
    this.mobileOverlay?.classList.remove('active');
    this.mobileToggle.classList.remove('active');
    document.body.style.overflow = '';

    // ARIA state
    this.mobileMenu.setAttribute('aria-hidden', 'true');
    this.mobileMenu.inert = true;
    this.mobileToggles.forEach(t => t.setAttribute('aria-expanded', 'false'));
    if (restoreFocus) this.mobileToggle.focus();
  }

  setupActiveLinks() {
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;

      sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    });
  }

  setupSkipLink() {
    // The native jump scrolls to the target but browsers differ on moving
    // keyboard focus, so focus it explicitly (main#content has tabindex="-1")
    document.querySelectorAll('.skip-link').forEach(link => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        const target = href && href.length > 1 ? document.getElementById(href.slice(1)) : null;
        if (!target) return;
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }
}
