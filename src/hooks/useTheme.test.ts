import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTheme } from './useTheme';

// Mock del localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock del document.documentElement
Object.defineProperty(document, 'documentElement', {
  value: {
    setAttribute: vi.fn(),
  },
  writable: true,
});

describe('Hook useTheme', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorageMock.getItem.mockReturnValue(null); // Por defecto no hay tema guardado
  });

  it('debería inicializar con tema "light" por defecto', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
  });

  it('debería inicializar con el tema guardado en localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('debería aplicar el tema al documento al inicializar', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    renderHook(() => useTheme());

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('debería cambiar de light a dark al usar toggleTheme', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('debería cambiar de dark a light al usar toggleTheme', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
  });

  it('debería aplicar el tema al documento y guardarlo en localStorage cuando cambia', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('debería actualizar isDark correctamente cuando cambia el tema', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.isDark).toBe(false);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(false);
  });

  it('debería leer del localStorage al inicializar', () => {
    renderHook(() => useTheme());

    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
  });

  it('debería manejar múltiples cambios de tema correctamente', () => {
    const { result } = renderHook(() => useTheme());

    // Light -> Dark
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');

    // Dark -> Light
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');

    // Light -> Dark otra vez
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');

    expect(localStorageMock.setItem).toHaveBeenCalledTimes(4); // Una vez en inicialización + 3 toggles
  });
});
