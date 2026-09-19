import React, { ReactNode } from 'react';
import styles from './PageContainer.module.css';

interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
    return (
        <div className={`${styles.container} ${className}`}>
            {children}
        </div>
    );
};
