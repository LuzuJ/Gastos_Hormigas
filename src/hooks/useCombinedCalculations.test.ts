import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCombinedCalculations } from './useCombinedCalculations';
import { Timestamp } from 'firebase/firestore';
import type { Expense, Category } from '../types';

// Mock de Timestamp
vi.mock('firebase/firestore', () => ({
  Timestamp: {
    fromDate: vi.fn((date) => ({
      toDate: () => date,
      seconds: date.getTime() / 1000
    }))
  }
}));

describe('Hook useCombinedCalculations', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Alimentación',
      budget: 500,
      subcategories: [{ id: 'sub-1', name: 'Restaurante' }]
    },
    {
      id: 'cat-2',
      name: 'Transporte',
      budget: 200,
      subcategories: [{ id: 'sub-2', name: 'Combustible' }]
    },
    {
      id: 'cat-3',
      name: 'Entretenimiento',
      subcategories: [{ id: 'sub-3', name: 'Cine' }]
    }
  ];

  const currentDate = new Date('2024-03-15');
  const mockAddNotification = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(currentDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMockExpense = (
    id: string,
    categoryId: string,
    amount: number,
    date: Date
  ): Expense => ({
    id,
    description: `Gasto ${id}`,
    amount,
    categoryId,
    subCategory: 'Test',
    createdAt: Timestamp.fromDate(date) as any
  });

  it('debería calcular gastos mensuales por categoría correctamente', () => {
    const expenses: Expense[] = [
      createMockExpense('1', 'cat-1', 100, new Date('2024-03-10')), // Mes actual
      createMockExpense('2', 'cat-1', 150, new Date('2024-03-12')), // Mes actual
      createMockExpense('3', 'cat-2', 80, new Date('2024-03-05')),  // Mes actual
      createMockExpense('4', 'cat-1', 200, new Date('2024-02-15')), // Mes anterior
    ];

    const { result } = renderHook(() =>
      useCombinedCalculations({
        expenses,
        categories: mockCategories,
        totalFixedExpenses: 0,
        addNotification: mockAddNotification
      })
    );

    expect(result.current.monthlyExpensesByCategory).toEqual([
      { name: 'Alimentación', value: 250 }, // 100 + 150
      { name: 'Transporte', value: 80 }
    ]);
  });

  it('debería calcular el total de gastos del mes actual', () => {
    const expenses: Expense[] = [
      createMockExpense('1', 'cat-1', 100, new Date('2024-03-10')),
      createMockExpense('2', 'cat-2', 80, new Date('2024-03-12')),
      createMockExpense('3', 'cat-1', 200, new Date('2024-02-15')), // Mes anterior
    ];

    const { result } = renderHook(() =>
      useCombinedCalculations({
        expenses,
        categories: mockCategories,
        totalFixedExpenses: 300,
        addNotification: mockAddNotification
      })
    );

    expect(result.current.totalExpensesMonth).toBe(180); // 100 + 80
  });

  it('debería generar datos de tendencia mensual para los últimos 6 meses', () => {
    const expenses: Expense[] = [
      createMockExpense('1', 'cat-1', 100, new Date('2024-03-10')), // Mar 2024
      createMockExpense('2', 'cat-1', 150, new Date('2024-02-15')), // Feb 2024
      createMockExpense('3', 'cat-2', 80, new Date('2024-01-20')),  // Ene 2024
      createMockExpense('4', 'cat-1', 200, new Date('2023-08-15')), // Muy viejo - no debería incluirse
    ];

    const { result } = renderHook(() =>
      useCombinedCalculations({
        expenses,
        categories: mockCategories,
        totalFixedExpenses: 0,
        addNotification: mockAddNotification
      })
    );

    const trend = result.current.monthlyExpensesTrend;
    
    // Debería tener 6 meses
    expect(trend).toHaveLength(6);
    
    // Verificar que incluye los meses correctos
    const monthNames = trend.map(t => t.name);
    expect(monthNames).toContain("Mar '24");
    expect(monthNames).toContain("Feb '24");
    expect(monthNames).toContain("Ene '24");
    
    // Verificar totales
    const marData = trend.find(t => t.name === "Mar '24");
    const febData = trend.find(t => t.name === "Feb '24");
    const eneData = trend.find(t => t.name === "Ene '24");
    
    expect(marData?.total).toBe(100);
    expect(febData?.total).toBe(150);
    expect(eneData?.total).toBe(80);
  });

  it('debería generar datos comparativos entre mes actual y anterior', () => {
    const expenses: Expense[] = [
      // Marzo 2024 (mes actual)
      createMockExpense('1', 'cat-1', 200, new Date('2024-03-10')),
      createMockExpense('2', 'cat-2', 100, new Date('2024-03-12')),
      
      // Febrero 2024 (mes anterior)
      createMockExpense('3', 'cat-1', 150, new Date('2024-02-15')),
      createMockExpense('4', 'cat-2', 80, new Date('2024-02-20')),
      
      // Enero 2024 (no debería aparecer en comparativo)
      createMockExpense('5', 'cat-1', 300, new Date('2024-01-10')),
    ];

    const { result } = renderHook(() =>
      useCombinedCalculations({
        expenses,
        categories: mockCategories,
        totalFixedExpenses: 0,
        addNotification: mockAddNotification
      })
    );

    const comparative = result.current.comparativeExpenses;
    
    expect(comparative).toEqual([
      { name: 'Alimentación', actual: 200, anterior: 150 },
      { name: 'Transporte', actual: 100, anterior: 80 }
    ]);
  });

  it('debería filtrar categorías sin gastos en datos comparativos', () => {
    const expenses: Expense[] = [
      createMockExpense('1', 'cat-1', 200, new Date('2024-03-10')),
      // No hay gastos en cat-2 ni cat-3
    ];

    const { result } = renderHook(() =>
      useCombinedCalculations({
        expenses,
        categories: mockCategories,
        totalFixedExpenses: 0,
        addNotification: mockAddNotification
      })
    );

    const comparative = result.current.comparativeExpenses;
    
    expect(comparative).toEqual([
      { name: 'Alimentación', actual: 200, anterior: 0 }
    ]);
  });

  it('debería enviar notificación de advertencia al alcanzar 80% del presupuesto', () => {
    const expenses: Expense[] = [
      createMockExpense('1', 'cat-1', 400, new Date('2024-03-10')), // 80% de 500
    ];

    renderHook(() =>
      useCombinedCalculations({
        expenses,
        categories: mockCategories,
        totalFixedExpenses: 0,
        addNotification: mockAddNotification
      })
    );

    expect(mockAddNotification).toHaveBeenCalledWith({
      message: 'Estás cerca del 80% de tu presupuesto de Alimentación.',
      type: 'warning'
    });
  });

  it('debería enviar notificación de peligro al superar el presupuesto', () => {
    const expenses: Expense[] = [
      createMockExpense('1', 'cat-1', 600, new Date('2024-03-10')), // 120% de 500
    ];

    renderHook(() =>
      useCombinedCalculations({
        expenses,
        categories: mockCategories,
        totalFixedExpenses: 0,
        addNotification: mockAddNotification
      })
    );

    expect(mockAddNotification).toHaveBeenCalledWith({
      message: 'Has superado tu presupuesto de Alimentación.',
      type: 'danger'
    });
  });

  it('no debería enviar notificaciones para categorías sin presupuesto', () => {
    const expenses: Expense[] = [
      createMockExpense('1', 'cat-3', 1000, new Date('2024-03-10')), // cat-3 no tiene presupuesto
    ];

    renderHook(() =>
      useCombinedCalculations({
        expenses,
        categories: mockCategories,
        totalFixedExpenses: 0,
        addNotification: mockAddNotification
      })
    );

    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it('debería manejar gastos con categorías inexistentes', () => {
    const expenses: Expense[] = [
      createMockExpense('1', 'cat-inexistente', 100, new Date('2024-03-10')),
    ];

    const { result } = renderHook(() =>
      useCombinedCalculations({
        expenses,
        categories: mockCategories,
        totalFixedExpenses: 0,
        addNotification: mockAddNotification
      })
    );

    expect(result.current.monthlyExpensesByCategory).toEqual([
      { name: 'Desconocida', value: 100 }
    ]);
  });

  it('debería manejar gastos sin fecha correctamente', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        description: 'Gasto sin fecha',
        amount: 100,
        categoryId: 'cat-1',
        subCategory: 'Test',
        createdAt: null
      },
      createMockExpense('2', 'cat-1', 200, new Date('2024-03-10')),
    ];

    const { result } = renderHook(() =>
      useCombinedCalculations({
        expenses,
        categories: mockCategories,
        totalFixedExpenses: 0,
        addNotification: mockAddNotification
      })
    );

    // Solo debería contar el gasto con fecha válida
    expect(result.current.totalExpensesMonth).toBe(200);
    expect(result.current.monthlyExpensesByCategory).toEqual([
      { name: 'Alimentación', value: 200 }
    ]);
  });
});
