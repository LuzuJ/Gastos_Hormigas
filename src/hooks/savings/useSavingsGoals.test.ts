import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSavingsGoals } from './useSavingsGoals';
import { savingsGoalServiceRepo } from '../../services/savings/savingsGoalServiceRepo';
import type { SavingsGoal, SavingsGoalFormData } from '../../types';

// Mock de los servicios con patrón repositorio
vi.mock('../../services/savings/savingsGoalServiceRepo', () => ({
  savingsGoalServiceRepo: {
    onSavingsGoalsUpdate: vi.fn(),
    addSavingsGoal: vi.fn(),
    deleteSavingsGoal: vi.fn(),
    updateSavingsGoalAmount: vi.fn(),
  }
}));

// Mock del hook de loading state
vi.mock('../context/useLoadingState', () => ({
  useLoadingState: vi.fn(() => ({
    loading: false,
    error: null,
    startLoading: vi.fn(),
    stopLoading: vi.fn(),
    clearError: vi.fn()
  })),
  handleAsyncOperation: vi.fn()
}));

describe('useSavingsGoals', () => {
  const userId = 'test-user';
  const mockGoals: SavingsGoal[] = [
    {
      id: 'goal-1',
      name: 'Vacaciones',
      targetAmount: 5000,
      currentAmount: 1500
    },
    {
      id: 'goal-2', 
      name: 'Casa nueva',
      targetAmount: 20000,
      currentAmount: 8000
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (savingsGoalServiceRepo.onSavingsGoalsUpdate as any) = vi.fn().mockReturnValue(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debería inicializar con el estado correcto', () => {
    const { result } = renderHook(() => useSavingsGoals(userId));

    expect(result.current.savingsGoals).toEqual([]);
    expect(result.current.loadingSavingsGoals).toBe(true); // Inicialmente cargando
    expect(result.current.savingsGoalsError).toBe(null);
  });

  it('debería suscribirse a actualizaciones cuando se proporciona userId', () => {
    renderHook(() => useSavingsGoals(userId));

    expect(savingsGoalServiceRepo.onSavingsGoalsUpdate).toHaveBeenCalledWith(
      userId,
      expect.any(Function)
    );
  });

  it('debería actualizar savings goals cuando hay datos disponibles', async () => {
    (savingsGoalServiceRepo.onSavingsGoalsUpdate as any) = vi.fn().mockImplementation((userId: string, callback: (goals: SavingsGoal[]) => void) => {
      // Simula la llamada inmediata del callback con datos
      setTimeout(() => callback(mockGoals), 0);
      return () => {};
    });

    const { result } = renderHook(() => useSavingsGoals(userId));

    await waitFor(() => {
      expect(result.current.savingsGoals).toEqual(mockGoals);
    });
  });

  it('debería agregar una nueva meta de ahorro', async () => {
    (savingsGoalServiceRepo.addSavingsGoal as any) = vi.fn().mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => useSavingsGoals(userId));
    
    const newGoal: SavingsGoalFormData = {
      name: 'Nueva meta',
      targetAmount: 3000
    };

    await act(async () => {
      await result.current.addSavingsGoal(newGoal);
    });

    expect(savingsGoalServiceRepo.addSavingsGoal).toHaveBeenCalledWith(userId, newGoal);
  });

  it('debería manejar errores al agregar meta de ahorro', async () => {
    (savingsGoalServiceRepo.addSavingsGoal as any) = vi.fn().mockRejectedValue(new Error('Database error'));
    
    const { result } = renderHook(() => useSavingsGoals(userId));
    
    const newGoal: SavingsGoalFormData = {
      name: 'Nueva meta',
      targetAmount: 3000
    };

    await act(async () => {
      const response = await result.current.addSavingsGoal(newGoal);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Error al agregar la meta de ahorro');
    });
  });

  it('debería eliminar una meta de ahorro', async () => {
    (savingsGoalServiceRepo.deleteSavingsGoal as any) = vi.fn().mockResolvedValue(true);
    
    const { result } = renderHook(() => useSavingsGoals(userId));

    await act(async () => {
      await result.current.deleteSavingsGoal('goal-123');
    });

    expect(savingsGoalServiceRepo.deleteSavingsGoal).toHaveBeenCalledWith(userId, 'goal-123');
  });

  it('debería agregar monto a una meta', async () => {
    (savingsGoalServiceRepo.updateSavingsGoalAmount as any) = vi.fn().mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => useSavingsGoals(userId));

    await act(async () => {
      const response = await result.current.addAmountToGoal('goal-123', 200);
      expect(response.success).toBe(true);
    });

    expect(savingsGoalServiceRepo.updateSavingsGoalAmount).toHaveBeenCalledWith(userId, 'goal-123', 200);
  });

  it('debería restar monto de una meta', async () => {
    (savingsGoalServiceRepo.updateSavingsGoalAmount as any) = vi.fn().mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => useSavingsGoals(userId));

    await act(async () => {
      const response = await result.current.subtractAmountFromGoal('goal-123', 100);
      expect(response.success).toBe(true);
    });

    expect(savingsGoalServiceRepo.updateSavingsGoalAmount).toHaveBeenCalledWith(userId, 'goal-123', -100);
  });

  it('debería validar que el monto sea positivo al agregar', async () => {
    const { result } = renderHook(() => useSavingsGoals(userId));

    await act(async () => {
      const response = await result.current.addAmountToGoal('goal-123', -100);
      expect(response.success).toBe(false);
      expect(response.error).toBe('El monto debe ser mayor a 0');
    });

    expect(savingsGoalServiceRepo.updateSavingsGoalAmount).not.toHaveBeenCalled();
  });

  it('debería validar que el monto sea positivo al restar', async () => {
    const { result } = renderHook(() => useSavingsGoals(userId));

    await act(async () => {
      const response = await result.current.subtractAmountFromGoal('goal-123', -100);
      expect(response.success).toBe(false);
      expect(response.error).toBe('El monto debe ser mayor a 0');
    });

    expect(savingsGoalServiceRepo.updateSavingsGoalAmount).not.toHaveBeenCalled();
  });

  it('debería manejar el caso cuando no hay userId', () => {
    const { result } = renderHook(() => useSavingsGoals(null));

    expect(result.current.savingsGoals).toEqual([]);
    expect(savingsGoalServiceRepo.onSavingsGoalsUpdate).not.toHaveBeenCalled();
  });

  it('debería retornar error cuando no hay usuario autenticado para agregar meta', async () => {
    const { result } = renderHook(() => useSavingsGoals(null));
    
    const newGoal: SavingsGoalFormData = {
      name: 'Nueva meta',
      targetAmount: 3000
    };

    await act(async () => {
      const response = await result.current.addSavingsGoal(newGoal);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Usuario no autenticado');
    });

    expect(savingsGoalServiceRepo.addSavingsGoal).not.toHaveBeenCalled();
  });

  it('debería retornar error cuando no hay usuario autenticado para eliminar meta', async () => {
    const { result } = renderHook(() => useSavingsGoals(null));

    await act(async () => {
      const response = await result.current.deleteSavingsGoal('goal-123');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Usuario no autenticado');
    });

    expect(savingsGoalServiceRepo.deleteSavingsGoal).not.toHaveBeenCalled();
  });

  it('debería retornar error cuando no hay usuario autenticado para agregar monto', async () => {
    const { result } = renderHook(() => useSavingsGoals(null));

    await act(async () => {
      const response = await result.current.addAmountToGoal('goal-123', 200);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Usuario no autenticado');
    });

    expect(savingsGoalServiceRepo.updateSavingsGoalAmount).not.toHaveBeenCalled();
  });

  it('debería limpiar la suscripción al desmontar el componente', () => {
    const mockUnsubscribe = vi.fn();
    (savingsGoalServiceRepo.onSavingsGoalsUpdate as any) = vi.fn().mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useSavingsGoals(userId));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});