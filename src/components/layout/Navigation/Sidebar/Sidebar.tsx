import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import {
    LayoutDashboard,
    Wallet,
    BarChart3,
    User,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    TrendingUp,
    PiggyBank,
    PieChart,
    Tag,
    FileText,
    LogOut,
    UserPlus,
    Download
} from 'lucide-react';
import { PAGE_ROUTES } from '../../../../constants';
import { ThemeToggler } from '../../../ui/ThemeToggler/ThemeToggler';
import type { Page } from '../../Layout/Layout';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    isGuest?: boolean;
    onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentPage,
    setCurrentPage,
    isGuest,
    onLogout
}) => {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['finanzas', 'reportes']));

    const toggleGroup = (group: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(group)) {
            newExpanded.delete(group);
        } else {
            newExpanded.add(group);
        }
        setExpandedGroups(newExpanded);
    };

    const NavItem = ({
        page,
        icon: Icon,
        label,
        onClick
    }: {
        page?: Page;
        icon: any;
        label: string;
        onClick?: () => void;
    }) => {
        const isActive = page === currentPage;
        return (
            <button
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={onClick || (() => page && setCurrentPage(page))}
            >
                <Icon size={20} />
                <span>{label}</span>
                {isActive && <div className={styles.activeIndicator} />}
            </button>
        );
    };

    const NavGroup = ({
        id,
        icon: Icon,
        label,
        children
    }: {
        id: string;
        icon: any;
        label: string;
        children: React.ReactNode;
    }) => {
        const isExpanded = expandedGroups.has(id);
        return (
            <div className={styles.navGroup}>
                <button
                    className={styles.groupHeader}
                    onClick={() => toggleGroup(id)}
                >
                    <div className={styles.groupLabel}>
                        <Icon size={20} />
                        <span>{label}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {isExpanded && (
                    <div className={styles.groupContent}>
                        {children}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.header}>
                <h1 className={styles.logo}>Gastos Hormigas</h1>
                <p className={styles.version}>v1.0</p>
            </div>

            <div className={styles.content}>
                <nav className={styles.nav}>
                    <div className={styles.sectionLabel}>PRINCIPAL</div>
                    <NavItem
                        page={PAGE_ROUTES.DASHBOARD}
                        icon={LayoutDashboard}
                        label="Inicio"
                    />

                    <div className={styles.sectionLabel} style={{ marginTop: '16px' }}>GESTIÓN</div>

                    <NavGroup id="finanzas" icon={Wallet} label="Finanzas">
                        <NavItem page={PAGE_ROUTES.REGISTRO} icon={ClipboardList} label="Gastos" />
                        <NavItem page={PAGE_ROUTES.INCOMES} icon={TrendingUp} label="Ingresos" />
                        <NavItem page={PAGE_ROUTES.BUDGET} icon={PiggyBank} label="Presupuestos" />
                        <NavItem page={PAGE_ROUTES.PLANNING} icon={Wallet} label="Planificación" />
                    </NavGroup>

                    <NavGroup id="reportes" icon={BarChart3} label="Reportes">
                        <NavItem page={PAGE_ROUTES.STATS} icon={PieChart} label="Estadísticas" />
                        <NavItem page={PAGE_ROUTES.ANALYSIS} icon={Tag} label="Categorías" />
                        <NavItem page={PAGE_ROUTES.REPORTS} icon={FileText} label="Reportes" />
                        <NavItem page={PAGE_ROUTES.EXPORT} icon={Download} label="Exportar Datos" />
                    </NavGroup>

                    <div className={styles.sectionLabel} style={{ marginTop: '16px' }}>CUENTA</div>
                    <NavItem page={PAGE_ROUTES.PROFILE} icon={User} label="Perfil" />
                </nav>
            </div>

            <div className={styles.footer}>
                {isGuest ? (
                    <div className={styles.guestCard}>
                        <p>Modo Invitado</p>
                        <button
                            className={styles.upgradeButton}
                            onClick={() => setCurrentPage(PAGE_ROUTES.PROFILE)}
                        >
                            <UserPlus size={16} /> Crear Cuenta
                        </button>
                    </div>
                ) : (
                    <div className={styles.userCard}>
                        <ThemeToggler />
                    </div>
                )}
            </div>
        </aside>
    );
};
