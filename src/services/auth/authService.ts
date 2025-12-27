import { supabase } from '../../config/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Database } from '../../types/database';
// categoryServiceRepo YA NO ES NECESARIO - El trigger handle_new_user() crea todo automáticamente
// userServiceRepo se mantiene solo para verificación de perfil en signInWithEmail

// ELIMINADO: checkAndCreateNewUserDocument
// Ya no es necesario porque el trigger handle_new_user() en Supabase
// crea automáticamente el perfil, categorías, subcategorías y payment sources

type UserInsert = Database['public']['Tables']['users']['Insert'];

export const authService = {
  signInWithGoogle: async (anonymousUser: User | null = null) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${globalThis.location.origin}/auth/callback`
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
      // Crear una cuenta temporal con un email único para simular usuario invitado
      const tempEmail = `guest_${Date.now()}@temp.local`;
      const tempPassword = `temp_${Math.random().toString(36).substring(2, 15)}`;

      console.log('Creando usuario invitado temporal...');

      const { data, error } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            display_name: 'Invitado',
            is_guest: true
          }
        }
      });

      if (error) {
        console.error('Error al crear usuario invitado:', error);
        return { success: false, error: error.message };
      }

      // El trigger handle_new_user() en Supabase crea automáticamente:
      // - Perfil de usuario
      // - Categorías y subcategorías por defecto
      // - Fuente de pago por defecto
      // - Estadísticas mensuales

      // Esperar un momento para que el trigger handle_new_user() complete
      console.log('Esperando a que el trigger cree los datos iniciales...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      return { success: true, user: data.user };
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error inesperado en signInAsGuest:', error);
      return { success: false, error: authError.message || 'Error de autenticación' };
    }
  },

  signUpWithEmail: async (email: string, password: string, anonymousUser: User | null = null) => {
    try {
      // Validación básica del email y contraseña
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Invalid email' };
      }

      // Validación más estricta del email
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Verificar que el email tenga al menos 5 caracteres antes del @
      const emailParts = email.split('@');
      if (emailParts[0].length < 3) {
        return { success: false, error: 'Email username must be at least 3 characters' };
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
          emailRedirectTo: `${globalThis.location.origin}/auth/callback`
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

      // El trigger handle_new_user() en Supabase crea automáticamente:
      // - Perfil de usuario
      // - Categorías y subcategorías por defecto
      // - Fuente de pago por defecto
      // - Estadísticas mensuales

      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Error inesperado en signUpWithEmail:', error);
      const authError = error as AuthError;
      return { success: false, error: authError.message || 'Error de registro' };
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    try {
      console.log('[AUTH] Intentando login con email:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('[AUTH] Error de Supabase al hacer login:', error);

        // Mapear errores de Supabase a códigos similares a Firebase
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'auth/invalid-credential' };
        }

        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'auth/email-not-confirmed' };
        }

        if (error.message.includes('signup is disabled')) {
          return { success: false, error: 'auth/signup-disabled' };
        }

        return { success: false, error: error.message };
      }

      console.log('[AUTH] Usuario autenticado en auth.users:', data.user?.id);

      if (data.user) {
        // Verificar que el usuario tenga un registro creado por el trigger
        console.log('[AUTH] Verificando perfil en public.users...');

        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select('id, email, display_name')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.error('[AUTH] Error al buscar usuario en public.users:', userError);
          console.error('[AUTH] Detalles del error:', {
            code: userError.code,
            message: userError.message,
            details: userError.details,
            hint: userError.hint
          });

          // Si es error de "no encontrado", intentar crear el perfil
          if (userError.code === 'PGRST116') {
            console.warn('[AUTH] Usuario no encontrado en public.users. Intentando crear perfil...');

            try {
              // Intentar crear el perfil manualmente
              const newUser: UserInsert = {
                id: data.user.id,
                email: data.user.email,
                display_name: data.user.email?.split('@')[0] || 'Usuario'
              };

              const { data: newProfile, error: createError } = await (supabase
                .from('users') as any)
                .insert(newUser)
                .select()
                .single();

              if (createError) {
                console.error('[AUTH] Error al crear perfil manualmente:', createError);
                await supabase.auth.signOut();
                return {
                  success: false,
                  error: 'auth/user-not-registered'
                };
              }

              console.log('[AUTH] ✅ Perfil creado manualmente:', newProfile);
              return { success: true, user: data.user };
            } catch (createErr) {
              console.error('[AUTH] Excepción al crear perfil:', createErr);
              await supabase.auth.signOut();
              return {
                success: false,
                error: 'auth/user-not-registered'
              };
            }
          }

          await supabase.auth.signOut();
          return {
            success: false,
            error: 'auth/user-not-registered'
          };
        }

        if (!userRecord) {
          console.error('[AUTH] Usuario no encontrado en public.users:', data.user.id);
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'auth/user-not-registered'
          };
        }

        console.log('[AUTH] ✅ Perfil encontrado en public.users:', userRecord);
      }

      console.log('[AUTH] ✅ Login exitoso');
      return { success: true, user: data.user };
    } catch (error) {
      const authError = error as AuthError;
      console.error('[AUTH] Excepción durante login:', authError);
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
