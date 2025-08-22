import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from '../../../utils/passwordValidation';
import styles from './PasswordInput.module.css';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showValidation?: boolean;
  required?: boolean;
  className?: string;
  autoComplete?: string;
  onValidationChange?: (isValid: boolean) => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "Contraseña",
  showValidation = false,
  required = false,
  className = '',
  autoComplete = "current-password",
  onValidationChange
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState(validatePassword(''));

  useEffect(() => {
    const newValidation = validatePassword(value);
    setValidation(newValidation);
    onValidationChange?.(newValidation.isValid);
  }, [value, onValidationChange]);

  const strengthColor = getPasswordStrengthColor(validation.strength);
  const strengthText = getPasswordStrengthText(validation.strength);

  return (
    <div className={styles.container}>
      <div className={styles.passwordWrapper}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`${styles.input} ${className}`}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={styles.passwordToggle}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {showValidation && value && (
        <div className={styles.validationContainer}>
          {/* Barra de fortaleza */}
          <div className={styles.strengthBar}>
            <div className={styles.strengthLabel}>
              Fortaleza: <span style={{ color: strengthColor }}>{strengthText}</span>
            </div>
            <div className={styles.strengthProgress}>
              <div 
                className={styles.strengthFill}
                style={{ 
                  width: `${Math.max(20, (validation.score / 7) * 100)}%`,
                  backgroundColor: strengthColor 
                }}
              />
            </div>
          </div>

          {/* Lista de validaciones */}
          {validation.errors.length > 0 && (
            <div className={styles.validationList}>
              {validation.errors.map((error) => (
                <div key={error} className={styles.validationItem}>
                  <X size={14} className={styles.errorIcon} />
                  <span className={styles.errorText}>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Criterios cumplidos */}
          {value.length >= 8 && (
            <div className={styles.validationList}>
              {value.length >= 8 && (
                <div className={styles.validationItem}>
                  <Check size={14} className={styles.successIcon} />
                  <span className={styles.successText}>Al menos 8 caracteres</span>
                </div>
              )}
              {/[A-Z]/.test(value) && (
                <div className={styles.validationItem}>
                  <Check size={14} className={styles.successIcon} />
                  <span className={styles.successText}>Contiene mayúsculas</span>
                </div>
              )}
              {/[a-z]/.test(value) && (
                <div className={styles.validationItem}>
                  <Check size={14} className={styles.successIcon} />
                  <span className={styles.successText}>Contiene minúsculas</span>
                </div>
              )}
              {/\d/.test(value) && (
                <div className={styles.validationItem}>
                  <Check size={14} className={styles.successIcon} />
                  <span className={styles.successText}>Contiene números</span>
                </div>
              )}
              {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(value) && (
                <div className={styles.validationItem}>
                  <Check size={14} className={styles.successIcon} />
                  <span className={styles.successText}>Contiene caracteres especiales</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
