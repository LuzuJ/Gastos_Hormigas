import {
  auth,
  db // Asumimos que db se exporta desde firebase.ts
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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FIRESTORE_PATHS } from '../constants';
import { categoryService } from './categoryService';

const googleProvider = new GoogleAuthProvider();

export const authService = {
    // Iniciar sesión como invitado (anónimo)
  signInAsGuest: async () => {
    try {
      const result = await signInAnonymously(auth);
      // Creamos el documento de usuario para el anónimo si no existe
      await checkAndCreateNewUserDocument(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Error al iniciar como invitado:", error);
      return { success: false, error };
    }
  },
  // Iniciar sesión con Google
  signInWithGoogle: async (anonymousUser: User | null) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Si había un usuario anónimo, transferimos sus datos.
      if (anonymousUser) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          await linkWithCredential(anonymousUser, credential);
          // Opcional: fusionar datos si es necesario
        }
      } else {
        await checkAndCreateNewUserDocument(result.user);
      }
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      return { success: false, error };
    }
  },
  signUpWithEmail: async (email: string, password: string, anonymousUser: User | null) => {
    try {
      // Si hay un usuario anónimo, creamos la credencial para enlazarla
      if (anonymousUser) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(anonymousUser, credential);
        // La sesión se actualiza al nuevo usuario permanente
        return { success: true, user: anonymousUser };
      }
      
      // Si no hay usuario anónimo, creamos una cuenta desde cero
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await checkAndCreateNewUserDocument(result.user);
      return { success: true, user: result.user };

    } catch (error) {
      console.error("Error al registrar con email:", error);
      return { success: false, error };
    }
  },
  signInWithEmail: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Error al iniciar sesión con email:", error);
      return { success: false, error };
    }
  },

  // Cerrar sesión
  signOut: () => {
    return signOut(auth);
  },
};

// Función auxiliar para crear el documento de usuario y categorías por defecto
const checkAndCreateNewUserDocument = async (user: User) => {
  const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-app';
  const userDocRef = doc(db, FIRESTORE_PATHS.ARTIFACTS, appId, FIRESTORE_PATHS.USERS, user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // El documento del usuario no existe, es un primer inicio de sesión real
    await setDoc(userDocRef, { email: user.email, createdAt: new Date() });
    await categoryService.initializeDefaultCategories(user.uid);
  }
};