# Patrón de Repositorio en Gastos Hormigas

Este directorio contiene la implementación del Patrón de Repositorio para abstraer el acceso a datos en nuestra aplicación. El patrón de repositorio es una capa de abstracción entre la lógica de negocio y el acceso a datos, lo que facilita cambiar la fuente de datos subyacente sin afectar al resto de la aplicación.

## Estructura del Proyecto

```text
src/repositories/
├── interfaces/             # Interfaces genéricas y específicas de repositorio
│   ├── IRepository.ts      # Interfaz base con operaciones CRUD
│   ├── IUserRepository.ts  # Interfaz específica para usuarios
│   ├── ...                 # Otras interfaces específicas
│   └── index.ts            # Re-exportación de interfaces
├── implementations/        # Implementaciones concretas para cada fuente de datos
│   ├── SupabaseRepository.ts       # Implementación base para Supabase
│   ├── SupabaseUserRepository.ts   # Implementación para usuarios en Supabase
│   ├── ...                         # Otras implementaciones
│   └── index.ts                    # Re-exportación de implementaciones
├── factories/              # Fábricas para crear instancias de repositorios
│   ├── SupabaseRepositoryFactory.ts # Fábrica para crear repositorios de Supabase
│   └── index.ts                     # Re-exportación de fábricas
└── index.ts                # Punto de entrada principal
```

## Arquitectura

### 1. Interfaces de Repositorio

Las interfaces definen los contratos que deben cumplir todas las implementaciones de repositorios:

- `IRepository<T, ID>`: Interfaz genérica con operaciones CRUD básicas
- `IUserRepository`, `ICategoryRepository`, etc.: Interfaces específicas para cada entidad de dominio

### 2. Implementaciones de Repositorio

Las implementaciones concretas para cada fuente de datos (Supabase en este caso):

- `SupabaseRepository<T, ID>`: Implementación base para Supabase
- `SupabaseUserRepository`, `SupabaseCategoryRepositoryV2`, etc.: Implementaciones específicas

### 3. Fábricas de Repositorio

Las fábricas son responsables de crear instancias de repositorios:

- `IRepositoryFactory`: Interfaz para la fábrica de repositorios
- `SupabaseRepositoryFactory`: Implementación concreta para crear repositorios de Supabase

## Uso

Los servicios de la aplicación utilizan los repositorios a través de la fábrica:

```typescript
import { repositoryFactory } from '../repositories';

export const userService = {
  getUserProfile: async (userId: string) => {
    const userRepository = repositoryFactory.getUserRepository();
    return await userRepository.getUserProfile(userId);
  },
  // ...
};
```

## Beneficios

1. **Separación de Responsabilidades**: Los repositorios encapsulan la lógica de acceso a datos.
2. **Testabilidad**: Facilita la creación de mocks para pruebas unitarias.
3. **Flexibilidad**: Permite cambiar la fuente de datos sin afectar la lógica de negocio.
4. **Reutilización**: Implementaciones base que pueden ser heredadas por repositorios específicos.
5. **Consistencia**: Interfaz uniforme para acceder a diferentes entidades.

## Migración

Para migrar de la implementación directa de Supabase a la implementación usando el Patrón de Repositorio:

1. Crear nuevos archivos de servicio con extensión `.new.ts`
2. Actualizar las importaciones en los archivos que utilizan los servicios
3. Eliminar los archivos originales y renombrar los nuevos

## Implementaciones Mejoradas (V2)

En algunos casos, se han creado implementaciones V2 de los repositorios que incluyen mejoras significativas:

- `SupabaseCategoryRepositoryV2`: Implementación mejorada del repositorio de categorías que utiliza funciones RPC de Supabase para inicializar las categorías por defecto y ofrece métodos adicionales para gestionar el presupuesto y el estilo de las categorías.

Estas implementaciones V2 reemplazan gradualmente a las implementaciones originales, manteniendo la misma interfaz para garantizar la compatibilidad con el resto de la aplicación.

## Futuras Ampliaciones

En el futuro, podríamos implementar repositorios adicionales para otras fuentes de datos (por ejemplo, Firebase, REST API) sin cambiar la interfaz de la aplicación.
