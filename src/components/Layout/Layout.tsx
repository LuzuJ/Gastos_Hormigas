import React, { type ReactNode } from 'react';
import styles from './Layout.module.css';

// Interfaz que define las props que este componente espera recibir
interface LayoutProps {
  currentPage: 'dashboard' | 'categories' | 'planning';
  setCurrentPage: (page: 'dashboard' | 'categories' | 'planning') => void;
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentPage, setCurrentPage, children }) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Panel de Gastos</h1>
        <p>Tu centro de control para entender y mejorar tus finanzas.</p>
      </header>

      {/* --- CORRECCIÓN AQUÍ --- */}
      {/* Añadimos los eventos onClick que cambian el estado en App.tsx */}
      <nav className={styles.mainNav}>
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`${styles.navLink} ${currentPage === 'dashboard' ? styles.active : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentPage('categories')}
          className={`${styles.navLink} ${currentPage === 'categories' ? styles.active : ''}`}
        >
          Categorías
        </button>

        <button
          onClick={() => setCurrentPage('planning')}
          className={`${styles.navLink} ${currentPage === 'planning' ? styles.active : ''}`}
        >
          Planificación
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
