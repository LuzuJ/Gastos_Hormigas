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
import { userService } from './userService';
import { categoryService } from './categoryService';

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
        // CORRECCIÓN: Forzamos un reload aquí también.
        window.location.reload();
        return { success: true, user: anonymousUser };
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await checkAndCreateNewUserDocument(result.user);
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

  signOut: () => {
    return signOut(auth);
  },
};
