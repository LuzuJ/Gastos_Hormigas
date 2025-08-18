import { describe, it, expect, vi, beforeEach } from 'vitest';
import { financialsService } from './financialsService';
import { 
  doc, 
  onSnapshot, 
  setDoc 
} from 'firebase/firestore';

// Mockeamos la librería de firestore con la estructura que ya conocemos
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  const docRef = { id: 'mock-doc-id' };

  return {
    ...actual,
    getFirestore: vi.fn(),
    // No necesitamos mockear 'collection' aquí, solo 'doc'
    doc: vi.fn(() => docRef),
    onSnapshot: vi.fn(),
    setDoc: vi.fn(),
  };
});

describe('Servicio financialsService', () => {
  const userId = 'test-user-financials';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('onFinancialsUpdate debería llamar a onSnapshot en el documento correcto', () => {
    // Configuramos el mock para que devuelva una función de desuscripción vacía
    vi.mocked(onSnapshot).mockReturnValue(() => {});

    financialsService.onFinancialsUpdate(userId, vi.fn());

    // Verificamos que se construye la ruta al documento 'summary' correctamente
    expect(doc).toHaveBeenCalledWith(undefined, 'users', userId, 'financials', 'summary');
    expect(onSnapshot).toHaveBeenCalledWith(expect.anything(), expect.any(Function), expect.any(Function));
  });

  it('setMonthlyIncome debería llamar a setDoc con los datos y las opciones de merge correctas', async () => {
    const newIncome = 4000;

    await financialsService.setMonthlyIncome(userId, newIncome);

    // Verificamos que se apunta al documento correcto
    expect(doc).toHaveBeenCalledWith(undefined, 'users', userId, 'financials', 'summary');

    // Verificamos que se llama a setDoc con el objeto correcto y la opción { merge: true }
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(), // La referencia al documento mockeada
      { monthlyIncome: newIncome },
      { merge: true }
    );
  });
});