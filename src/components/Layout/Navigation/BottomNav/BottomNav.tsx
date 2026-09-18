import React from 'react';
import styles from './BottomNav.module.css';
import {
    LayoutDashboard,
    Plus,
    PieChart,
    User,
    ClipboardList
} from 'lucide-react';
import { PAGE_ROUTES } from '../../../../constants';
import type { Page } from '../../Layout/Layout';

interface BottomNavProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    onAddClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
    currentPage,
    setCurrentPage,
    onAddClick
}) => {

    const NavItem = ({
        page,
        icon: Icon,
        label,
        isActiveOverride
    }: {
        page: Page;
        icon: any;
        label: string;
        isActiveOverride?: boolean;
    }) => {
        const isActive = isActiveOverride || currentPage === page;
        return (
            <button
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => setCurrentPage(page)}
            >
                <div className={styles.iconContainer}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={styles.label}>{label}</span>
            </button>
        );
    };

    const financePages: Page[] = [
        PAGE_ROUTES.REGISTRO,
        PAGE_ROUTES.INCOMES,
        PAGE_ROUTES.BUDGET,
        PAGE_ROUTES.PLANNING
    ];
    const isFinanceGroupActive = financePages.includes(currentPage);

    const analysisPages: Page[] = [
        PAGE_ROUTES.STATS,
        PAGE_ROUTES.ANALYSIS,
        PAGE_ROUTES.REPORTS
    ];
    const isAnalysisGroupActive = analysisPages.includes(currentPage);

    return (
        <nav className={styles.bottomNav}>
            <NavItem
                page={PAGE_ROUTES.DASHBOARD}
                icon={LayoutDashboard}
                label="Inicio"
            />

            {/* Grupo Finanzas - Navega a "Gastos" por defecto o al grupo */}
            <NavItem
                page={PAGE_ROUTES.REGISTRO}
                icon={ClipboardList}
                label="Movimientos"
                isActiveOverride={isFinanceGroupActive}
            />

            {/* FAB Central */}
            <div className={styles.fabContainer}>
                <button
                    className={styles.fab}
                    onClick={onAddClick}
                    aria-label="Agregar Gasto"
                >
                    <Plus size={32} />
                </button>
            </div>

            {/* Grupo Análisis - Navega a "Estadísticas" por defecto */}
            <NavItem
                page={PAGE_ROUTES.STATS}
                icon={PieChart}
                label="Análisis"
                isActiveOverride={isAnalysisGroupActive}
            />

            <NavItem
                page={PAGE_ROUTES.PROFILE}
                icon={User}
                label="Perfil"
            />
        </nav>
    );
};
