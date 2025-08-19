// src/hooks/useExpenses.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExpenses } from './useExpenses';
import { expensesService } from '../services/expensesService';
import type { Expense, ExpenseFormData } from '../types';

// Mock variables de entorno
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_FIREBASE_API_KEY: 'mock-api-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'mock-auth-domain',
    VITE_FIREBASE_PROJECT_ID: 'mock-project-id',
    VITE_FIREBASE_STORAGE_BUCKET: 'mock-storage-bucket',
    VITE_FIREBASE_MESSAGING_SENDER_ID: 'mock-sender-id',
    VITE_FIREBASE_APP_ID: 'mock-app-id',
    VITE_FIREBASE_MEASUREMENT_ID: 'mock-measurement-id'
  },
  writable: true
});

// Mock Firebase completo
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
}));

// Mock Firebase Timestamp
const mockTimestamp = {
  toDate: () => new Date(),
  toMillis: () => Date.now(),
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: (Date.now() % 1000) * 1000000,
  isEqual: vi.fn(() => false),
  toJSON: vi.fn(() => ({}))
};

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  Timestamp: {
    now: vi.fn(() => mockTimestamp),
    fromDate: vi.fn((date: Date) => ({
      toDate: () => date,
      toMillis: () => date.getTime(),
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1000000,
      isEqual: vi.fn(() => false),
      toJSON: vi.fn(() => ({}))
    }))
  }
}));

// Mock del servicio de expenses
vi.mock('../services/expensesService');

// -- Mock de Datos --
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

// Mock timestamps para diferentes fechas
const todayTimestamp = {
  toDate: () => new Date(),
  toMillis: () => Date.now(),
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: (Date.now() % 1000) * 1000000,
  isEqual: vi.fn(() => false),
  toJSON: vi.fn(() => ({}))
};

const yesterdayTimestamp = {
  toDate: () => yesterday,
  toMillis: () => yesterday.getTime(),
  seconds: Math.floor(yesterday.getTime() / 1000),
  nanoseconds: (yesterday.getTime() % 1000) * 1000000,
  isEqual: vi.fn(() => false),
  toJSON: vi.fn(() => ({}))
};

const mockExpensesData: Expense[] = [
  { id: 'exp-1', description: 'Café', amount: 3.50, categoryId: 'cat-1', subCategory: 'Cafetería', createdAt: todayTimestamp as any },
  { id: 'exp-2', description: 'Libro', amount: 25.00, categoryId: 'cat-2', subCategory: 'Librería', createdAt: yesterdayTimestamp as any },
  { id: 'exp-3', description: 'Almuerzo', amount: 12.00, categoryId: 'cat-1', subCategory: 'Restaurante', createdAt: todayTimestamp as any },
];

describe('Hook useExpenses', () => {

  beforeEach(() => {
    vi.resetAllMocks();
    // Comportamiento por defecto para la desuscripción
    vi.mocked(expensesService.onExpensesUpdate).mockReturnValue(() => {});
  });

  it('debería cargar los gastos iniciales desde el servicio', async () => {
    vi.mocked(expensesService.onExpensesUpdate).mockImplementation((userId, callback) => {
      callback(mockExpensesData);
      return () => {};
    });

    const { result } = renderHook(() => useExpenses('test-user-id'));

    await waitFor(() => {
      expect(result.current.expenses).toHaveLength(3);
      expect(result.current.expenses[0].description).toBe('Café');
    });
  });

  it('debería calcular correctamente el total gastado hoy', async () => {
    vi.mocked(expensesService.onExpensesUpdate).mockImplementation((userId, callback) => {
      callback(mockExpensesData);
      return () => {};
    });

    const { result } = renderHook(() => useExpenses('test-user-id'));

    await waitFor(() => {
      // Debería sumar solo los gastos de hoy: 3.50 (Café) + 12.00 (Almuerzo) = 15.50
      expect(result.current.totalExpensesToday).toBe(15.50);
    });
  });

  it('debería llamar a expensesService.addExpense con los datos correctos', async () => {
    const { result } = renderHook(() => useExpenses('test-user-id'));
    const newExpense: ExpenseFormData = {
      description: 'Cena', amount: 30, categoryId: 'cat-1', subCategory: 'Restaurante',
      createdAt: mockTimestamp as any
    };

    await act(async () => {
      await result.current.addExpense(newExpense);
    });

    expect(expensesService.addExpense).toHaveBeenCalledTimes(1);
    expect(expensesService.addExpense).toHaveBeenCalledWith('test-user-id', newExpense);
  });

  it('debería llamar a expensesService.deleteExpense con el ID correcto', async () => {
    const { result } = renderHook(() => useExpenses('test-user-id'));

    await act(async () => {
      await result.current.deleteExpense('exp-to-delete');
    });

    expect(expensesService.deleteExpense).toHaveBeenCalledTimes(1);
    expect(expensesService.deleteExpense).toHaveBeenCalledWith('test-user-id', 'exp-to-delete');
  });

  it('debería actualizar el estado de isEditing correctamente', () => {
    const { result } = renderHook(() => useExpenses('test-user-id'));

    // Por defecto, no se está editando nada
    expect(result.current.isEditing).toBeNull();

    // Simulamos la acción de hacer clic en "editar" en un elemento de la lista
    act(() => {
      result.current.setIsEditing(mockExpensesData[0]);
    });

    // Verificamos que el estado se actualizó con el gasto correcto
    expect(result.current.isEditing).toEqual(mockExpensesData[0]);
  });

});