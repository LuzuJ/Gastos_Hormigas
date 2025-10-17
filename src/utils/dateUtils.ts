/**
 * Utilitario para convertir diferentes formatos de fecha a un objeto Date
 * Maneja la compatibilidad entre los timestamps de Firebase y los strings ISO de Supabase
 */

/**
 * Convierte un timestamp (Firebase o Supabase) a un objeto Date
 * @param timestamp - Puede ser un string ISO (Supabase), un objeto Timestamp de Firebase, o null/undefined
 * @param defaultValue - Valor por defecto si el timestamp es nulo o indefinido
 * @returns Un objeto Date
 */
export function toDate(timestamp: any, defaultValue: Date = new Date()): Date {
  if (!timestamp) {
    return defaultValue;
  }

  // Si es un string (formato Supabase)
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }

  // Si es un timestamp de Firebase con método toDate()
  if (timestamp && typeof timestamp === 'object' && 
      timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }

  // Si es un objeto con seconds y nanoseconds (formato raw de Firestore)
  if (timestamp && typeof timestamp === 'object' && 
      'seconds' in timestamp && 'nanoseconds' in timestamp) {
    // Convertir seconds a milisegundos y añadir nanosegundos convertidos a ms
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }

  // Si ya es un objeto Date
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // Si no se puede convertir, devolver el valor por defecto
  return defaultValue;
}

/**
 * Formatea una fecha para mostrarla en la interfaz de usuario
 * @param date - La fecha a formatear (puede ser cualquier formato aceptado por toDate)
 * @param options - Opciones de formato (Intl.DateTimeFormatOptions)
 * @returns String formateado según las opciones especificadas
 */
export function formatDate(
  date: any, 
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  },
  locale: string = 'es-ES'
): string {
  const dateObj = toDate(date);
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Convierte cualquier formato de fecha a un string ISO para usar en la base de datos
 * @param date - Cualquier formato de fecha soportado por toDate
 * @returns String en formato ISO o null si la entrada es inválida
 */
export function toISOString(date: any): string | null {
  if (!date) return null;
  try {
    return toDate(date).toISOString();
  } catch (error) {
    console.error('Error al convertir fecha a ISO string:', error);
    return null;
  }
}

/**
 * Convierte una fecha a timestamp de Supabase (string ISO)
 * Útil para preparar datos antes de enviarlos a Supabase
 * @param date - Cualquier formato de fecha soportado por toDate
 * @returns String en formato ISO para Supabase
 */
export function toSupabaseTimestamp(date: any): string {
  return toISOString(date) || new Date().toISOString();
}
