import React, { useEffect } from 'react';
import { ExportManager } from '../components/features/reports/ExportManager/ExportManager';
import { useAuth } from '../contexts/AuthContext';

interface ExportPageProps {
    isGuest?: boolean;
}

export const ExportPage: React.FC<ExportPageProps> = ({ isGuest }) => {
    // Optional: Redirect guests if export is restricted

    return (
        <div className="page-container" style={{ padding: '24px' }}>
            <header className="page-header" style={{ marginBottom: '32px' }}>
                <h1 className="page-title" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-headings)' }}>
                    Exportar Datos
                </h1>
                <p className="page-subtitle" style={{ color: 'var(--text-secondary)' }}>
                    Descarga tus registros en formato CSV o realiza una copia de seguridad completa.
                </p>
            </header>

            <div className="content-wrapper">
                <ExportManager />
            </div>
        </div>
    );
};
