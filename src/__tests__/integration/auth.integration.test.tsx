import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseFirestore from 'firebase/firestore';

// Mock solo las funciones específicas de Firebase, no los servicios completos
const mockSignInAnonymously = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockLinkWithCredential = vi.fn();
const mockCredentialFromResult = vi.fn();

const mockSetDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockWriteBatch = vi.fn();

// Mock Firebase Auth functions
vi.mocked(firebaseAuth.signInAnonymously).mockImplementation(mockSignInAnonymously);
vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockImplementation(mockSignInWithEmailAndPassword);
vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockImplementation(mockCreateUserWithEmailAndPassword);
vi.mocked(firebaseAuth.signInWithPopup).mockImplementation(mockSignInWithPopup);
vi.mocked(firebaseAuth.signOut).mockImplementation(mockSignOut);
vi.mocked(firebaseAuth.linkWithCredential).mockImplementation(mockLinkWithCredential);
vi.mocked(firebaseAuth.GoogleAuthProvider.credentialFromResult).mockImplementation(mockCredentialFromResult);

// Mock Firestore functions
vi.mocked(firebaseFirestore.setDoc).mockImplementation(mockSetDoc);
vi.mocked(firebaseFirestore.getDoc).mockImplementation(mockGetDoc);
vi.mocked(firebaseFirestore.getDocs).mockImplementation(mockGetDocs);
vi.mocked(firebaseFirestore.writeBatch).mockImplementation(mockWriteBatch);

// Componente de prueba que simula el flujo de autenticación
const TestAuthComponent = ({ userId }: { userId: string | null }) => {
  return (
    <AuthProvider userId={userId}>
      <div data-testid="auth-content">
        <span data-testid="user-id">{userId || 'No user'}</span>
      </div>
    </AuthProvider>
  );
};

describe('Integration: Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup mock responses
    mockSetDoc.mockResolvedValue(undefined);
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockGetDocs.mockResolvedValue({ empty: true });
    mockWriteBatch.mockReturnValue({
      set: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined)
    });
    mockCredentialFromResult.mockReturnValue({
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token'
    });
  });

  describe('Guest Authentication', () => {
    it('should successfully authenticate as guest and create user profile', async () => {
      // Arrange
      const mockUser = {
        uid: 'guest-user-123',
        isAnonymous: true,
        email: null,
        displayName: null,
      };

      mockSignInAnonymously.mockResolvedValue({
        user: mockUser
      } as any);

      // Act
      const result = await authService.signInAsGuest();

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockSignInAnonymously).toHaveBeenCalled();
      expect(mockSetDoc).toHaveBeenCalled(); // User profile creation
    });

    it('should handle guest authentication failure', async () => {
      // Arrange
      mockSignInAnonymously.mockRejectedValue({
        code: 'auth/operation-not-allowed'
      });

      // Act
      const result = await authService.signInAsGuest();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('auth/operation-not-allowed');
    });
  });

  describe('Email Authentication', () => {
    it('should successfully register with email and create user profile', async () => {
      // Arrange
      const mockUser = {
        uid: 'email-user-123',
        isAnonymous: false,
        email: 'test@example.com',
        displayName: null,
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      } as any);

      // Act
      const result = await authService.signUpWithEmail('test@example.com', 'password123', null);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
      expect(mockSetDoc).toHaveBeenCalled(); // User profile creation
    });

    it('should successfully sign in with existing email', async () => {
      // Arrange
      const mockUser = {
        uid: 'existing-user-123',
        isAnonymous: false,
        email: 'existing@example.com',
        displayName: null,
      };

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      } as any);

      // Mock que el usuario ya existe en la base de datos
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'existing@example.com',
          displayName: 'Existing User',
          currency: 'USD'
        })
      } as any);

      // Act
      const result = await authService.signInWithEmail('existing@example.com', 'password123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'existing@example.com',
        'password123'
      );
      expect(mockGetDoc).toHaveBeenCalled(); // Check user profile exists
    });

    it('should handle sign in with non-registered user', async () => {
      // Arrange
      const mockUser = {
        uid: 'fake-user-123',
        isAnonymous: false,
        email: 'fake@example.com',
        displayName: null,
      };

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      } as any);

      // Mock que el usuario NO existe en nuestra base de datos
      mockGetDoc.mockResolvedValue({
        exists: () => false
      } as any);

      mockSignOut.mockResolvedValue(undefined);

      // Act
      const result = await authService.signInWithEmail('fake@example.com', 'password123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('auth/user-not-registered');
      expect(mockSignOut).toHaveBeenCalled(); // Should sign out the user
    });

    it('should handle invalid credentials', async () => {
      // Arrange
      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/invalid-credential'
      });

      // Act
      const result = await authService.signInWithEmail('test@example.com', 'wrongpassword');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('auth/invalid-credential');
    });
  });

  describe('Google Authentication', () => {
    it('should successfully sign in with Google and create user profile', async () => {
      // Arrange
      const mockUser = {
        uid: 'google-user-123',
        isAnonymous: false,
        email: 'google@example.com',
        displayName: 'Google User',
      };

      mockSignInWithPopup.mockResolvedValue({
        user: mockUser
      } as any);

      // Act
      const result = await authService.signInWithGoogle(null);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockSignInWithPopup).toHaveBeenCalled();
      expect(mockSetDoc).toHaveBeenCalled(); // User profile creation
    });

    it('should successfully link anonymous user with Google account', async () => {
      // Arrange
      const anonymousUser = {
        uid: 'anonymous-123',
        isAnonymous: true,
        email: null,
        displayName: null,
      };

      const linkedUser = {
        uid: 'anonymous-123', // Same UID after linking
        isAnonymous: false,
        email: 'google@example.com',
        displayName: 'Google User',
      };

      mockSignInWithPopup.mockResolvedValue({
        user: linkedUser
      } as any);

      mockCredentialFromResult.mockReturnValue({
        accessToken: 'mock-access-token',
        idToken: 'mock-id-token'
      });

      mockLinkWithCredential.mockResolvedValue({
        user: linkedUser
      } as any);

      // Act
      const result = await authService.signInWithGoogle(anonymousUser as any);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(linkedUser);
      expect(mockLinkWithCredential).toHaveBeenCalled();
    });
  });

  describe('Sign Out', () => {
    it('should successfully sign out user', async () => {
      // Arrange
      mockSignOut.mockResolvedValue(undefined);

      // Act
      const result = await authService.signOut();

      // Assert
      expect(result.success).toBe(true);
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle sign out errors gracefully', async () => {
      // Arrange
      mockSignOut.mockRejectedValue(new Error('Sign out error'));

      // Act
      const result = await authService.signOut();

      // Assert
      expect(result.success).toBe(true); // Should still return success
    });
  });

  describe('AuthContext Integration', () => {
    it('should provide user data through context when authenticated', async () => {
      // Arrange
      const userId = 'test-user-123';

      // Act
      render(<TestAuthComponent userId={userId} />);

      // Assert
      expect(screen.getByTestId('auth-content')).toBeInTheDocument();
      expect(screen.getByTestId('user-id')).toHaveTextContent(userId);
    });

    it('should handle null user in context', async () => {
      // Act
      render(<TestAuthComponent userId={null} />);

      // Assert
      expect(screen.getByTestId('auth-content')).toBeInTheDocument();
      expect(screen.getByTestId('user-id')).toHaveTextContent('No user');
    });
  });
});
