/**
 * Servicio de autenticación para Supabase
 * Reemplaza authService.ts basado en Firebase
 */

import { supabase } from '../config/supabase';
import type { User, AuthError as SupabaseAuthError } from '@supabase/supabase-js';

// Tipos de respuesta
interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Servicio de autenticación con Supabase
 */
export const authService = {
  /**
   * Iniciar sesión con Google OAuth
   * Supabase maneja automáticamente la creación del perfil y datos predefinidos vía triggers
   */
  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Error en Google Sign In:', error);
        return { success: false, error: error.message };
      }

      // El redirect se maneja automáticamente
      return { success: true };
    } catch (error) {
      const authError = error as SupabaseAuthError;
      return { success: false, error: authError.message };
    }
  },

  /**
   * Iniciar sesión como invitado (anónimo)
   * Supabase creará un usuario temporal
   */
  signInAsGuest: async (): Promise<AuthResponse> => {
    try {
      // Supabase no tiene signInAnonymously nativo, usamos una sesión temporal
      // Opción 1: Crear un usuario con email temporal
      const randomEmail = `guest_${Date.now()}@temp.gastoshormigas.app`;
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

      const { data, error } = await supabase.auth.signUp({
        email: randomEmail,
        password: randomPassword,
        options: {
          data: {
            is_guest: true,
            display_name: 'Invitado'
          }
        }
      });

      if (error) {
        console.error('Error al crear usuario invitado:', error);
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user || undefined };
    } catch (error) {
      const authError = error as SupabaseAuthError;
      return { success: false, error: authError.message };
    }
  },

  /**
   * Registrarse con email y contraseña
   */
  signUpWithEmail: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: email.split('@')[0] // Usar parte del email como nombre inicial
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Error al registrarse:', error);
        return { success: false, error: error.message };
      }

      // Nota: Supabase puede requerir verificación de email según configuración
      if (data.user && !data.session) {
        console.log('Email de verificación enviado. Revisa tu correo.');
      }

      return { success: true, user: data.user || undefined };
    } catch (error) {
      const authError = error as SupabaseAuthError;
      return { success: false, error: authError.message };
    }
  },

  /**
   * Iniciar sesión con email y contraseña
   */
  signInWithEmail: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error al iniciar sesión:', error);
        
        // Mapear errores comunes
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Credenciales inválidas' };
        }
        
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user || undefined };
    } catch (error) {
      const authError = error as SupabaseAuthError;
      return { success: false, error: authError.message };
    }
  },

  /**
   * Cerrar sesión
   */
  signOut: async (): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error al cerrar sesión:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.warn('Error durante signOut (no crítico):', error);
      // Incluso si hay error, probablemente el signOut funcionó
      return { success: true };
    }
  },

  /**
   * Convertir usuario invitado a usuario con email
   */
  convertGuestToEmailUser: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'No hay usuario activo' };
      }

      // Verificar si es invitado
      const isGuest = user.user_metadata?.is_guest;
      
      if (!isGuest) {
        return { success: false, error: 'El usuario no es invitado' };
      }

      // Actualizar usuario con nuevo email y contraseña
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
        data: {
          is_guest: false,
          display_name: email.split('@')[0]
        }
      });

      if (error) {
        console.error('Error al convertir usuario invitado:', error);
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user || undefined };
    } catch (error) {
      const authError = error as SupabaseAuthError;
      return { success: false, error: authError.message };
    }
  },

  /**
   * Obtener el usuario actual
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  },

  /**
   * Enviar email de recuperación de contraseña
   */
  resetPassword: async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (error) {
        console.error('Error al enviar email de recuperación:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const authError = error as SupabaseAuthError;
      return { success: false, error: authError.message };
    }
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch {
      return false;
    }
  }
};

/**
 * Hook para usar el servicio de autenticación
 * Compatible con la API anterior de Firebase
 */
export const useAuthService = () => authService;
