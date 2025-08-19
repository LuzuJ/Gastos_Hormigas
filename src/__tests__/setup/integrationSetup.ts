import { vi, afterEach } from 'vitest';

// Mock de Firebase App
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

// Mock de Firebase para pruebas de integración
vi.mock('../config/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(),
  },
  db: {},
  app: {},
}));

// Mock de Firebase Auth
vi.mock('firebase/auth', () => {
  const GoogleAuthProvider: any = vi.fn().mockImplementation(() => ({}));
  GoogleAuthProvider.credentialFromResult = vi.fn();
  
  return {
    getAuth: vi.fn(() => ({
      currentUser: null,
      onAuthStateChanged: vi.fn(),
      signOut: vi.fn(),
    })),
    GoogleAuthProvider,
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    signInAnonymously: vi.fn(),
    linkWithCredential: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    EmailAuthProvider: {
      credential: vi.fn(),
    },
    onAuthStateChanged: vi.fn(),
  };
});

// Mock de Firestore
vi.mock('firebase/firestore', () => ({
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
}));

// Mock de react-hot-toast para evitar errores en las pruebas
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock de window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
  },
  writable: true,
});

// Configuración global para pruebas de integración
global.console.warn = vi.fn();
global.console.error = vi.fn();

// Cleanup después de cada prueba
afterEach(() => {
  vi.clearAllMocks();
});
