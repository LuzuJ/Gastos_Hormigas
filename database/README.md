# Gastos Hormigas - Migración de Firebase a Supabase

## Base de Datos

### Configuración del Esquema

1. **Ejecutar el esquema en Supabase**:
   - Abre tu proyecto de Supabase
   - Ve a SQL Editor
   - Ejecuta el contenido del archivo `database/schema.sql`

### Diferencias Principales con Firebase

#### 1. **Estructura Relacional vs NoSQL**
- **Firebase**: Documentos anidados con subcollections
- **Supabase**: Tablas relacionales con foreign keys

#### 2. **Autenticación**
- **Firebase**: Firebase Auth con usuarios en `auth` collection
- **Supabase**: Supabase Auth integrado con RLS (Row Level Security)

#### 3. **Timestamps**
- **Firebase**: `Timestamp` de Firestore
- **Supabase**: `TIMESTAMP WITH TIME ZONE` nativo de PostgreSQL

#### 4. **IDs**
- **Firebase**: IDs string generados por Firestore
- **Supabase**: UUIDs v4 generados automáticamente

### Características del Nuevo Esquema

#### Seguridad
- **Row Level Security (RLS)** habilitado en todas las tablas
- Políticas que aseguran que los usuarios solo accedan a sus propios datos
- Integración nativa con Supabase Auth

#### Performance
- Índices optimizados para consultas frecuentes
- Constraints de integridad referencial
- Triggers automáticos para `updated_at`

#### Funciones Automáticas
- **`handle_new_user()`**: Crea perfil automáticamente al registrarse
- **`initialize_default_categories()`**: Inicializa categorías por defecto
- **`update_updated_at_column()`**: Actualiza timestamp automáticamente

### Migración de Datos

Si tienes datos existentes en Firebase, necesitarás crear scripts de migración. El esquema está diseñado para mapear directamente desde las colecciones de Firestore:

- `users` → `public.users`
- `categories` → `public.categories` + `public.subcategories`
- `expenses` → `public.expenses`
- `financials` → `public.financials`
- etc.

### Variables de Entorno

Asegúrate de tener configuradas las siguientes variables:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```
