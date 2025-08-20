import React from 'react';
import styles from './Input.module.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Etiqueta del input */
  label?: string;
  /** Texto de ayuda */
  helpText?: string;
  /** Mensaje de error */
  error?: string;
  /** Variante del input */
  variant?: 'default' | 'success' | 'warning' | 'error';
  /** Tamaño del input */
  size?: 'small' | 'medium' | 'large';
  /** Icono a la izquierda */
  leftIcon?: React.ReactNode;
  /** Icono a la derecha */
  rightIcon?: React.ReactNode;
  /** Texto adicional a la derecha */
  rightText?: string;
  /** Input de ancho completo */
  fullWidth?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  helpText,
  error,
  variant = 'default',
  size = 'medium',
  leftIcon,
  rightIcon,
  rightText,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  // Determinar variante basada en el error
  const finalVariant = error ? 'error' : variant;
  
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = [
    styles.input,
    styles[finalVariant],
    styles[size],
    leftIcon && styles.hasLeftIcon,
    rightIcon && styles.hasRightIcon,
    rightText && styles.hasRightText,
    fullWidth && styles.fullWidth,
    props.disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    styles.container,
    fullWidth && styles.fullWidth
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {leftIcon && (
          <div className={styles.leftIcon}>
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            [
              helpText && `${inputId}-help`,
              error && `${inputId}-error`
            ].filter(Boolean).join(' ') || undefined
          }
          {...props}
        />
        
        {rightIcon && (
          <div className={styles.rightIcon}>
            {rightIcon}
          </div>
        )}
        
        {rightText && (
          <div className={styles.rightText}>
            {rightText}
          </div>
        )}
      </div>
      
      {helpText && !error && (
        <p id={`${inputId}-help`} className={styles.helpText}>
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={`${inputId}-error`} className={styles.errorText}>
          {error}
        </p>
      )}
    </div>
  );
};
