import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';
import { userService } from './userService';
import { categoryService } from './categoryService';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInAnonymously,
  linkWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  type User,
  type AuthError
} from 'firebase/auth';

// Mock de Firebase Auth
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn().mockImplementation(() => ({
    providerId: 'google.com'
  })),
  EmailAuthProvider: {
    credential: vi.fn()
  },
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  signInAnonymously: vi.fn(),
  linkWithCredential: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn()
}));

// Creamos un mock para credentialFromResult después de la declaración del mock
const MockGoogleAuthProvider = vi.mocked(GoogleAuthProvider);
MockGoogleAuthProvider.credentialFromResult = vi.fn();

// Mock del config de Firebase
vi.mock('../config/firebase', () => ({
  auth: { type: 'auth' }
}));

// Mock de los servicios de dependencias
vi.mock('./userService', () => ({
  userService: {
    createUserProfile: vi.fn(),
    getUserProfile: vi.fn()
  }
}));

vi.mock('./categoryService', () => ({
  categoryService: {
    initializeDefaultCategories: vi.fn()
  }
}));

// Mock de window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn()
  },
  writable: true
});

describe('authService', () => {
  const mockUser: User = {
    uid: 'test-user-123',
    displayName: 'Test User',
    email: 'test@example.com'
  } as User;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('debería iniciar sesión con Google correctamente para usuario nuevo', async () => {
      const mockResult = { user: mockUser };
      vi.mocked(signInWithPopup).mockResolvedValue(mockResult as any);

      const result = await authService.signInWithGoogle(null);

      expect(signInWithPopup).toHaveBeenCalledWith(
        { type: 'auth' },
        expect.any(Object)
      );
      expect(userService.createUserProfile).toHaveBeenCalledWith(mockUser);
      expect(categoryService.initializeDefaultCategories).toHaveBeenCalledWith(mockUser.uid);
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('debería vincular cuenta de Google con usuario anónimo', async () => {
      const anonymousUser = { uid: 'anonymous-user' } as User;
      const mockResult = { user: mockUser };
      const mockCredential = { providerId: 'google.com' };

      vi.mocked(signInWithPopup).mockResolvedValue(mockResult as any);
      MockGoogleAuthProvider.credentialFromResult.mockReturnValue(mockCredential as any);
      vi.mocked(linkWithCredential).mockResolvedValue(mockResult as any);

      const result = await authService.signInWithGoogle(anonymousUser);

      expect(linkWithCredential).toHaveBeenCalledWith(anonymousUser, mockCredential);
      expect(window.location.reload).toHaveBeenCalled();
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('debería manejar errores de autenticación', async () => {
      const authError: AuthError = {
        code: 'auth/popup-closed-by-user',
        message: 'Error message',
        name: 'FirebaseError'
      } as AuthError;

      vi.mocked(signInWithPopup).mockRejectedValue(authError);

      const result = await authService.signInWithGoogle(null);

      expect(result).toEqual({ 
        success: false, 
        error: 'auth/popup-closed-by-user' 
      });
    });
  });

  describe('signInAsGuest', () => {
    it('debería iniciar sesión como invitado correctamente', async () => {
      const mockResult = { user: mockUser };
      vi.mocked(signInAnonymously).mockResolvedValue(mockResult as any);

      const result = await authService.signInAsGuest();

      expect(signInAnonymously).toHaveBeenCalledWith({ type: 'auth' });
      expect(userService.createUserProfile).toHaveBeenCalledWith(mockUser);
      expect(categoryService.initializeDefaultCategories).toHaveBeenCalledWith(mockUser.uid);
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('debería manejar errores al iniciar sesión como invitado', async () => {
      const authError: AuthError = {
        code: 'auth/operation-not-allowed',
        message: 'Error message',
        name: 'FirebaseError'
      } as AuthError;

      vi.mocked(signInAnonymously).mockRejectedValue(authError);

      const result = await authService.signInAsGuest();

      expect(result).toEqual({ 
        success: false, 
        error: 'auth/operation-not-allowed' 
      });
    });
  });

  describe('signUpWithEmail', () => {
    it('debería registrar usuario con email correctamente', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const mockResult = { user: mockUser };

      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(mockResult as any);

      const result = await authService.signUpWithEmail(email, password, null);

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        { type: 'auth' },
        email,
        password
      );
      expect(userService.createUserProfile).toHaveBeenCalledWith(mockUser);
      expect(categoryService.initializeDefaultCategories).toHaveBeenCalledWith(mockUser.uid);
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('debería vincular email con usuario anónimo', async () => {
      const email = 'user@example.com';
      const password = 'password123';
      const anonymousUser = { uid: 'anonymous-user' } as User;
      const mockCredential = { providerId: 'password' };

      vi.mocked(EmailAuthProvider.credential).mockReturnValue(mockCredential as any);
      vi.mocked(linkWithCredential).mockResolvedValue({ user: anonymousUser } as any);

      const result = await authService.signUpWithEmail(email, password, anonymousUser);

      expect(EmailAuthProvider.credential).toHaveBeenCalledWith(email, password);
      expect(linkWithCredential).toHaveBeenCalledWith(anonymousUser, mockCredential);
      expect(userService.createUserProfile).toHaveBeenCalledWith(anonymousUser);
      expect(window.location.reload).toHaveBeenCalled();
      expect(result).toEqual({ success: true, user: anonymousUser });
    });

    it('debería manejar errores de registro', async () => {
      const authError: AuthError = {
        code: 'auth/email-already-in-use',
        message: 'Error message',
        name: 'FirebaseError'
      } as AuthError;

      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(authError);

      const result = await authService.signUpWithEmail('test@example.com', 'password', null);

      expect(result).toEqual({ 
        success: false, 
        error: 'auth/email-already-in-use' 
      });
    });
  });

  describe('signInWithEmail', () => {
    it('debería iniciar sesión con email correctamente', async () => {
      const email = 'user@example.com';
      const password = 'password123';
      const mockResult = { user: mockUser };
      const mockProfile = { displayName: 'Test User', email, currency: 'USD' };

      vi.mocked(signInWithEmailAndPassword).mockResolvedValue(mockResult as any);
      vi.mocked(userService.getUserProfile).mockResolvedValue(mockProfile as any);

      const result = await authService.signInWithEmail(email, password);

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        { type: 'auth' },
        email,
        password
      );
      expect(userService.getUserProfile).toHaveBeenCalledWith(mockUser.uid);
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('debería cerrar sesión si el usuario no tiene perfil', async () => {
      const email = 'user@example.com';
      const password = 'password123';
      const mockResult = { user: mockUser };

      vi.mocked(signInWithEmailAndPassword).mockResolvedValue(mockResult as any);
      vi.mocked(userService.getUserProfile).mockResolvedValue(null);

      const result = await authService.signInWithEmail(email, password);

      expect(signOut).toHaveBeenCalledWith({ type: 'auth' });
      expect(result).toEqual({ 
        success: false, 
        error: 'auth/user-not-registered' 
      });
    });

    it('debería normalizar errores de credenciales incorrectas', async () => {
      const authError: AuthError = {
        code: 'auth/wrong-password',
        message: 'Error message',
        name: 'FirebaseError'
      } as AuthError;

      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(authError);

      const result = await authService.signInWithEmail('test@example.com', 'wrongpassword');

      expect(result).toEqual({ 
        success: false, 
        error: 'auth/invalid-credential' 
      });
    });

    it('debería normalizar diferentes tipos de errores de credenciales', async () => {
      const errorCodes = [
        'auth/user-not-found',
        'auth/invalid-credential',
        'auth/invalid-email'
      ];

      for (const code of errorCodes) {
        vi.resetAllMocks();
        
        const authError: AuthError = {
          code: code as any,
          message: 'Error message',
          name: 'FirebaseError'
        } as AuthError;

        vi.mocked(signInWithEmailAndPassword).mockRejectedValue(authError);

        const result = await authService.signInWithEmail('test@example.com', 'password');

        expect(result).toEqual({ 
          success: false, 
          error: 'auth/invalid-credential' 
        });
      }
    });
  });

  describe('signOut', () => {
    it('debería cerrar sesión correctamente', async () => {
      await authService.signOut();

      expect(signOut).toHaveBeenCalledWith({ type: 'auth' });
    });
  });
});
