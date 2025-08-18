import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserProfile } from './useUserProfile';
import { userService } from '../services/userService';
import { auth } from '../config/firebase';
import type { UserProfile } from '../types';

// Mock de los servicios y auth
vi.mock('../services/userService');
vi.mock('../config/firebase', () => ({
  auth: {
    currentUser: null
  }
}));

const mockProfile: UserProfile = {
  displayName: 'Juan Pérez',
  email: 'juan@example.com',
  currency: 'USD'
};

const mockUser = {
  uid: 'test-user',
  displayName: 'Test User',
  email: 'test@example.com'
};

describe('Hook useUserProfile', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (auth as any).currentUser = null;
  });

  it('debería inicializar con perfil null y loading true', () => {
    const { result } = renderHook(() => useUserProfile('test-user'));

    expect(result.current.profile).toBeNull();
    expect(result.current.loadingProfile).toBe(true);
  });

  it('debería manejar userId null correctamente', () => {
    const { result } = renderHook(() => useUserProfile(null));

    expect(result.current.profile).toBeNull();
    expect(result.current.loadingProfile).toBe(false);
  });

  it('debería cargar el perfil cuando existe', async () => {
    vi.mocked(userService.getUserProfile).mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useUserProfile('test-user'));

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.loadingProfile).toBe(false);
    });

    expect(userService.getUserProfile).toHaveBeenCalledWith('test-user');
  });

  it('debería crear perfil automáticamente si no existe y hay usuario autenticado', async () => {
    (auth as any).currentUser = mockUser;
    
    vi.mocked(userService.getUserProfile)
      .mockResolvedValueOnce(null) // Primera llamada - no existe
      .mockResolvedValueOnce(mockProfile); // Segunda llamada - ya existe después de crear
    
    vi.mocked(userService.createUserProfile).mockResolvedValue();

    const { result } = renderHook(() => useUserProfile('test-user'));

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.loadingProfile).toBe(false);
    });

    expect(userService.createUserProfile).toHaveBeenCalledWith(mockUser);
    expect(userService.getUserProfile).toHaveBeenCalledTimes(2);
  });

  it('debería manejar errores al cargar el perfil', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(userService.getUserProfile).mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useUserProfile('test-user'));

    await waitFor(() => {
      expect(result.current.profile).toBeNull();
      expect(result.current.loadingProfile).toBe(false);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar el perfil:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('debería actualizar el perfil correctamente', async () => {
    vi.mocked(userService.getUserProfile).mockResolvedValue(mockProfile);
    vi.mocked(userService.updateUserProfile).mockResolvedValue();

    const updatedProfile = { ...mockProfile, displayName: 'Juan Carlos' };
    vi.mocked(userService.getUserProfile)
      .mockResolvedValueOnce(mockProfile) // Carga inicial
      .mockResolvedValueOnce(updatedProfile); // Después de actualizar

    const { result } = renderHook(() => useUserProfile('test-user'));

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile);
    });

    await act(async () => {
      await result.current.updateUserProfile({ displayName: 'Juan Carlos' });
    });

    await waitFor(() => {
      expect(result.current.profile).toEqual(updatedProfile);
    });

    expect(userService.updateUserProfile).toHaveBeenCalledWith('test-user', { displayName: 'Juan Carlos' });
    expect(userService.getUserProfile).toHaveBeenCalledTimes(2);
  });

  it('no debería actualizar si no hay userId', async () => {
    const { result } = renderHook(() => useUserProfile(null));

    await act(async () => {
      await result.current.updateUserProfile({ displayName: 'Nuevo Nombre' });
    });

    expect(userService.updateUserProfile).not.toHaveBeenCalled();
  });

  it('debería recargar el perfil cuando cambia el userId', async () => {
    vi.mocked(userService.getUserProfile).mockResolvedValue(mockProfile);

    const { rerender } = renderHook(
      ({ userId }: { userId: string | null }) => useUserProfile(userId),
      { initialProps: { userId: 'user-1' as string | null } }
    );

    await waitFor(() => {
      expect(userService.getUserProfile).toHaveBeenCalledWith('user-1');
    });

    rerender({ userId: 'user-2' });

    await waitFor(() => {
      expect(userService.getUserProfile).toHaveBeenCalledWith('user-2');
    });
  });

  it('debería limpiar el perfil cuando userId cambia a null', () => {
    const { result, rerender } = renderHook(
      ({ userId }: { userId: string | null }) => useUserProfile(userId),
      { initialProps: { userId: 'test-user' as string | null } }
    );

    rerender({ userId: null });

    expect(result.current.profile).toBeNull();
    expect(result.current.loadingProfile).toBe(false);
  });

  it('debería manejar múltiples actualizaciones de perfil', async () => {
    vi.mocked(userService.getUserProfile).mockResolvedValue(mockProfile);
    vi.mocked(userService.updateUserProfile).mockResolvedValue();

    const { result } = renderHook(() => useUserProfile('test-user'));

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile);
    });

    // Primera actualización
    await act(async () => {
      await result.current.updateUserProfile({ displayName: 'Nombre 1' });
    });

    // Segunda actualización
    await act(async () => {
      await result.current.updateUserProfile({ currency: 'EUR' });
    });

    expect(userService.updateUserProfile).toHaveBeenCalledTimes(2);
    expect(userService.updateUserProfile).toHaveBeenNthCalledWith(1, 'test-user', { displayName: 'Nombre 1' });
    expect(userService.updateUserProfile).toHaveBeenNthCalledWith(2, 'test-user', { currency: 'EUR' });
  });
});
