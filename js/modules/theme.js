/**
 * Theme Module
 * Handles theme switching and persistence
 */

export class ThemeManager {
  constructor() {
    this.themeSelectors = document.querySelectorAll('[data-theme-selector]');
    this.root = document.documentElement;
    this.storageKey = 'preferredTheme';
    this.defaultTheme = 'light';
    
    this.themes = {
      system: { name: 'System', class: '' },
      dark: { name: 'Dark', class: 'dark' },
      light: { name: 'Light', class: 'light' }
    };
    
    this.init();
  }
  
  init() {
    this.loadTheme();
    this.setupThemeSelectors();
    this.setupSystemThemeDetection();
  }
  
  loadTheme() {
    const savedTheme = localStorage.getItem(this.storageKey);
    const systemTheme = this.getSystemThemeName();
    const theme = savedTheme || this.defaultTheme;
    this.setTheme(theme, systemTheme);
  }
  
  setTheme(themeName, systemThemeName = this.getSystemThemeName()) {
    // Remove all theme classes
    Object.values(this.themes).forEach(theme => {
      if (theme.class) this.root.classList.remove(theme.class);
    });
    
    // Add new theme class
    if (this.themes[themeName]) {
      const effectiveTheme = themeName === 'system' ? systemThemeName : themeName;
      const themeDef = this.themes[effectiveTheme];
      if (themeDef?.class) this.root.classList.add(themeDef.class);
      this.root.setAttribute('data-theme', effectiveTheme);
      
      // Update selectors
      this.themeSelectors.forEach(selector => {
        selector.value = themeName;
      });
      
      // Save preference
      localStorage.setItem(this.storageKey, themeName);
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme: effectiveTheme, preference: themeName }
      }));
    }
  }
  
  getSystemThemeName() {
    if (!window.matchMedia) return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  
  setupThemeSelectors() {
    this.themeSelectors.forEach(selector => {
      selector.addEventListener('change', (e) => {
        this.setTheme(e.target.value);
      });
    });
  }
  
  setupSystemThemeDetection() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      
      mediaQuery.addEventListener('change', (e) => {
        const saved = localStorage.getItem(this.storageKey) || this.defaultTheme;
        // If user preference is 'system', update effective theme
        if (saved === 'system') {
          this.setTheme('system', e.matches ? 'light' : 'dark');
        }
      });
    }
  }
  
  cycleTheme() {
    const themeNames = Object.keys(this.themes);
    const currentTheme = this.root.getAttribute('data-theme') || this.defaultTheme;
    const currentIndex = themeNames.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    
    this.setTheme(themeNames[nextIndex]);
  }
}