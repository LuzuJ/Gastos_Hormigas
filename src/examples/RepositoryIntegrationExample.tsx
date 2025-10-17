/**
 * Este archivo ilustra la integración entre los servicios y los repositorios
 * 
 * El flujo de datos en la aplicación sigue este patrón:
 * 
 * UI (React Components) → Hooks → Services → Repositories → Database
 * 
 * - Los componentes de UI llaman a hooks personalizados
 * - Los hooks utilizan los servicios para operaciones de negocio
 * - Los servicios utilizan los repositorios para acceso a datos
 * - Los repositorios encapsulan la lógica específica de la base de datos
 */

// Importar el hook que usa el servicio
import { useUserProfile } from '../hooks/profile/useUserProfile';

// Este es un componente de ejemplo que muestra la integración completa
export const UserProfileExample = ({ userId }: { userId: string }) => {
  // El hook llama al servicio, que a su vez llama al repositorio
  const { profile, updateProfile } = useUserProfile(userId);

  const handleUpdateProfile = async (newName: string) => {
    await updateProfile({
      displayName: newName
    });
  };

  return (
    <div>
      <h1>Perfil de Usuario</h1>
      {profile ? (
        <div>
          <p>Nombre: {profile.displayName}</p>
          <p>Email: {profile.email}</p>
          <p>Moneda: {profile.currency}</p>
          <button onClick={() => handleUpdateProfile('Nuevo Nombre')}>
            Actualizar Nombre
          </button>
        </div>
      ) : (
        <p>Cargando perfil...</p>
      )}
    </div>
  );
};

/**
 * Veamos en detalle cómo funciona este flujo:
 * 
 * 1. El componente `UserProfileExample` usa el hook `useUserProfile`
 * 
 * 2. El hook `useUserProfile` llama al servicio `userService`:
 *    ```typescript
 *    // hooks/profile/useUserProfile.ts
 *    export const useUserProfile = (userId: string) => {
 *      const [profile, setProfile] = useState<UserProfile | null>(null);
 *      
 *      useEffect(() => {
 *        const loadProfile = async () => {
 *          const userProfile = await userService.getUserProfile(userId);
 *          setProfile(userProfile);
 *        };
 *        
 *        loadProfile();
 *      }, [userId]);
 *      
 *      const updateProfile = async (data: Partial<UserProfile>) => {
 *        await userService.updateUserProfile(userId, data);
 *        // Recargar el perfil después de actualizar
 *        const updatedProfile = await userService.getUserProfile(userId);
 *        setProfile(updatedProfile);
 *      };
 *      
 *      return { profile, updateProfile };
 *    };
 *    ```
 * 
 * 3. El servicio `userService` utiliza el repositorio:
 *    ```typescript
 *    // services/profile/userService.ts
 *    export const userService = {
 *      getUserProfile: async (userId: string) => {
 *        const userRepository = repositoryFactory.getUserRepository();
 *        return await userRepository.getUserProfile(userId);
 *      },
 *      
 *      updateUserProfile: async (userId: string, profileData: Partial<UserProfile>) => {
 *        const userRepository = repositoryFactory.getUserRepository();
 *        return await userRepository.update(userId, userId, profileData);
 *      }
 *    };
 *    ```
 * 
 * 4. El repositorio implementa el acceso a la base de datos:
 *    ```typescript
 *    // repositories/implementations/SupabaseUserRepository.ts
 *    export class SupabaseUserRepository implements IUserRepository {
 *      // ... implementación específica para Supabase
 *      async getUserProfile(userId: string): Promise<UserProfile | null> {
 *        const { data, error } = await supabase
 *          .from('users')
 *          .select('display_name, email, currency')
 *          .eq('id', userId)
 *          .single();
 *          
 *        // ... manejo de errores y transformación de datos
 *        
 *        return {
 *          displayName: data.display_name,
 *          email: data.email,
 *          currency: data.currency
 *        };
 *      }
 *    }
 *    ```
 * 
 * Esta estructura de capas proporciona una separación clara de responsabilidades
 * y permite cambiar la implementación de la base de datos sin afectar al resto
 * de la aplicación.
 */
