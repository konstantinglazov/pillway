import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  const STORAGE_KEY = 'pw-theme';

  function build(): ThemeService {
    TestBed.configureTestingModule({ providers: [ThemeService] });
    return TestBed.inject(ThemeService);
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  describe('constructor', () => {
    it('reads "dark" from localStorage and applies it', () => {
      localStorage.setItem(STORAGE_KEY, 'dark');
      const service = build();
      expect(service.isDark).toBeTrue();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('reads "light" from localStorage and applies it', () => {
      localStorage.setItem(STORAGE_KEY, 'light');
      const service = build();
      expect(service.isDark).toBeFalse();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('toggle()', () => {
    it('flips from light to dark', () => {
      localStorage.setItem(STORAGE_KEY, 'light');
      const service = build();
      service.toggle();
      expect(service.isDark).toBeTrue();
    });

    it('flips from dark to light', () => {
      localStorage.setItem(STORAGE_KEY, 'dark');
      const service = build();
      service.toggle();
      expect(service.isDark).toBeFalse();
    });

    it('persists the new theme to localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'light');
      const service = build();
      service.toggle();
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    });

    it('updates the data-theme attribute on the document root', () => {
      localStorage.setItem(STORAGE_KEY, 'light');
      const service = build();
      service.toggle();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('isDark getter', () => {
    it('is false when theme is light', () => {
      localStorage.setItem(STORAGE_KEY, 'light');
      expect(build().isDark).toBeFalse();
    });

    it('is true when theme is dark', () => {
      localStorage.setItem(STORAGE_KEY, 'dark');
      expect(build().isDark).toBeTrue();
    });
  });
});
