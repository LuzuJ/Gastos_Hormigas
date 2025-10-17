import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { userServiceRepo } from '../services/profile/userServiceRepo';
import { categoryServiceRepo } from '../services/categories/categoryServiceRepo';
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
          // Verificar si el usuario necesita inicialización
          const user = data.session.user;
          
          // Verificar si ya existe un perfil para este usuario
          const profile = await userServiceRepo.getUserProfile(user.id);
          
          if (!profile) {
            // Si es la primera vez que inicia sesión, crear perfil y categorías por defecto
            await userServiceRepo.createUserProfile(user);
            await categoryServiceRepo.initializeDefaultCategories(user.id);
            console.log('Perfil y categorías inicializadas para el nuevo usuario');
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