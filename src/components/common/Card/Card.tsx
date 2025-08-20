import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /** Contenido del card */
  children: React.ReactNode;
  /** Variante del card */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  /** Tamaño del padding */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Permite hacer hover */
  hoverable?: boolean;
  /** Permite hacer click */
  clickable?: boolean;
  /** Función onClick */
  onClick?: () => void;
  /** Clase CSS adicional */
  className?: string;
  /** Header del card */
  header?: React.ReactNode;
  /** Footer del card */
  footer?: React.ReactNode;
  /** Título del card */
  title?: string;
  /** Subtítulo o descripción */
  subtitle?: string;
  /** Icono del card */
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  header,
  footer,
  title,
  subtitle,
  icon
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    hoverable && styles.hoverable,
    clickable && styles.clickable,
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleClick();
    }
  };

  const CardElement = clickable ? 'button' : 'div';

  return (
    <CardElement
      className={cardClasses}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      aria-label={clickable && title ? `Tarjeta ${title}` : undefined}
    >
      {(header || title || subtitle || icon) && (
        <div className={styles.header}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <div className={styles.headerContent}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {header && <div className={styles.headerExtra}>{header}</div>}
        </div>
      )}
      
      <div className={styles.content}>
        {children}
      </div>
      
      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </CardElement>
  );
};
