import { sendEmailVerification, User } from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Utilidades para la verificación de email en Firebase
 */

export interface EmailVerificationResult {
  success: boolean;
  error?: string;
}

/**
 * Envía un email de verificación al usuario actual
 */
export const sendVerificationEmail = async (user: User): Promise<EmailVerificationResult> => {
  try {
    await sendEmailVerification(user, {
      url: window.location.origin + '/dashboard', // URL de redirección después de verificar
      handleCodeInApp: false
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error enviando email de verificación:', error);
    
    // Mapear errores comunes de Firebase
    let errorMessage: string;
    
    switch (error.code) {
      case 'auth/too-many-requests':
        errorMessage = 'Demasiados emails enviados. Espera unos minutos antes de intentar de nuevo.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'El email no es válido.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'Usuario no encontrado.';
        break;
      default:
        errorMessage = 'Error al enviar el email de verificación. Inténtalo de nuevo.';
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Verifica si el usuario actual tiene su email verificado
 */
export const isEmailVerified = (): boolean => {
  const currentUser = auth.currentUser;
  return currentUser?.emailVerified ?? false;
};

/**
 * Recarga los datos del usuario para verificar el estado actual
 */
export const reloadUserData = async (): Promise<EmailVerificationResult> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'No hay usuario autenticado.' };
    }
    
    await currentUser.reload();
    return { success: true };
  } catch (error: any) {
    console.error('Error recargando datos del usuario:', error);
    return { success: false, error: 'Error al verificar el estado del email.' };
  }
};

/**
 * Verifica si un usuario debe verificar su email antes de acceder a funciones completas
 */
export const shouldRequireEmailVerification = (user: User | null): boolean => {
  if (!user) return false;
  
  // No requerir verificación para usuarios anónimos
  if (user.isAnonymous) return false;
  
  // No requerir verificación para usuarios de Google (ya están verificados)
  const hasGoogleProvider = user.providerData.some(
    provider => provider.providerId === 'google.com'
  );
  if (hasGoogleProvider) return false;
  
  // Requerir verificación para usuarios de email/password
  return !user.emailVerified;
};

/**
 * Obtiene un mensaje amigable sobre el estado de verificación del email
 */
export const getEmailVerificationMessage = (user: User | null): string | null => {
  if (!user || user.isAnonymous) return null;
  
  if (shouldRequireEmailVerification(user)) {
    return `Hemos enviado un email de verificación a ${user.email}. Por favor, verifica tu email para acceder a todas las funciones.`;
  }
  
  return null;
};
