import React from 'react';
import { PieChart, Calendar, Tag, Download, User } from 'lucide-react';
import styles from './ToolsSheet.module.css';

interface ToolsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (route: string) => void;
}

export const ToolsSheet: React.FC<ToolsSheetProps> = ({ isOpen, onClose, onNavigate }) => {
    if (!isOpen) return null;

    const tools = [
        { id: 'budget', label: 'Categorías', icon: <PieChart />, route: 'budget', colorClass: styles.budget },
        { id: 'planning', label: 'Planificación', icon: <Calendar />, route: 'planning', colorClass: styles.planning },
        { id: 'profile', label: 'Mi Perfil', icon: <User />, route: 'profile', colorClass: styles.profile }, // New Profile Item
        { id: 'export', label: 'Exportar', icon: <Download />, route: 'export', colorClass: styles.export },
    ];

    const handleSelect = (route: string) => {
        onNavigate(route);
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={e => e.stopPropagation()}>
                <h3 className={styles.title}>Herramientas</h3>
                <div className={styles.grid}>
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            className={`${styles.toolItem} ${tool.colorClass}`}
                            onClick={() => handleSelect(tool.route)}
                        >
                            <div className={styles.iconCircle}>
                                {tool.icon}
                            </div>
                            <span className={styles.toolLabel}>{tool.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
