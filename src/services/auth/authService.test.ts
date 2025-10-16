import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';
import { userService } from '../profile/userService';
import { categoryService } from '../categories/categoryService';
import { isMobileDevice } from '../../utils/deviceDetection';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
  signInWithRedirect: vi.fn(),
  getRedirectResult: vi.fn(),
  signOut: vi.fn(),
  signInAnonymously: vi.fn(),
  linkWithCredential: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn()
}));

// Creamos una referencia al mock después de la declaración
const GoogleAuthProviderMock = GoogleAuthProvider as any;
GoogleAuthProviderMock.credentialFromResult = vi.fn();

// Mock del config de Firebase
vi.mock('../../config/firebase', () => ({
  auth: { type: 'auth' }
}));

// Mock de los servicios de dependencias
vi.mock('../profile/userService', () => ({
  userService: {
    createUserProfile: vi.fn(),
    getUserProfile: vi.fn()
  }
}));

vi.mock('../categories/categoryService', () => ({
  categoryService: {
    initializeDefaultCategories: vi.fn()
  }
}));

// Mock device detection
vi.mock('../../utils/deviceDetection', () => ({
  isMobileDevice: vi.fn()
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
      const mockResult = { 
        user: mockUser, 
        providerId: 'google.com', 
        operationType: 'signIn' 
      } as any;
      vi.mocked(signInWithPopup).mockResolvedValue(mockResult);

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
      const mockResult = { 
        user: mockUser, 
        providerId: 'google.com', 
        operationType: 'link' 
      } as any;
      const mockCredential = { providerId: 'google.com' };

      vi.mocked(signInWithPopup).mockResolvedValue(mockResult);
      GoogleAuthProviderMock.credentialFromResult = vi.fn().mockReturnValue(mockCredential);
      vi.mocked(linkWithCredential).mockResolvedValue(mockResult);

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
      const mockResult = { 
        user: mockUser, 
        providerId: 'anonymous', 
        operationType: 'signIn' 
      } as any;
      vi.mocked(signInAnonymously).mockResolvedValue(mockResult);

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
      const mockResult = { 
        user: mockUser, 
        providerId: 'password', 
        operationType: 'signIn' 
      } as any;

      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue(mockResult);

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
      const mockResult = { 
        user: mockUser, 
        providerId: 'password', 
        operationType: 'signIn' 
      } as any;
      const mockProfile = { displayName: 'Test User', email, currency: 'USD' as const };

      vi.mocked(signInWithEmailAndPassword).mockResolvedValue(mockResult);
      vi.mocked(userService.getUserProfile).mockResolvedValue(mockProfile);

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
      const mockResult = { 
        user: mockUser, 
        providerId: 'password', 
        operationType: 'signIn' 
      } as any;

      vi.mocked(signInWithEmailAndPassword).mockResolvedValue(mockResult);
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

  describe('Google Sign-In con detección de dispositivo móvil', () => {
    beforeEach(() => {
      vi.mocked(isMobileDevice).mockReturnValue(false);
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        writable: true
      });
    });

    it('debería usar signInWithPopup en dispositivos de escritorio', async () => {
      vi.mocked(isMobileDevice).mockReturnValue(false);
      const mockResult = { 
        user: mockUser, 
        providerId: 'google.com', 
        operationType: 'signIn' 
      } as any;
      vi.mocked(signInWithPopup).mockResolvedValue(mockResult);

      const result = await authService.signInWithGoogle(null);

      expect(signInWithPopup).toHaveBeenCalled();
      expect(signInWithRedirect).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('debería usar signInWithRedirect en dispositivos móviles', async () => {
      vi.mocked(isMobileDevice).mockReturnValue(true);
      (signInWithRedirect as any).mockResolvedValue(undefined);

      const result = await authService.signInWithGoogle(null);

      expect(signInWithRedirect).toHaveBeenCalled();
      expect(signInWithPopup).not.toHaveBeenCalled();
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, user: null });
    });

    it('debería guardar flag para vincular usuario anónimo en móvil', async () => {
      vi.mocked(isMobileDevice).mockReturnValue(true);
      (signInWithRedirect as any).mockResolvedValue(undefined);
      const anonymousUser = { uid: 'anonymous-user' } as User;

      await authService.signInWithGoogle(anonymousUser);

      expect(window.localStorage.setItem).toHaveBeenCalledWith('pendingAnonymousLink', 'true');
      expect(signInWithRedirect).toHaveBeenCalled();
    });
  });

  describe('handleRedirectResult', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        writable: true
      });
    });

    it('debería manejar resultado de redirección exitoso', async () => {
      const mockResult = { 
        user: mockUser, 
        providerId: 'google.com' 
      } as any;
      vi.mocked(getRedirectResult).mockResolvedValue(mockResult);

      const result = await authService.handleRedirectResult();

      expect(getRedirectResult).toHaveBeenCalled();
      expect(userService.createUserProfile).toHaveBeenCalledWith(mockUser);
      expect(categoryService.initializeDefaultCategories).toHaveBeenCalledWith(mockUser.uid);
      expect(result).toEqual({ success: true, user: mockUser });
    });

    it('debería retornar success sin usuario cuando no hay resultado de redirección', async () => {
      vi.mocked(getRedirectResult).mockResolvedValue(null);

      const result = await authService.handleRedirectResult();

      expect(result).toEqual({ success: true, user: null });
    });

    it('debería limpiar flag de vinculación pendiente', async () => {
      const mockResult = { 
        user: mockUser, 
        providerId: 'google.com' 
      } as any;
      vi.mocked(getRedirectResult).mockResolvedValue(mockResult);
      vi.mocked(window.localStorage.getItem).mockReturnValue('true');

      await authService.handleRedirectResult();

      expect(window.localStorage.removeItem).toHaveBeenCalledWith('pendingAnonymousLink');
    });

    it('debería manejar errores de redirección', async () => {
      const mockError = { code: 'auth/popup-closed-by-user' } as AuthError;
      vi.mocked(getRedirectResult).mockRejectedValue(mockError);

      const result = await authService.handleRedirectResult();

      expect(result).toEqual({ success: false, error: 'auth/popup-closed-by-user' });
    });
  });
});
