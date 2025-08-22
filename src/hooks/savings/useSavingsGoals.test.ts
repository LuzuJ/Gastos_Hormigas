import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSavingsGoals } from './useSavingsGoals';
import { savingsGoalService } from '../../services/savings/savingsGoalService';
import { runTransaction, doc, increment } from 'firebase/firestore';
import type { SavingsGoal } from '../../types';

// Mock de los servicios
vi.mock('../../services/savings/savingsGoalService', () => ({
  savingsGoalService: {
    onSavingsGoalsUpdate: vi.fn(),
    addSavingsGoal: vi.fn(),
    deleteSavingsGoal: vi.fn(),
  }
}));

const mockSavingsGoals: SavingsGoal[] = [
  { id: '1', name: 'Vacaciones', targetAmount: 2000, currentAmount: 500 },
  { id: '2', name: 'Auto Nuevo', targetAmount: 25000, currentAmount: 8000 },
];

describe('Hook useSavingsGoals', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock por defecto para evitar errores
    (savingsGoalService.onSavingsGoalsUpdate as any).mockReturnValue(() => {});
  });

  it('debería inicializar con array vacío y loading true', () => {
    const { result } = renderHook(() => useSavingsGoals('test-user'));

    expect(result.current.savingsGoals).toEqual([]);
    expect(result.current.loadingSavingsGoals).toBe(true);
  });

  it('debería manejar userId null correctamente', () => {
    const { result } = renderHook(() => useSavingsGoals(null));

    expect(result.current.savingsGoals).toEqual([]);
    expect(result.current.loadingSavingsGoals).toBe(false);
  });

  it('debería suscribirse a actualizaciones de metas de ahorro', () => {
    renderHook(() => useSavingsGoals('test-user'));

    expect(savingsGoalService.onSavingsGoalsUpdate).toHaveBeenCalledWith(
      'test-user',
      expect.any(Function)
    );
  });

  it('debería actualizar las metas cuando se reciben datos', async () => {
    (savingsGoalService.onSavingsGoalsUpdate as any).mockImplementation((userId: string, callback: (goals: SavingsGoal[]) => void) => {
      callback(mockSavingsGoals);
      return () => {};
    });

    const { result } = renderHook(() => useSavingsGoals('test-user'));

    await waitFor(() => {
      expect(result.current.savingsGoals).toEqual(mockSavingsGoals);
      expect(result.current.loadingSavingsGoals).toBe(false);
    });
  });

  it('debería agregar una meta de ahorro exitosamente', async () => {
    (savingsGoalService.addSavingsGoal as any).mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useSavingsGoals('test-user'));

    const newGoal = { name: 'Nueva Meta', targetAmount: 5000 };
    let addResult;

    await act(async () => {
      addResult = await result.current.addSavingsGoal(newGoal);
    });

    expect(addResult).toEqual({ success: true });
    expect(savingsGoalService.addSavingsGoal).toHaveBeenCalledWith('test-user', newGoal);
  });

  it('debería manejar errores al agregar meta de ahorro', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (savingsGoalService.addSavingsGoal as any).mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useSavingsGoals('test-user'));

    const newGoal = { name: 'Meta Fallida', targetAmount: 1000 };
    let addResult;

    await act(async () => {
      addResult = await result.current.addSavingsGoal(newGoal);
    });

    expect(addResult).toEqual({ 
      success: false, 
      error: "Database error"
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('no debería agregar meta si no hay usuario', async () => {
    const { result } = renderHook(() => useSavingsGoals(null));

    const newGoal = { name: 'Meta Sin Usuario', targetAmount: 1000 };
    let addResult;

    await act(async () => {
      addResult = await result.current.addSavingsGoal(newGoal);
    });

    expect(addResult).toEqual({ 
      success: false, 
      error: 'Usuario no autenticado' 
    });
    expect(savingsGoalService.addSavingsGoal).not.toHaveBeenCalled();
  });

  it('debería eliminar una meta de ahorro', async () => {
    (savingsGoalService.deleteSavingsGoal as any).mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useSavingsGoals('test-user'));

    await act(async () => {
      await result.current.deleteSavingsGoal('goal-123');
    });

    expect(savingsGoalService.deleteSavingsGoal).toHaveBeenCalledWith('test-user', 'goal-123');
  });

  it('debería agregar fondos a una meta exitosamente', async () => {
    const mockTransaction = {
      get: vi.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({ currentAmount: 500 })
      }),
      update: vi.fn()
    };

    (runTransaction as any).mockImplementation(async (db: any, transactionFn: any) => {
      return await transactionFn(mockTransaction as any);
    });

    (increment as any).mockReturnValue('MOCK_INCREMENT' as any);
    (doc as any).mockReturnValue('MOCK_DOC_REF' as any);

    const { result } = renderHook(() => useSavingsGoals('test-user'));

    let addResult;
    await act(async () => {
      addResult = await result.current.addToSavingsGoal('goal-123', 200);
    });

    expect(addResult).toEqual({ success: true });
    expect(doc).toHaveBeenCalledWith(
      expect.any(Object),
      'users',
      'test-user',
      'savingsGoals',
      'goal-123'
    );
    expect(increment).toHaveBeenCalledWith(200);
    expect(mockTransaction.update).toHaveBeenCalledWith('MOCK_DOC_REF', {
      currentAmount: 'MOCK_INCREMENT'
    });
  });

  it('debería manejar error al agregar fondos a meta inexistente', async () => {
    const mockTransaction = {
      get: vi.fn().mockResolvedValue({
        exists: () => false
      })
    };

    (runTransaction as any).mockImplementation(async (db: any, transactionFn: any) => {
      return await transactionFn(mockTransaction as any);
    });

    const { result } = renderHook(() => useSavingsGoals('test-user'));

    let addResult;
    await act(async () => {
      addResult = await result.current.addToSavingsGoal('goal-inexistente', 200);
    });

    expect(addResult).toEqual({ 
      success: false, 
      error: 'No se pudo actualizar la meta.' 
    });
  });

  it('debería rechazar montos inválidos al agregar fondos', async () => {
    const { result } = renderHook(() => useSavingsGoals('test-user'));

    let addResult;
    await act(async () => {
      addResult = await result.current.addToSavingsGoal('goal-123', -100);
    });

    expect(addResult).toEqual({ 
      success: false, 
      error: 'Monto inválido o usuario no autenticado.' 
    });
    expect(runTransaction).not.toHaveBeenCalled();
  });

  it('debería quitar fondos de una meta exitosamente', async () => {
    const mockTransaction = {
      get: vi.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({ currentAmount: 500 })
      }),
      update: vi.fn()
    };

    (runTransaction as any).mockImplementation(async (db: any, transactionFn: any) => {
      return await transactionFn(mockTransaction as any);
    });

    (increment as any).mockReturnValue('MOCK_DECREMENT' as any);

    const { result } = renderHook(() => useSavingsGoals('test-user'));

    let removeResult;
    await act(async () => {
      removeResult = await result.current.removeFromSavingsGoal('goal-123', 100);
    });

    expect(removeResult).toEqual({ success: true });
    expect(increment).toHaveBeenCalledWith(-100);
  });

  it('debería rechazar quitar más fondos de los disponibles', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    (runTransaction as any).mockImplementation(async (db: any, transactionFn: any) => {
      throw new Error("No puedes quitar más dinero del que has ahorrado.");
    });

    const { result } = renderHook(() => useSavingsGoals('test-user'));

    let removeResult;
    await act(async () => {
      removeResult = await result.current.removeFromSavingsGoal('goal-123', 500);
    });

    expect(removeResult).toEqual({ 
      success: false, 
      error: "No puedes quitar más dinero del que has ahorrado." 
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('debería limpiar la suscripción al desmontar', () => {
    const unsubscribe = vi.fn();
    (savingsGoalService.onSavingsGoalsUpdate as any).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useSavingsGoals('test-user'));

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('debería limpiar la suscripción al cambiar userId', () => {
    const unsubscribe = vi.fn();
    (savingsGoalService.onSavingsGoalsUpdate as any).mockReturnValue(unsubscribe);

    const { rerender } = renderHook(
      ({ userId }: { userId: string | null }) => useSavingsGoals(userId),
      { initialProps: { userId: 'user-1' as string | null } }
    );

    rerender({ userId: 'user-2' });

    expect(unsubscribe).toHaveBeenCalled();
  });
});
