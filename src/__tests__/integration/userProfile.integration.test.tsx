import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../../services/userService';
import * as firebaseFirestore from 'firebase/firestore';
import type { UserProfile } from '../../types';
import type { User } from 'firebase/auth';

// Mock de las funciones de Firestore
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDoc = vi.fn();

// Mock Firestore functions
vi.mocked(firebaseFirestore.getDoc).mockImplementation(mockGetDoc);
vi.mocked(firebaseFirestore.setDoc).mockImplementation(mockSetDoc);
vi.mocked(firebaseFirestore.updateDoc).mockImplementation(mockUpdateDoc);
vi.mocked(firebaseFirestore.doc).mockImplementation(mockDoc);

// Helper function to create mock Firebase user
const createMockFirebaseUser = (overrides: Partial<User> = {}): User => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  phoneNumber: null,
  photoURL: null,
  providerId: 'firebase',
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString()
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn(),
  ...overrides
});

// Helper function to create mock user document
const createMockUserDoc = (exists: boolean, data?: Partial<UserProfile>) => ({
  exists: () => exists,
  data: () => exists ? {
    displayName: 'Test User',
    email: 'test@example.com',
    currency: 'USD' as const,
    ...data
  } : undefined
});

describe('Integration: User Profile Management Flow', () => {
  const mockUserId = 'test-user-123';
  
  const mockUserProfile: UserProfile = {
    displayName: 'Test User',
    email: 'test@example.com',
    currency: 'USD'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock referencia de documento por defecto
    mockDoc.mockReturnValue('mock-doc-ref');
    
    // Mock respuestas por defecto
    mockGetDoc.mockResolvedValue(createMockUserDoc(true, mockUserProfile));
    mockSetDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  describe('User Profile Creation', () => {
    it('should successfully create a new user profile', async () => {
      // Arrange
      const newUser = createMockFirebaseUser({
        uid: 'new-user-123',
        email: 'newuser@example.com',
        displayName: 'New User'
      });
      
      // Mock que el usuario no existe
      mockGetDoc.mockResolvedValue(createMockUserDoc(false));
      mockSetDoc.mockResolvedValue(undefined);

      // Act
      await userService.createUserProfile(newUser);

      // Assert
      expect(mockGetDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(mockSetDoc).toHaveBeenCalledWith('mock-doc-ref', {
        displayName: 'New User',
        email: 'newuser@example.com',
        currency: 'USD'
      });
    });

    it('should not overwrite existing user profile', async () => {
      // Arrange
      const existingUser = createMockFirebaseUser();
      
      // Mock que el usuario ya existe
      mockGetDoc.mockResolvedValue(createMockUserDoc(true, mockUserProfile));

      // Act
      await userService.createUserProfile(existingUser);

      // Assert
      expect(mockGetDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it('should create profile with email prefix when no displayName', async () => {
      // Arrange
      const userWithoutDisplayName = createMockFirebaseUser({
        displayName: null,
        email: 'john.doe@example.com'
      });
      
      mockGetDoc.mockResolvedValue(createMockUserDoc(false));

      // Act
      await userService.createUserProfile(userWithoutDisplayName);

      // Assert
      expect(mockSetDoc).toHaveBeenCalledWith('mock-doc-ref', {
        displayName: 'john.doe',
        email: 'john.doe@example.com',
        currency: 'USD'
      });
    });

    it('should create profile with default name when no email or displayName', async () => {
      // Arrange
      const userWithoutNames = createMockFirebaseUser({
        displayName: null,
        email: null
      });
      
      mockGetDoc.mockResolvedValue(createMockUserDoc(false));

      // Act
      await userService.createUserProfile(userWithoutNames);

      // Assert
      expect(mockSetDoc).toHaveBeenCalledWith('mock-doc-ref', {
        displayName: 'Usuario',
        email: '',
        currency: 'USD'
      });
    });

    it('should handle user profile creation failure', async () => {
      // Arrange
      const newUser = createMockFirebaseUser();
      mockGetDoc.mockResolvedValue(createMockUserDoc(false));
      mockSetDoc.mockRejectedValue(new Error('Firestore error'));

      // Act & Assert
      await expect(userService.createUserProfile(newUser))
        .rejects.toThrow('Firestore error');
    });

    it('should handle getDoc failure during profile creation', async () => {
      // Arrange
      const newUser = createMockFirebaseUser();
      mockGetDoc.mockRejectedValue(new Error('Get doc failed'));

      // Act & Assert
      await expect(userService.createUserProfile(newUser))
        .rejects.toThrow('Get doc failed');
    });
  });

  describe('User Profile Retrieval', () => {
    it('should successfully get existing user profile', async () => {
      // Arrange
      const expectedProfile: UserProfile = {
        displayName: 'John Doe',
        email: 'john@example.com',
        currency: 'EUR'
      };
      
      mockGetDoc.mockResolvedValue(createMockUserDoc(true, expectedProfile));

      // Act
      const result = await userService.getUserProfile(mockUserId);

      // Assert
      expect(mockGetDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(result).toEqual(expectedProfile);
    });

    it('should return null for non-existing user profile', async () => {
      // Arrange
      mockGetDoc.mockResolvedValue(createMockUserDoc(false));

      // Act
      const result = await userService.getUserProfile(mockUserId);

      // Assert
      expect(result).toBeNull();
    });

    it('should provide default values for missing profile fields', async () => {
      // Arrange
      const incompleteProfile = {
        // Falta displayName y currency
        email: 'incomplete@example.com'
      };
      
      // Mock document that exists but has incomplete data
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => incompleteProfile
      });

      // Act
      const result = await userService.getUserProfile(mockUserId);

      // Assert
      expect(result).toEqual({
        displayName: 'Usuario',
        email: 'incomplete@example.com',
        currency: 'USD'
      });
    });

    it('should handle getUserProfile failure gracefully', async () => {
      // Arrange
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      // Act
      const result = await userService.getUserProfile(mockUserId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle empty profile data', async () => {
      // Arrange
      // Mock document that exists but has no profile data
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({})
      });

      // Act
      const result = await userService.getUserProfile(mockUserId);

      // Assert
      expect(result).toEqual({
        displayName: 'Usuario',
        email: '',
        currency: 'USD'
      });
    });
  });

  describe('User Profile Updates', () => {
    it('should successfully update user profile', async () => {
      // Arrange
      const updateData: Partial<UserProfile> = {
        displayName: 'Updated Name',
        currency: 'EUR'
      };
      
      mockUpdateDoc.mockResolvedValue(undefined);

      // Act
      await userService.updateUserProfile(mockUserId, updateData);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', updateData);
      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(), // db
        'users',
        mockUserId
      );
    });

    it('should handle partial profile updates', async () => {
      // Arrange
      const partialUpdate: Partial<UserProfile> = {
        displayName: 'Only Name Update'
      };

      // Act
      await userService.updateUserProfile(mockUserId, partialUpdate);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          displayName: 'Only Name Update'
        })
      );
    });

    it('should update currency preference', async () => {
      // Arrange
      const currencyUpdate: Partial<UserProfile> = {
        currency: 'EUR'
      };

      // Act
      await userService.updateUserProfile(mockUserId, currencyUpdate);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          currency: 'EUR'
        })
      );
    });

    it('should update email address', async () => {
      // Arrange
      const emailUpdate: Partial<UserProfile> = {
        email: 'newemail@example.com'
      };

      // Act
      await userService.updateUserProfile(mockUserId, emailUpdate);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          email: 'newemail@example.com'
        })
      );
    });

    it('should handle profile update failure', async () => {
      // Arrange
      const updateData: Partial<UserProfile> = { displayName: 'New Name' };
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

      // Act & Assert
      await expect(userService.updateUserProfile(mockUserId, updateData))
        .rejects.toThrow('Update failed');
    });

    it('should update multiple fields simultaneously', async () => {
      // Arrange
      const multipleUpdates: Partial<UserProfile> = {
        displayName: 'Complete Update',
        email: 'complete@example.com',
        currency: 'EUR'
      };

      // Act
      await userService.updateUserProfile(mockUserId, multipleUpdates);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          displayName: 'Complete Update',
          email: 'complete@example.com',
          currency: 'EUR'
        })
      );
    });
  });

  describe('Currency Management', () => {
    it('should handle USD currency correctly', async () => {
      // Arrange
      const usdProfile: UserProfile = {
        displayName: 'USD User',
        email: 'usd@example.com',
        currency: 'USD'
      };
      
      mockGetDoc.mockResolvedValue(createMockUserDoc(true, usdProfile));

      // Act
      const result = await userService.getUserProfile(mockUserId);

      // Assert
      expect(result?.currency).toBe('USD');
    });

    it('should handle EUR currency correctly', async () => {
      // Arrange
      const eurProfile: UserProfile = {
        displayName: 'EUR User',
        email: 'eur@example.com',
        currency: 'EUR'
      };
      
      mockGetDoc.mockResolvedValue(createMockUserDoc(true, eurProfile));

      // Act
      const result = await userService.getUserProfile(mockUserId);

      // Assert
      expect(result?.currency).toBe('EUR');
    });

    it('should switch between currencies', async () => {
      // Arrange & Act - Start with USD
      await userService.updateUserProfile(mockUserId, { currency: 'USD' });
      
      // Switch to EUR
      await userService.updateUserProfile(mockUserId, { currency: 'EUR' });
      
      // Switch back to USD
      await userService.updateUserProfile(mockUserId, { currency: 'USD' });

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, 'mock-doc-ref', { currency: 'USD' });
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, 'mock-doc-ref', { currency: 'EUR' });
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(3, 'mock-doc-ref', { currency: 'USD' });
    });
  });

  describe('User Lifecycle Management', () => {
    it('should demonstrate complete user lifecycle', async () => {
      // Step 1: Create new user profile
      const newUser = createMockFirebaseUser({
        uid: 'lifecycle-user',
        email: 'lifecycle@example.com',
        displayName: 'Lifecycle User'
      });
      
      mockGetDoc.mockResolvedValue(createMockUserDoc(false));
      await userService.createUserProfile(newUser);

      // Step 2: Get user profile
      mockGetDoc.mockResolvedValue(createMockUserDoc(true, {
        displayName: 'Lifecycle User',
        email: 'lifecycle@example.com',
        currency: 'USD'
      }));
      
      const profile = await userService.getUserProfile('lifecycle-user');

      // Step 3: Update profile multiple times
      await userService.updateUserProfile('lifecycle-user', { displayName: 'Updated User' });
      await userService.updateUserProfile('lifecycle-user', { currency: 'EUR' });
      await userService.updateUserProfile('lifecycle-user', { email: 'updated@example.com' });

      // Assert all operations
      expect(mockSetDoc).toHaveBeenCalledWith('mock-doc-ref', {
        displayName: 'Lifecycle User',
        email: 'lifecycle@example.com',
        currency: 'USD'
      });
      
      expect(profile).toEqual({
        displayName: 'Lifecycle User',
        email: 'lifecycle@example.com',
        currency: 'USD'
      });
      
      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(1, 'mock-doc-ref', { displayName: 'Updated User' });
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(2, 'mock-doc-ref', { currency: 'EUR' });
      expect(mockUpdateDoc).toHaveBeenNthCalledWith(3, 'mock-doc-ref', { email: 'updated@example.com' });
    });

    it('should handle different user creation scenarios', async () => {
      // Scenario 1: User with full information
      const fullUser = createMockFirebaseUser({
        uid: 'full-user',
        email: 'full@example.com',
        displayName: 'Full User'
      });

      // Scenario 2: User with only email
      const emailOnlyUser = createMockFirebaseUser({
        uid: 'email-user',
        email: 'emailonly@example.com',
        displayName: null
      });

      // Scenario 3: Anonymous or minimal user
      const minimalUser = createMockFirebaseUser({
        uid: 'minimal-user',
        email: null,
        displayName: null
      });

      mockGetDoc.mockResolvedValue(createMockUserDoc(false));

      // Act
      await userService.createUserProfile(fullUser);
      await userService.createUserProfile(emailOnlyUser);
      await userService.createUserProfile(minimalUser);

      // Assert
      expect(mockSetDoc).toHaveBeenCalledTimes(3);
      
      expect(mockSetDoc).toHaveBeenNthCalledWith(1, 'mock-doc-ref', {
        displayName: 'Full User',
        email: 'full@example.com',
        currency: 'USD'
      });
      
      expect(mockSetDoc).toHaveBeenNthCalledWith(2, 'mock-doc-ref', {
        displayName: 'emailonly',
        email: 'emailonly@example.com',
        currency: 'USD'
      });
      
      expect(mockSetDoc).toHaveBeenNthCalledWith(3, 'mock-doc-ref', {
        displayName: 'Usuario',
        email: '',
        currency: 'USD'
      });
    });
  });

  describe('Profile Data Validation and Edge Cases', () => {
    it('should handle special characters in display names', async () => {
      // Arrange
      const specialCharUpdate: Partial<UserProfile> = {
        displayName: 'José María Ñoño & García (2024)'
      };

      // Act
      await userService.updateUserProfile(mockUserId, specialCharUpdate);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          displayName: 'José María Ñoño & García (2024)'
        })
      );
    });

    it('should handle very long display names', async () => {
      // Arrange
      const longNameUpdate: Partial<UserProfile> = {
        displayName: 'This is a very long display name that might be used by someone with a complex name or title that includes multiple words and descriptions'
      };

      // Act
      await userService.updateUserProfile(mockUserId, longNameUpdate);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          displayName: longNameUpdate.displayName
        })
      );
    });

    it('should handle empty string updates', async () => {
      // Arrange
      const emptyUpdate: Partial<UserProfile> = {
        displayName: '',
        email: ''
      };

      // Act
      await userService.updateUserProfile(mockUserId, emptyUpdate);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          displayName: '',
          email: ''
        })
      );
    });

    it('should handle complex email formats', async () => {
      // Arrange
      const complexEmails = [
        'user+tag@example.com',
        'user.with.dots@sub.domain.com',
        'user-with-dashes@example-domain.org',
        'number123@domain123.co.uk'
      ];

      // Act
      for (const email of complexEmails) {
        await userService.updateUserProfile(mockUserId, { email });
      }

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledTimes(4);
      complexEmails.forEach((email, index) => {
        expect(mockUpdateDoc).toHaveBeenNthCalledWith(
          index + 1,
          'mock-doc-ref',
          expect.objectContaining({ email })
        );
      });
    });
  });

  describe('Integration with Other Services', () => {
    it('should provide user data for financial calculations', async () => {
      // Arrange - User with EUR currency
      const eurUser: UserProfile = {
        displayName: 'European User',
        email: 'eur@example.com',
        currency: 'EUR'
      };
      
      mockGetDoc.mockResolvedValue(createMockUserDoc(true, eurUser));

      // Act
      const profile = await userService.getUserProfile(mockUserId);

      // Assert - This currency would be used throughout the app
      expect(profile?.currency).toBe('EUR');
      expect(profile?.displayName).toBe('European User');
    });

    it('should support localization preferences', async () => {
      // Arrange - Test different currency preferences
      const users = [
        { currency: 'USD' as const, region: 'US' },
        { currency: 'EUR' as const, region: 'EU' }
      ];

      // Act & Assert
      for (const user of users) {
        await userService.updateUserProfile(mockUserId, { currency: user.currency });
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          'mock-doc-ref',
          expect.objectContaining({
            currency: user.currency
          })
        );
      }

      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
    });

    it('should handle user preferences for expense tracking', async () => {
      // Arrange - User updates that would affect expense tracking
      const trackingPreferences: Partial<UserProfile> = {
        displayName: 'Budget Tracker',
        currency: 'USD'
      };

      // Act
      await userService.updateUserProfile(mockUserId, trackingPreferences);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          displayName: 'Budget Tracker',
          currency: 'USD'
        })
      );
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle network failures gracefully', async () => {
      // Arrange
      const networkError = new Error('Network error');
      mockGetDoc.mockRejectedValue(networkError);

      // Act
      const result = await userService.getUserProfile(mockUserId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle Firestore permission errors', async () => {
      // Arrange
      const permissionError = new Error('Permission denied');
      mockUpdateDoc.mockRejectedValue(permissionError);

      // Act & Assert
      await expect(userService.updateUserProfile(mockUserId, { displayName: 'New Name' }))
        .rejects.toThrow('Permission denied');
    });

    it('should handle concurrent updates correctly', async () => {
      // Arrange
      const updates = [
        { displayName: 'Update 1' },
        { email: 'update1@example.com' },
        { currency: 'EUR' as const },
        { displayName: 'Update 2' }
      ];

      // Act
      const updatePromises = updates.map(update => 
        userService.updateUserProfile(mockUserId, update)
      );
      await Promise.all(updatePromises);

      // Assert
      expect(mockUpdateDoc).toHaveBeenCalledTimes(4);
      updates.forEach((update, index) => {
        expect(mockUpdateDoc).toHaveBeenNthCalledWith(
          index + 1,
          'mock-doc-ref',
          expect.objectContaining(update)
        );
      });
    });
  });

  describe('Service Documentation and Examples', () => {
    it('should demonstrate typical user onboarding flow', async () => {
      // Step 1: New user signs up (usually via Firebase Auth)
      const newUser = createMockFirebaseUser({
        uid: 'onboarding-user',
        email: 'onboard@example.com',
        displayName: 'New User'
      });

      // Step 2: Create initial profile
      mockGetDoc.mockResolvedValue(createMockUserDoc(false));
      await userService.createUserProfile(newUser);

      // Step 3: User customizes profile
      await userService.updateUserProfile('onboarding-user', {
        displayName: 'Customized Name',
        currency: 'EUR'
      });

      // Step 4: App retrieves profile for usage
      mockGetDoc.mockResolvedValue(createMockUserDoc(true, {
        displayName: 'Customized Name',
        email: 'onboard@example.com',
        currency: 'EUR'
      }));
      
      const finalProfile = await userService.getUserProfile('onboarding-user');

      // Assert complete flow
      expect(mockSetDoc).toHaveBeenCalledWith('mock-doc-ref', {
        displayName: 'New User',
        email: 'onboard@example.com',
        currency: 'USD'
      });
      
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        displayName: 'Customized Name',
        currency: 'EUR'
      });
      
      expect(finalProfile).toEqual({
        displayName: 'Customized Name',
        email: 'onboard@example.com',
        currency: 'EUR'
      });
    });
  });
});
