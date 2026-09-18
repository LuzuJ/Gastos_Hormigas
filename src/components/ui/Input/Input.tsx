import React, { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    className = '',
    containerClassName = '',
    disabled,
    id,
    ...props
}) => {
    const inputId = id || props.name;

    return (
        <div className={`${styles.container} ${containerClassName}`}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
            )}

            <div className={`${styles.inputWrapper} ${leftIcon ? styles.hasIconLeft : ''} ${rightIcon ? styles.hasIconRight : ''}`}>
                {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}

                <input
                    id={inputId}
                    className={`${styles.input} ${error ? styles.error : ''} ${className}`}
                    disabled={disabled}
                    {...props}
                />

                {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
            </div>

            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};
