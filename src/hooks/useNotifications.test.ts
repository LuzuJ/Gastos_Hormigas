import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useNotifications } from './useNotifications';

describe('Hook useNotifications', () => {
  beforeEach(() => {
    // Reset any global state if needed
  });

  it('debería inicializar con un array vacío de notificaciones', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
  });

  it('debería añadir una notificación correctamente', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        message: 'Test notification',
        type: 'warning'
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: expect.any(Number),
      message: 'Test notification',
      type: 'warning'
    });
  });

  it('debería añadir múltiples notificaciones', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        message: 'Primera notificación',
        type: 'warning'
      });
    });

    act(() => {
      result.current.addNotification({
        message: 'Segunda notificación',
        type: 'danger'
      });
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[0].message).toBe('Primera notificación');
    expect(result.current.notifications[1].message).toBe('Segunda notificación');
  });

  it('no debería añadir notificaciones duplicadas', () => {
    const { result } = renderHook(() => useNotifications());

    const notification = {
      message: 'Notificación duplicada',
      type: 'warning' as const
    };

    act(() => {
      result.current.addNotification(notification);
    });

    act(() => {
      result.current.addNotification(notification);
    });

    expect(result.current.notifications).toHaveLength(1);
  });

  it('debería eliminar una notificación por ID', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        message: 'Notificación a eliminar',
        type: 'danger'
      });
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.removeNotification(notificationId);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('debería eliminar solo la notificación específica', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        message: 'Primera notificación',
        type: 'warning'
      });
    });

    act(() => {
      result.current.addNotification({
        message: 'Segunda notificación',
        type: 'danger'
      });
    });

    const firstNotificationId = result.current.notifications[0].id;

    act(() => {
      result.current.removeNotification(firstNotificationId);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe('Segunda notificación');
  });

  it('no debería fallar al intentar eliminar una notificación inexistente', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        message: 'Test notification',
        type: 'warning'
      });
    });

    act(() => {
      result.current.removeNotification(99999); // ID inexistente
    });

    expect(result.current.notifications).toHaveLength(1);
  });

  it('debería generar IDs únicos para cada notificación', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        message: 'Primera',
        type: 'warning'
      });
    });

    act(() => {
      result.current.addNotification({
        message: 'Segunda',
        type: 'danger'
      });
    });

    const ids = result.current.notifications.map(n => n.id);
    expect(new Set(ids).size).toBe(2); // Todos los IDs son únicos
  });
});
