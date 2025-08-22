export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: PasswordStrength;
  score: number;
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  // Longitud mínima
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
  }

  // Letras minúsculas
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  } else {
    score += 1;
  }

  // Letras mayúsculas
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  } else {
    score += 1;
  }

  // Números
  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  } else {
    score += 1;
  }

  // Caracteres especiales
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial (!@#$%^&*...)');
  } else {
    score += 1;
  }

  // Patrones comunes débiles
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /(\w)\1{2,}/, // Caracteres repetidos
    /^(.)\1+$/, // Solo un carácter repetido
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('La contraseña contiene patrones comunes o repetitivos');
      score -= 1;
      break;
    }
  }

  // Determinar fortaleza
  let strength: PasswordStrength;
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    isValid: errors.length === 0 && score >= 4,
    errors,
    strength,
    score: Math.max(0, score)
  };
};

export const getPasswordStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'strong': return '#10b981';
  }
};

export const getPasswordStrengthText = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak': return 'Débil';
    case 'medium': return 'Media';
    case 'strong': return 'Fuerte';
  }
};
