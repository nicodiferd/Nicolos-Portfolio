/**
 * Theme Module
 * Handles theme switching and persistence
 */

export class ThemeManager {
  constructor() {
    this.themeSelectors = document.querySelectorAll('[data-theme-selector]');
    this.root = document.documentElement;
    this.themeColorMeta = document.querySelector('meta[name="theme-color"]');
    this.themeColors = { light: '#f5f2ec', dark: '#0d0d0f' };
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

  // localStorage can throw (private mode, blocked site data); fall back to the default theme
  getSavedTheme() {
    try {
      return localStorage.getItem(this.storageKey);
    } catch (e) {
      return null;
    }
  }

  saveTheme(themeName) {
    try {
      localStorage.setItem(this.storageKey, themeName);
    } catch (e) {
      // Not persisted; the choice still applies for this page view
    }
  }

  loadTheme() {
    const savedTheme = this.getSavedTheme();
    const theme = this.themes[savedTheme] ? savedTheme : this.defaultTheme;
    this.setTheme(theme);
  }

  setTheme(themeName, systemThemeName = this.getSystemThemeName()) {
    if (!this.themes[themeName]) return;

    // Remove all theme classes
    Object.values(this.themes).forEach(theme => {
      if (theme.class) this.root.classList.remove(theme.class);
    });

    // Add new theme class
    const effectiveTheme = themeName === 'system' ? systemThemeName : themeName;
    const themeDef = this.themes[effectiveTheme];
    if (themeDef?.class) this.root.classList.add(themeDef.class);
    this.root.setAttribute('data-theme', effectiveTheme);

    // Browser chrome follows the page theme, not the OS scheme
    if (this.themeColorMeta && this.themeColors[effectiveTheme]) {
      this.themeColorMeta.setAttribute('content', this.themeColors[effectiveTheme]);
    }

    // Update selectors
    this.themeSelectors.forEach(selector => {
      selector.value = themeName;
    });
  }

  getSystemThemeName() {
    if (!window.matchMedia) return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  setupThemeSelectors() {
    this.themeSelectors.forEach(selector => {
      selector.addEventListener('change', (e) => {
        this.setTheme(e.target.value);
        // Only an explicit choice is saved, so first visits keep following the default
        this.saveTheme(e.target.value);
      });
    });
  }

  setupSystemThemeDetection() {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (e) => {
      const saved = this.getSavedTheme() || this.defaultTheme;
      // If user preference is 'system', update effective theme
      if (saved === 'system') {
        this.setTheme('system', e.matches ? 'light' : 'dark');
      }
    };

    // Safari < 14 only has the deprecated addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(onChange);
    }
  }
}
