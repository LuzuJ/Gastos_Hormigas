import React from 'react';
import styles from './Button.module.css';
import { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className={styles.spinner} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={styles.iconLeft} size={16} />}
          <span className={styles.content}>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className={styles.iconRight} size={16} />}
        </>
      )}
    </button>
  );
};
