import React, { type ReactNode, useState, useEffect } from 'react';
import styles from './Layout.module.css';
import { PAGE_ROUTES } from '../../../constants';
import { Notifications } from '../../misc/Notifications/Notifications';
import { useNotificationsContext } from '../../../contexts/AppContext';
import { ThemeToggler } from '../../ui/ThemeToggler/ThemeToggler';
import {
  UserPlus,
  WifiOff,
  LayoutDashboard,
  Wallet,
  BarChart3,
  User,
  ChevronDown,
  ClipboardList,
  PiggyBank,
  TrendingUp,
  FileText,
  PieChart,
  Tag
} from 'lucide-react';

export type Page = typeof PAGE_ROUTES[keyof typeof PAGE_ROUTES];

interface LayoutProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  children: ReactNode;
  isGuest?: boolean;
}

// Definir grupos de navegación
const NAV_GROUPS = {
  FINANZAS: [PAGE_ROUTES.REGISTRO, PAGE_ROUTES.INCOMES, PAGE_ROUTES.BUDGET, PAGE_ROUTES.PLANNING],
  REPORTES: [PAGE_ROUTES.STATS, PAGE_ROUTES.ANALYSIS, PAGE_ROUTES.REPORTS]
};

export const Layout: React.FC<LayoutProps> = ({ currentPage, setCurrentPage, children, isGuest }) => {
  const { notifications, removeNotification } = useNotificationsContext();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleGoToProfile = () => {
    setCurrentPage(PAGE_ROUTES.PROFILE);
  };

  const isInGroup = (group: Page[]) => group.includes(currentPage);

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setOpenSubmenu(null);
  };

  return (
    <div className={styles.container}>
      {isGuest && (
        <div className={styles.guestBanner}>
          <span>Modo invitado</span>
          <button onClick={handleGoToProfile}>
            <UserPlus size={14} />
            Crear cuenta
          </button>
        </div>
      )}

      {/* Header Compacto */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>💰 Gastos Hormigas</h1>
        </div>
        <div className={styles.headerActions}>
          {!isOnline && (
            <div className={styles.offlineAlert}>
              <WifiOff size={14} />
            </div>
          )}
          <Notifications notifications={notifications} onRemove={removeNotification} />
          <ThemeToggler />
        </div>
      </header>

      {/* Navegación Simplificada - 4 items */}
      <nav className={styles.mainNav}>
        {/* Inicio */}
        <button
          onClick={() => handleNavClick(PAGE_ROUTES.DASHBOARD)}
          className={`${styles.navLink} ${currentPage === PAGE_ROUTES.DASHBOARD ? styles.active : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Inicio</span>
        </button>

        {/* Finanzas - Dropdown */}
        <div className={styles.navDropdown}>
          <button
            onClick={() => toggleSubmenu('finanzas')}
            className={`${styles.navLink} ${isInGroup(NAV_GROUPS.FINANZAS) ? styles.active : ''}`}
          >
            <Wallet size={18} />
            <span>Finanzas</span>
            <ChevronDown size={14} className={`${styles.chevron} ${openSubmenu === 'finanzas' ? styles.open : ''}`} />
          </button>
          {openSubmenu === 'finanzas' && (
            <div className={styles.submenu}>
              <button onClick={() => handleNavClick(PAGE_ROUTES.REGISTRO)}>
                <ClipboardList size={16} /> Gastos
              </button>
              <button onClick={() => handleNavClick(PAGE_ROUTES.INCOMES)}>
                <TrendingUp size={16} /> Ingresos
              </button>
              <button onClick={() => handleNavClick(PAGE_ROUTES.BUDGET)}>
                <PiggyBank size={16} /> Presupuestos
              </button>
              <button onClick={() => handleNavClick(PAGE_ROUTES.PLANNING)}>
                <Wallet size={16} /> Planificación
              </button>
            </div>
          )}
        </div>

        {/* Reportes - Dropdown */}
        <div className={styles.navDropdown}>
          <button
            onClick={() => toggleSubmenu('reportes')}
            className={`${styles.navLink} ${isInGroup(NAV_GROUPS.REPORTES) ? styles.active : ''}`}
          >
            <BarChart3 size={18} />
            <span>Reportes</span>
            <ChevronDown size={14} className={`${styles.chevron} ${openSubmenu === 'reportes' ? styles.open : ''}`} />
          </button>
          {openSubmenu === 'reportes' && (
            <div className={styles.submenu}>
              <button onClick={() => handleNavClick(PAGE_ROUTES.STATS)}>
                <PieChart size={16} /> Estadísticas
              </button>
              <button onClick={() => handleNavClick(PAGE_ROUTES.ANALYSIS)}>
                <Tag size={16} /> Categorías
              </button>
              <button onClick={() => handleNavClick(PAGE_ROUTES.REPORTS)}>
                <FileText size={16} /> Reportes
              </button>
            </div>
          )}
        </div>

        {/* Perfil */}
        <button
          onClick={() => handleNavClick(PAGE_ROUTES.PROFILE)}
          className={`${styles.navLink} ${currentPage === PAGE_ROUTES.PROFILE ? styles.active : ''}`}
        >
          <User size={18} />
          <span>Perfil</span>
        </button>
      </nav>

      <main className={styles.mainContent}>
        {children}
      </main>

      <footer className={styles.footer}>
        <p>No gastes más de lo que tienes ❤️</p>
      </footer>
    </div>
  );
};
