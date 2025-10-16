import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isMobileDevice } from './deviceDetection';

describe('deviceDetection', () => {
  beforeEach(() => {
    // Reset window properties before each test
    vi.stubGlobal('navigator', {
      userAgent: '',
      vendor: '',
      maxTouchPoints: 0,
    });
    
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('isMobileDevice', () => {
    it('should detect Android devices', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        vendor: '',
        maxTouchPoints: 1,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should detect iPhone devices', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        vendor: 'Apple Computer, Inc.',
        maxTouchPoints: 5,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should detect iPad devices', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        vendor: 'Apple Computer, Inc.',
        maxTouchPoints: 5,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should detect desktop devices', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        vendor: '',
        maxTouchPoints: 0,
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      expect(isMobileDevice()).toBe(false);
    });

    it('should detect touch-enabled small screens as mobile', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
        vendor: '',
        maxTouchPoints: 2,
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should not detect touch-enabled large screens as mobile', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
        vendor: '',
        maxTouchPoints: 2,
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      expect(isMobileDevice()).toBe(false);
    });

    it('should detect tablet devices as mobile', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Linux; Android 9; SM-T580) AppleWebKit/537.36',
        vendor: '',
        maxTouchPoints: 5,
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      expect(isMobileDevice()).toBe(true);
    });
  });
});
