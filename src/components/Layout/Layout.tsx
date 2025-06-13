import React, { type ReactNode } from 'react';
import styles from './Layout.module.css';

// Define el "contrato": este componente DEBE recibir estas props.
interface LayoutProps {
  currentPage: 'dashboard' | 'categories';
  setCurrentPage: (page: 'dashboard' | 'categories') => void;
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentPage, setCurrentPage, children }) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Panel de Gastos</h1>
        <p>Tu centro de control para entender y mejorar tus finanzas.</p>
      </header>

      {/* Navegación que usa las props para funcionar */}
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
