import { supabase } from '../../config/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { userServiceRepo } from '../profile/userServiceRepo';
import { categoryServiceRepo } from '../categories/categoryServiceRepo';

const checkAndCreateNewUserDocument = async (user: User) => {
  try {
    await userServiceRepo.createUserProfile(user);
    await categoryServiceRepo.initializeDefaultCategories(user.id);
    console.log('Documento de usuario y categorías inicializados correctamente');
  } catch (error) {
    console.error('Error al inicializar datos de usuario:', error);
  }
};

export const authService = {
  signInWithGoogle: async (anonymousUser: User | null = null) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Para OAuth, Supabase redirige automáticamente
      // El usuario se creará cuando regrese del redirect
      return { success: true, redirect: data.url };
    } catch (error) {
      const authError = error as AuthError;
      return { success: false, error: authError.message || 'Error de autenticación' };
    }
  },

  signInAsGuest: async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        await checkAndCreateNewUserDocument(data.user);
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      const authError = error as AuthError;
      return { success: false, error: authError.message || 'Error de autenticación' };
    }
  },

  signUpWithEmail: async (email: string, password: string, anonymousUser: User | null = null) => {
    try {
      // Validación básica del email y contraseña
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Invalid email' };
      }
      
      if (!password || password.length < 6) {
        return { success: false, error: 'Password should be at least 6 characters' };
      }

      console.log('Intentando registrar usuario con email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: email.split('@')[0]
          },
          // Importante: esto permite que el usuario inicie sesión sin confirmar el email
          // Solo para desarrollo. En producción, deberías enviar un email de confirmación
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Error de Supabase al registrar:', error);
        
        // Mapear errores comunes de Supabase a mensajes amigables
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          return { success: false, error: 'Email already registered' };
        }
        
        if (error.message.includes('Password')) {
          return { success: false, error: 'Password should be at least 6 characters' };
        }
        
        return { success: false, error: error.message };
      }
      
      console.log('Usuario registrado en Supabase:', data.user?.id);
      
      if (data.user) {
        // El perfil se crea automáticamente por el trigger, pero inicializamos categorías
        try {
          await categoryServiceRepo.initializeDefaultCategories(data.user.id);
          console.log('Categorías inicializadas para nuevo usuario');
        } catch (catError) {
          console.error('Error al inicializar categorías:', catError);
          // No fallar el registro si las categorías no se pueden crear
        }
      }
      
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Error inesperado en signUpWithEmail:', error);
      const authError = error as AuthError;
      return { success: false, error: authError.message || 'Error de registro' };
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // Mapear errores de Supabase a códigos similares a Firebase
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed')) {
          return { success: false, error: 'auth/invalid-credential' };
        }
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        // Verificar que el usuario tenga un perfil creado en nuestra base de datos
        const userProfile = await userServiceRepo.getUserProfile(data.user.id);
        
        if (!userProfile) {
          // Si el usuario fue autenticado pero no tiene perfil en nuestra DB
          await supabase.auth.signOut();
          return { 
            success: false, 
            error: 'auth/user-not-registered'
          };
        }
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      const authError = error as AuthError;
      return { success: false, error: authError.message || 'Error de inicio de sesión' };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('Error durante signOut (no crítico):', error);
        // Incluso si hay error, probablemente el signOut funcionó
      }
      
      return { success: true };
    } catch (error) {
      console.warn('Error durante signOut (no crítico):', error);
      return { success: true };
    }
  },

  // Función adicional para obtener el usuario actual
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  // Función para obtener la sesión actual
  getCurrentSession: () => {
    return supabase.auth.getSession();
  },

  // Función para escuchar cambios de autenticación
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};
