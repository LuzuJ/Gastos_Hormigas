import React, { ReactNode } from 'react';
import styles from './Card.module.css';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
    children: ReactNode;
    variant?: CardVariant;
    padding?: CardPadding;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    className = '',
    style,
    onClick,
}) => {
    const combinedClassName = [
        styles.card,
        styles[variant],
        padding === 'none' ? styles.noPadding : styles[padding],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={combinedClassName} style={style} onClick={onClick}>
            {children}
        </div>
    );
};
