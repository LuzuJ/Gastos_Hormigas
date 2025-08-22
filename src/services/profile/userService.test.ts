import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from './index';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc
} from 'firebase/firestore';
import type { UserProfile } from '../../types';
import type { User } from 'firebase/auth';

// Mock de Firebase Firestore
vi.mock('firebase/firestore', () => {
  const docRef = { id: 'mock-doc-id' };

  return {
    getFirestore: vi.fn(),
    doc: vi.fn(() => docRef),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
  };
});

// Mock del config de Firebase
vi.mock('../../config/firebase', () => ({
  db: { type: 'firestore' }
}));

describe('userService', () => {
  const userId = 'test-user-123';
  
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createUserProfile', () => {
    it('debería crear un perfil cuando el usuario no existe', async () => {
      const mockUser = {
        uid: userId,
        displayName: 'Juan Pérez',
        email: 'juan@example.com'
      } as User;

      const mockDocSnapshot = {
        exists: () => false
      };

      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot as any);

      await userService.createUserProfile(mockUser);

      expect(doc).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId
      );
      expect(getDoc).toHaveBeenCalledWith({ id: 'mock-doc-id' });
      expect(setDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-id' },
        {
          displayName: 'Juan Pérez',
          email: 'juan@example.com',
          currency: 'USD'
        }
      );
    });

    it('no debería crear perfil si el usuario ya existe', async () => {
      const mockUser = {
        uid: userId,
        displayName: 'Juan Pérez',
        email: 'juan@example.com'
      } as User;

      const mockDocSnapshot = {
        exists: () => true
      };

      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot as any);

      await userService.createUserProfile(mockUser);

      expect(setDoc).not.toHaveBeenCalled();
    });

    it('debería usar email como displayName si no está disponible', async () => {
      const mockUser = {
        uid: userId,
        displayName: null,
        email: 'test@example.com'
      } as User;

      const mockDocSnapshot = {
        exists: () => false
      };

      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot as any);

      await userService.createUserProfile(mockUser);

      expect(setDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-id' },
        {
          displayName: 'test',
          email: 'test@example.com',
          currency: 'USD'
        }
      );
    });

    it('debería usar "Usuario" como displayName por defecto', async () => {
      const mockUser = {
        uid: userId,
        displayName: null,
        email: null
      } as User;

      const mockDocSnapshot = {
        exists: () => false
      };

      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot as any);

      await userService.createUserProfile(mockUser);

      expect(setDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-id' },
        {
          displayName: 'Usuario',
          email: '',
          currency: 'USD'
        }
      );
    });

    it('debería manejar errores correctamente', async () => {
      const mockUser = {
        uid: userId,
        displayName: 'Test User',
        email: 'test@example.com'
      } as User;

      const error = new Error('Firestore error');
      vi.mocked(getDoc).mockRejectedValue(error);

      await expect(userService.createUserProfile(mockUser)).rejects.toThrow('Firestore error');
    });
  });

  describe('getUserProfile', () => {
    it('debería retornar el perfil del usuario si existe', async () => {
      const mockProfileData = {
        displayName: 'María García',
        email: 'maria@example.com',
        currency: 'EUR'
      };

      const mockDocSnapshot = {
        exists: () => true,
        data: () => mockProfileData
      };

      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot as any);

      const result = await userService.getUserProfile(userId);

      expect(doc).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId
      );
      expect(result).toEqual(mockProfileData);
    });

    it('debería retornar null si el usuario no existe', async () => {
      const mockDocSnapshot = {
        exists: () => false
      };

      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot as any);

      const result = await userService.getUserProfile(userId);

      expect(result).toBeNull();
    });

    it('debería completar campos faltantes con valores por defecto', async () => {
      const mockProfileData = {
        displayName: null,
        email: null,
        currency: null
      };

      const mockDocSnapshot = {
        exists: () => true,
        data: () => mockProfileData
      };

      vi.mocked(getDoc).mockResolvedValue(mockDocSnapshot as any);

      const result = await userService.getUserProfile(userId);

      expect(result).toEqual({
        displayName: 'Usuario',
        email: '',
        currency: 'USD'
      });
    });

    it('debería retornar null en caso de error', async () => {
      const error = new Error('Firestore error');
      vi.mocked(getDoc).mockRejectedValue(error);

      const result = await userService.getUserProfile(userId);

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('debería actualizar el perfil del usuario correctamente', async () => {
      const updateData: Partial<UserProfile> = {
        displayName: 'Nuevo Nombre',
        currency: 'EUR'
      };

      await userService.updateUserProfile(userId, updateData);

      expect(doc).toHaveBeenCalledWith(
        { type: 'firestore' },
        'users',
        userId
      );
      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-id' },
        updateData
      );
    });

    it('debería permitir actualizar solo un campo', async () => {
      const updateData = { currency: 'EUR' as const };

      await userService.updateUserProfile(userId, updateData);

      expect(updateDoc).toHaveBeenCalledWith(
        { id: 'mock-doc-id' },
        updateData
      );
    });
  });
});
