import React, { type ReactNode } from 'react';
import styles from './Layout.module.css';

// Definimos un tipo para las páginas para que sea más seguro
export type Page = 'dashboard' | 'planning' | 'analysis';

interface LayoutProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentPage, setCurrentPage, children }) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Panel de Gastos</h1>
        <p>Tu centro de control para entender y mejorar tus finanzas.</p>
      </header>

      <nav className={styles.mainNav}>
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`${styles.navLink} ${currentPage === 'dashboard' ? styles.active : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentPage('planning')}
          className={`${styles.navLink} ${currentPage === 'planning' ? styles.active : ''}`}
        >
          Planificación
        </button>
        <button
          onClick={() => setCurrentPage('analysis')}
          className={`${styles.navLink} ${currentPage === 'analysis' ? styles.active : ''}`}
        >
          Análisis por Categoría
        </button>
      </nav>

      <main className={styles.mainContent}>
        {children}
      </main>

      <footer className={styles.footer}>
        <p>Hecho con ❤️ para un gran proyecto de ingeniería.</p>
      </footer>
    </div>
  );
};
