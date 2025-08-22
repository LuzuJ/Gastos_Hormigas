import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryService } from './categoryService';
import { 
  collection, 
  addDoc, 
  getDocs,
  writeBatch} from 'firebase/firestore';

// 1. Mockeamos la librería de firestore, AHORA MÁS COMPLETO
vi.mock('firebase/firestore', () => {
  // Creamos objetos falsos para simular las referencias de Firestore
  const collectionRef = { path: 'mock/collection' };
  const docRef = { id: 'mock-doc-id' };

  return {
    getFirestore: vi.fn(),
    collection: vi.fn(() => collectionRef), // collection ahora devuelve nuestra referencia falsa
    doc: vi.fn(() => docRef),             // doc ahora devuelve nuestra referencia falsa
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(), // Mantenemos los otros mocks simples por ahora
    query: vi.fn(),
    getDocs: vi.fn(),
    writeBatch: vi.fn(() => ({
      set: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    })),
    updateDoc: vi.fn(),
  };
});

describe('Servicio categoryService', () => {

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('addCategory debería llamar a addDoc con los datos correctos', async () => {
    const userId = 'test-user';
    const categoryName = 'Inversiones';

    await categoryService.addCategory(userId, categoryName);

    // 2. CORRECCIÓN: Verificamos la llamada a collection con la estructura real
    expect(collection).toHaveBeenCalledWith(undefined, 'users', userId, 'categories');

    // La llamada a addDoc es más simple de verificar ahora
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), { // el primer arg es la collectionRef mockeada
      name: categoryName,
      isDefault: false,
      subcategories: [],
      icon: 'Tag',
      color: '#607D8B'
    });
  });

  it('deleteCategory debería llamar a deleteDoc con la referencia correcta', async () => {
    const userId = 'test-user';
    const categoryId = 'cat-to-delete';
    const { doc: mockedDoc, deleteDoc: mockedDeleteDoc } = await import('firebase/firestore');

    await categoryService.deleteCategory(userId, categoryId);

    // 3. CORRECCIÓN: Verificamos las llamadas por separado, que es más robusto
    expect(collection).toHaveBeenCalledWith(undefined, 'users', userId, 'categories');
    expect(mockedDoc).toHaveBeenCalledWith(expect.anything(), categoryId);
    expect(mockedDeleteDoc).toHaveBeenCalledWith(expect.anything());
  });

  it('updateCategoryBudget debería llamar a updateDoc con los datos correctos', async () => {
    const userId = 'test-user';
    const categoryId = 'cat-budget';
    const budget = 1000;
    const { doc: mockedDoc, updateDoc: mockedUpdateDoc } = await import('firebase/firestore');

    await categoryService.updateCategoryBudget(userId, categoryId, budget);

    expect(collection).toHaveBeenCalledWith(undefined, 'users', userId, 'categories');
    expect(mockedDoc).toHaveBeenCalledWith(expect.anything(), categoryId);
    expect(mockedUpdateDoc).toHaveBeenCalledWith(expect.anything(), { budget: 1000 });
  });

  it('initializeDefaultCategories no debería hacer nada si ya existen categorías', async () => {
    const userId = 'test-user';
    vi.mocked(getDocs).mockResolvedValue({ empty: false } as any);

    await categoryService.initializeDefaultCategories(userId);

    expect(writeBatch).not.toHaveBeenCalled();
  });
});