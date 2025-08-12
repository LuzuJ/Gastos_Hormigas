import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixedExpenseService } from './fixedExpenseService';
import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';
import type { FixedExpense } from '../types';

// Mockeamos la librería de firestore
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  const collectionRef = { path: 'mock/collection' };
  const docRef = { id: 'mock-doc-id' };

  return {
    ...actual,
    getFirestore: vi.fn(),
    collection: vi.fn(() => collectionRef),
    doc: vi.fn(() => docRef),
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(),
  };
});

describe('Servicio fixedExpenseService', () => {
  const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
  const userId = 'test-user-fixed';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('addFixedExpense debería llamar a addDoc con los datos correctos', async () => {
    const newFixedExpenseData: Omit<FixedExpense, 'id'> = {
      description: 'Suscripción a plataforma',
      amount: 15.99,
      category: 'Entretenimiento',
      dayOfMonth: 20,
    };

    await fixedExpenseService.addFixedExpense(userId, newFixedExpenseData);

    // Verificamos que se apunta a la colección correcta
    expect(collection).toHaveBeenCalledWith(undefined, 'artifacts', appId, 'users', userId, 'fixedExpenses');

    // Verificamos que se llama a addDoc con los datos correctos
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), newFixedExpenseData);
  });

  it('deleteFixedExpense debería llamar a doc y deleteDoc con la ruta correcta', async () => {
    const fixedExpenseId = 'fixed-exp-to-delete';

    await fixedExpenseService.deleteFixedExpense(userId, fixedExpenseId);

    // Verificamos que el servicio NO usa getFixedExpensesCollectionRef, sino que construye la ruta directamente
    expect(collection).not.toHaveBeenCalled();
    expect(doc).toHaveBeenCalledWith(undefined, 'artifacts', appId, 'users', userId, 'fixedExpenses', fixedExpenseId);
    expect(deleteDoc).toHaveBeenCalledWith(expect.anything());
  });
});