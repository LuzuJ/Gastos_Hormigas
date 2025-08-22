import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de react-hot-toast global
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: vi.fn(() => null),
}));

// Mock de Firebase Firestore para todos los tests
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    getFirestore: vi.fn(() => ({})),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    collection: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    onSnapshot: vi.fn(),
    writeBatch: vi.fn(),
    serverTimestamp: vi.fn(),
    arrayUnion: vi.fn(),
    arrayRemove: vi.fn(),
    runTransaction: vi.fn(),
    increment: vi.fn(),
    Timestamp: {
      now: vi.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
      fromDate: vi.fn((date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
    },
  };
});