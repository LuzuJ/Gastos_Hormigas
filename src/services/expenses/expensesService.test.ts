import { describe, it, expect, vi, beforeEach } from 'vitest';
import { expensesService } from './expensesService';
import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import type { ExpenseFormData } from '../../types';

// El mock se mantiene igual, ya que es robusto
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
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(() => 'MOCK_SERVER_TIMESTAMP'),
  };
});

describe('Servicio expensesService', () => {
  const userId = 'test-user-expenses';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('addExpense debería llamar a addDoc con los datos correctos', async () => {
    const expenseData: ExpenseFormData = {
      description: 'Cena de celebración',
      amount: 75.50,
      categoryId: 'cat-1',
      subCategory: 'Restaurante',
      createdAt: new Timestamp(0, 0)
    };

    await expensesService.addExpense(userId, expenseData);

    expect(collection).toHaveBeenCalledWith(undefined, 'users', userId, 'expenses');
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
      ...expenseData,
      createdAt: 'MOCK_SERVER_TIMESTAMP'
    });
  });

  it('updateExpense debería llamar a doc y updateDoc con la ruta y datos correctos', async () => {
    const expenseId = 'exp-to-update';
    const partialData: Partial<ExpenseFormData> = { amount: 80.00 };

    await expensesService.updateExpense(userId, expenseId, partialData);

    // CORRECCIÓN: Verificamos que `doc` es llamado con la ruta completa como strings,
    // y que `collection` NO es llamado.
    expect(collection).not.toHaveBeenCalled();
    expect(doc).toHaveBeenCalledWith(undefined, 'users', userId, 'expenses', expenseId);

    // Verificamos que se actualiza con los datos parciales
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), partialData);
  });

  it('deleteExpense debería llamar a doc y deleteDoc con la ruta correcta', async () => {
    const expenseId = 'exp-to-delete';

    await expensesService.deleteExpense(userId, expenseId);

    // CORRECCIÓN: Misma lógica que en la prueba anterior.
    expect(collection).not.toHaveBeenCalled();
    expect(doc).toHaveBeenCalledWith(undefined, 'users', userId, 'expenses', expenseId);
    expect(deleteDoc).toHaveBeenCalledWith(expect.anything());
  });
});