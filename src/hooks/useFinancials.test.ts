// src/hooks/useFinancials.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFinancials } from './useFinancials';
import { financialsService } from '../services/financialsService';
import { fixedExpenseService } from '../services/fixedExpenseService';
import type { Financials, FixedExpense } from '../types';

// 1. Mockeamos ambos servicios que utiliza este hook
vi.mock('../services/financialsService');
vi.mock('../services/fixedExpenseService');

// -- Mock de Datos --
const mockFinancialsData: Financials = { monthlyIncome: 3000 };
const mockFixedExpensesData: FixedExpense[] = [
  { id: 'fix-1', description: 'Renta', amount: 1200, category: 'Hogar', dayOfMonth: 1 },
  { id: 'fix-2', description: 'Gimnasio', amount: 50, category: 'Salud', dayOfMonth: 5 },
];

describe('Hook useFinancials', () => {

  beforeEach(() => {
    vi.resetAllMocks();
    // Comportamiento por defecto para evitar errores de desuscripción
    vi.mocked(financialsService.onFinancialsUpdate).mockReturnValue(() => {});
    vi.mocked(fixedExpenseService.onFixedExpensesUpdate).mockReturnValue(() => {});
  });

  it('debería obtener los datos financieros y los gastos fijos al iniciar', async () => {
    // Configuramos los mocks para que entreguen nuestros datos de prueba
    vi.mocked(financialsService.onFinancialsUpdate).mockImplementation((userId, callback) => {
      callback(mockFinancialsData);
      return () => {};
    });
    vi.mocked(fixedExpenseService.onFixedExpensesUpdate).mockImplementation((userId, callback) => {
      callback(mockFixedExpensesData);
      return () => {};
    });

    const { result } = renderHook(() => useFinancials('test-user-id'));

    // Esperamos a que el estado del hook se actualice con los datos de los mocks
    await waitFor(() => {
      expect(result.current.financials).toEqual(mockFinancialsData);
      expect(result.current.fixedExpenses).toEqual(mockFixedExpensesData);
    });
  });

  it('debería calcular correctamente el total de gastos fijos', async () => {
    vi.mocked(fixedExpenseService.onFixedExpensesUpdate).mockImplementation((userId, callback) => {
      callback(mockFixedExpensesData);
      return () => {};
    });

    const { result } = renderHook(() => useFinancials('test-user-id'));

    await waitFor(() => {
      // El total debería ser 1200 + 50 = 1250
      expect(result.current.totalFixedExpenses).toBe(1250);
    });
  });

  it('debería llamar a financialsService.setMonthlyIncome con el nuevo ingreso', async () => {
    const { result } = renderHook(() => useFinancials('test-user-id'));

    await act(async () => {
      await result.current.setMonthlyIncome(3500);
    });

    expect(financialsService.setMonthlyIncome).toHaveBeenCalledTimes(1);
    expect(financialsService.setMonthlyIncome).toHaveBeenCalledWith('test-user-id', 3500);
  });

  it('debería llamar a fixedExpenseService.addFixedExpense con los datos correctos', async () => {
    const { result } = renderHook(() => useFinancials('test-user-id'));
    const newFixedExpense = { description: 'Internet', amount: 60, category: 'Hogar', dayOfMonth: 10 };

    await act(async () => {
      await result.current.addFixedExpense(newFixedExpense);
    });

    expect(fixedExpenseService.addFixedExpense).toHaveBeenCalledTimes(1);
    expect(fixedExpenseService.addFixedExpense).toHaveBeenCalledWith('test-user-id', newFixedExpense);
  });
});