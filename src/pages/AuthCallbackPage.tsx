import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { userInitializationService } from '../services/userInitializationService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

/**
 * Página de callback para OAuth (Google)
 * Esta página es necesaria para manejar la redirección después de la autenticación OAuth
 */
export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);

        // Procesar el callback de OAuth
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (data?.session?.user) {
          const user = data.session.user;
          
          console.log('Usuario autenticado:', user.id);
          
          // Dar tiempo al trigger de Supabase para crear los datos
          // El trigger debería ejecutarse automáticamente
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verificar si ya existe un perfil
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('id')
              .eq('id', user.id)
              .single();
            
            if (profileError && profileError.code === 'PGRST116') {
              // No existe perfil, crearlo manualmente como fallback
              console.warn('Trigger no ejecutado, inicializando datos manualmente...');
              
              // Usar el servicio de inicialización completo
              const success = await userInitializationService.initializeCompleteUserData(user.id);
              
              if (success) {
                console.log('✅ Datos inicializados correctamente');
              } else {
                console.error('❌ Error al inicializar datos del usuario');
              }
            } else if (profile) {
              console.log('✅ Perfil ya existe, datos ya inicializados');
            }
          } catch (error) {
            console.error('Error verificando perfil:', error);
          }
          
          // Redirigir al dashboard
          navigate('/dashboard');
        } else {
          // Si no hay usuario en la sesión, hubo un problema con la autenticación
          throw new Error('No se pudo autenticar con el proveedor');
        }
      } catch (error: any) {
        console.error('Error en el proceso de autenticación:', error);
        setError(error.message || 'Error en el proceso de autenticación');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="auth-callback-container">
        <LoadingSpinner size="large" />
        <p>Completando autenticación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-error-container">
        <h2>Error de autenticación</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Volver a intentar</button>
      </div>
    );
  }

  // Si no está cargando ni hay error, pero tampoco se ha redirigido,
  // es mejor redirigir a una página segura como fallback
  return <Navigate to="/login" replace />;
};

export default AuthCallbackPage;