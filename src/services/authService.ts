import {
  auth,
} from '../config/firebase';
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
import { userService } from './profile/userService';
import { categoryService } from './categories/categoryService';
import { sendVerificationEmail } from '../utils/emailVerification';

const googleProvider = new GoogleAuthProvider();

const checkAndCreateNewUserDocument = async (user: User) => {
  try {
    await userService.createUserProfile(user);
    await categoryService.initializeDefaultCategories(user.uid);
    console.log('Documento de usuario y categorías inicializados correctamente');
  } catch (error) {
    console.error('Error al inicializar datos de usuario:', error);
  }
};

export const authService = {
  signInWithGoogle: async (anonymousUser: User | null) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      if (anonymousUser) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          await linkWithCredential(anonymousUser, credential);
          // CORRECCIÓN: Forzamos un reload para que la app reconozca al usuario como registrado.
          window.location.reload();
          return { success: true, user: result.user };
        }
      }
      await checkAndCreateNewUserDocument(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      const authError = error as AuthError;
      return { success: false, error: authError.code };
    }
  },

  signInAsGuest: async () => {
    try {
      const result = await signInAnonymously(auth);
      await checkAndCreateNewUserDocument(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      const authError = error as AuthError;
      return { success: false, error: authError.code };
    }
  },

  signUpWithEmail: async (email: string, password: string, anonymousUser: User | null) => {
    try {
      if (anonymousUser) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(anonymousUser, credential);
        await checkAndCreateNewUserDocument(anonymousUser);
        
        // Enviar email de verificación para usuarios convertidos de anónimos
        if (!anonymousUser.emailVerified) {
          await sendVerificationEmail(anonymousUser);
        }
        
        // CORRECCIÓN: Forzamos un reload aquí también.
        window.location.reload();
        return { success: true, user: anonymousUser };
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await checkAndCreateNewUserDocument(result.user);
      
      // Enviar email de verificación para nuevos usuarios
      await sendVerificationEmail(result.user);
      
      return { success: true, user: result.user };
    } catch (error) {
      const authError = error as AuthError;
      return { success: false, error: authError.code };
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Verificar que el usuario tenga un perfil creado en nuestra base de datos
      const userProfile = await userService.getUserProfile(result.user.uid);
      
      if (!userProfile) {
        // Si el usuario fue autenticado por Firebase pero no tiene perfil en nuestra DB,
        // esto indica que es un usuario que no se registró correctamente
        await signOut(auth);
        return { 
          success: false, 
          error: 'auth/user-not-registered' // Error específico para usuarios no registrados
        };
      }
      
      return { success: true, user: result.user };
    } catch (error) {
      const authError = error as AuthError;
      
      // Manejar específicamente los errores de credenciales incorrectas
      if (authError.code === 'auth/user-not-found' || 
          authError.code === 'auth/wrong-password' ||
          authError.code === 'auth/invalid-credential' ||
          authError.code === 'auth/invalid-email') {
        return { success: false, error: 'auth/invalid-credential' };
      }
      
      return { success: false, error: authError.code };
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      // Limpiar cualquier listener activo o cache local si es necesario
      return { success: true };
    } catch (error) {
      console.warn('Error durante signOut (no crítico):', error);
      // Incluso si hay error, probablemente el signOut funcionó
      return { success: true };
    }
  },
};
