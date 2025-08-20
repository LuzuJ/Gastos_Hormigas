import React from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  /** Valor actual (0-100) */
  value: number;
  /** Valor máximo (por defecto 100) */
  max?: number;
  /** Tamaño de la barra */
  size?: 'small' | 'medium' | 'large';
  /** Variante de color */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Mostrar etiqueta con porcentaje */
  showLabel?: boolean;
  /** Texto personalizado para la etiqueta */
  label?: string;
  /** Mostrar valor numérico */
  showValue?: boolean;
  /** Formato del valor (currency, percentage, number) */
  valueFormat?: 'currency' | 'percentage' | 'number';
  /** Animación suave */
  animated?: boolean;
  /** Estilo redondeado */
  rounded?: boolean;
  /** Color personalizado */
  color?: string;
  /** Clase CSS adicional */
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'medium',
  variant = 'primary',
  showLabel = false,
  label,
  showValue = false,
  valueFormat = 'percentage',
  animated = true,
  rounded = true,
  color,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const formatValue = (val: number): string => {
    switch (valueFormat) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      case 'percentage':
        return `${Math.round(percentage)}%`;
      case 'number':
        return val.toLocaleString('es-MX');
      default:
        return val.toString();
    }
  };

  const getVariantColor = (): string => {
    if (color) return color;
    
    switch (variant) {
      case 'success':
        return 'var(--success-color)';
      case 'warning':
        return 'var(--warning-color, #f59e0b)';
      case 'danger':
        return 'var(--danger-color)';
      case 'info':
        return 'var(--info-color, #06b6d4)';
      default:
        return 'var(--primary-accent)';
    }
  };

  const progressBarClasses = [
    styles.progressBar,
    styles[size],
    styles[variant],
    rounded ? styles.rounded : '',
    animated ? styles.animated : '',
    className
  ].filter(Boolean).join(' ');

  const fillStyle: React.CSSProperties = {
    width: `${percentage}%`,
    backgroundColor: getVariantColor(),
    transition: animated ? 'width 0.5s ease-in-out' : 'none'
  };

  return (
    <div className={styles.container}>
      {(showLabel || label) && (
        <div className={styles.labelContainer}>
          <span className={styles.label}>
            {label || `Progreso: ${formatValue(value)} de ${formatValue(max)}`}
          </span>
          {showValue && (
            <span className={styles.value}>
              {formatValue(value)}
            </span>
          )}
        </div>
      )}
      
      <div className={progressBarClasses}>
        <div className={styles.track}>
          <div 
            className={styles.fill}
            style={fillStyle}
            aria-label={label || `${Math.round(percentage)}% completado`}
          >
            {animated && <div className={styles.shine} />}
          </div>
        </div>
        
        <progress
          className={styles.hiddenProgress}
          value={value}
          max={max}
          aria-label={label || `${Math.round(percentage)}% completado`}
        />
        
        {!showLabel && showValue && (
          <div className={styles.inlineValue}>
            {formatValue(value)}
          </div>
        )}
      </div>
    </div>
  );
};
