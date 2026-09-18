import React, { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon, actions }) => {
    return (
        <div className={styles.header}>
            <div className={styles.titleGroup}>
                <div className={styles.titleRow}>
                    {icon && <span className={styles.icon}>{icon}</span>}
                    <h1 className={styles.title}>{title}</h1>
                </div>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
        </div>
    );
};
