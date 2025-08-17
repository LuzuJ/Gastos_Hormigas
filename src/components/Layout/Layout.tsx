import React, { type ReactNode } from 'react';
import styles from './Layout.module.css';
import { PAGE_ROUTES } from '../../constants';
import { Notifications } from '../Notifications/Notifications';
import { useExpensesController } from '../../hooks/useExpensesController';
import { auth } from '../../config/firebase'; 
import { ThemeToggler } from '../ThemeToggler/ThemeToggler'; 
import { UserPlus } from 'lucide-react';

export type Page = typeof PAGE_ROUTES[keyof typeof PAGE_ROUTES];

interface LayoutProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  children: ReactNode;
  isGuest?: boolean; 
}

export const Layout: React.FC<LayoutProps> = ({ currentPage, setCurrentPage, children, isGuest}) => {
  const { notifications, removeNotification } = useExpensesController(auth.currentUser?.uid || null);
  const handleGoToProfile = () => {
    setCurrentPage(PAGE_ROUTES.PROFILE);
  };

  return (
    <div className={styles.container}>
      {isGuest && (
        <div className={styles.guestBanner}>
          <p>Estás en **modo invitado**. Tus datos se perderán al salir.</p>
          <button onClick={handleGoToProfile}>
            <UserPlus size={16} />
            Crear cuenta gratis
          </button>
        </div>
      )}
      <header className={styles.header}>
        <h1>Panel de Gastos</h1>
        <p>Tu centro de control para entender y mejorar tus finanzas.</p>
        <div className={styles.headerActions}>
          <Notifications notifications={notifications} onRemove={removeNotification} />
          <ThemeToggler /> 
        </div>
      </header>

      {/* 3. Usamos las constantes en los botones de navegación */}
      <nav className={styles.mainNav}>
        <button
          onClick={() => setCurrentPage(PAGE_ROUTES.DASHBOARD)}
          className={`${styles.navLink} ${currentPage === PAGE_ROUTES.DASHBOARD ? styles.active : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentPage(PAGE_ROUTES.REGISTRO)}
          className={`${styles.navLink} ${currentPage === PAGE_ROUTES.REGISTRO ? styles.active : ''}`}
        >
          Registro
        </button>
        <button
          onClick={() => setCurrentPage(PAGE_ROUTES.PLANNING)}
          className={`${styles.navLink} ${currentPage === PAGE_ROUTES.PLANNING ? styles.active : ''}`}
        >
          Planificación
        </button>
        <button
          onClick={() => setCurrentPage(PAGE_ROUTES.ANALYSIS)}
          className={`${styles.navLink} ${currentPage === PAGE_ROUTES.ANALYSIS ? styles.active : ''}`}
        >
          Análisis por Categoría
        </button>
        <button
        onClick={() => setCurrentPage(PAGE_ROUTES.REPORTS)} 
        className={`${styles.navLink} ${currentPage === PAGE_ROUTES.REPORTS ? styles.active : ''}`}
        >
          Reportes 
        </button>
        <button
          onClick={() => setCurrentPage(PAGE_ROUTES.PROFILE)}
          className={`${styles.navLink} ${currentPage === PAGE_ROUTES.PROFILE ? styles.active : ''}`}
        >
          Mi Perfil
        </button>
      </nav>

      <main className={styles.mainContent}>
        {children}
      </main>

      <footer className={styles.footer}>
        <p>No gastes más de lo que tienes ❤️.</p>
      </footer>
    </div>
  );
};