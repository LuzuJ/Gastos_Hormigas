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
  type User
} from 'firebase/auth';
import { userService } from './userService';
import { categoryService } from './categoryService';

const googleProvider = new GoogleAuthProvider();

/**
 * Función centralizada para crear el perfil de un usuario y sus datos iniciales.
 * Se asegura de que no se dupliquen datos si el usuario ya existe.
 */
const checkAndCreateNewUserDocument = async (user: User) => {
  // Llama a la función en userService para crear el perfil si es la primera vez.
  // Esta función ya comprueba si el usuario existe antes de escribir.
  await userService.createUserProfile(user);
  
  // Inicializa las categorías por defecto solo para usuarios nuevos.
  await categoryService.initializeDefaultCategories(user.uid);
};

export const authService = {
  /**
   * Inicia sesión con Google. Si el usuario era anónimo, enlaza la cuenta
   * para conservar sus datos. Si es un usuario completamente nuevo, crea su perfil.
   */
  signInWithGoogle: async (anonymousUser: User | null) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      if (anonymousUser) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          // Fusiona el usuario anónimo con la cuenta de Google.
          // Los datos del anónimo se conservan.
          await linkWithCredential(anonymousUser, credential);
        }
      } else {
        // Es un inicio de sesión nuevo, crea su documento de perfil y categorías.
        await checkAndCreateNewUserDocument(result.user);
      }
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      return { success: false, error };
    }
  },

  /**
   * Inicia sesión como un usuario invitado (anónimo).
   * Crea un perfil temporal y categorías para que pueda usar la app.
   */
  signInAsGuest: async () => {
    try {
      const result = await signInAnonymously(auth);
      await checkAndCreateNewUserDocument(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Error al iniciar como invitado:", error);
      return { success: false, error };
    }
  },

  /**
   * Registra un nuevo usuario con correo y contraseña.
   * Si el usuario era anónimo, convierte la cuenta en permanente.
   */
  signUpWithEmail: async (email: string, password: string, anonymousUser: User | null) => {
    try {
      if (anonymousUser) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(anonymousUser, credential);
        return { success: true, user: anonymousUser };
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await checkAndCreateNewUserDocument(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Error al registrar con email:", error);
      return { success: false, error };
    }
  },

  /**
   * Inicia sesión con una cuenta de correo existente.
   */
  signInWithEmail: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Error al iniciar sesión con email:", error);
      return { success: false, error };
    }
  },

  /**
   * Cierra la sesión del usuario actual.
   */
  signOut: () => {
    return signOut(auth);
  },
};