import React, { type ReactNode, useState } from 'react';
import { PAGE_ROUTES } from '../../../constants';
import { FloatingDock } from '../../layout/FloatingDock/FloatingDock';
import { ToolsSheet } from '../../modals/ToolsSheet/ToolsSheet'; // Static import for stability
import { QuickActionSheet } from '../../modals/QuickActionSheet/QuickActionSheet';
import { useNotificationsContext } from '../../../contexts/AppContext';
import { Notifications } from '../../misc/Notifications/Notifications';
import styles from './Layout.module.css';

export type Page = typeof PAGE_ROUTES[keyof typeof PAGE_ROUTES];

interface LayoutProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  children: ReactNode;
  isGuest?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ currentPage, setCurrentPage, children, isGuest }) => {
  const { notifications, removeNotification } = useNotificationsContext();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  // Map Pages to IDs for Dock
  const getActiveTab = () => {
    switch (currentPage) {
      case PAGE_ROUTES.DASHBOARD: return 'dashboard';
      case PAGE_ROUTES.PROFILE: return 'profile';
      case PAGE_ROUTES.STATS: return 'analysis';
      case PAGE_ROUTES.ACTIVITY: return 'transactions';
      default: return 'dashboard';
    }
  };

  const handleTabChange = (id: string) => {
    if (id === 'dashboard') setCurrentPage(PAGE_ROUTES.DASHBOARD);
    if (id === 'profile') setCurrentPage(PAGE_ROUTES.PROFILE);
    if (id === 'analysis') setCurrentPage(PAGE_ROUTES.STATS); // Stats = Insights
    if (id === 'transactions') setCurrentPage(PAGE_ROUTES.ACTIVITY);
    // Menu (id='menu') is handled by onMenuClick
  };

  const handleToolNavigate = (route: string) => {
    // Check if route matches generic PAGE_ROUTES
    const pageKey = Object.keys(PAGE_ROUTES).find(k => PAGE_ROUTES[k as keyof typeof PAGE_ROUTES] === route);
    if (pageKey) {
      setCurrentPage(route as Page);
    }
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.brand}>
          Gestor Gastos MJ
          {isGuest && <span className={styles.guestBadge}>Beta</span>}
        </div>
        <Notifications notifications={notifications} onRemove={removeNotification} />
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <FloatingDock
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
        onAddClick={() => setIsQuickAddOpen(true)}
        onMenuClick={() => setIsToolsOpen(true)}
      />

      <QuickActionSheet
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      {/* Dynamic Tools Sheet */}
      {isToolsOpen && (
        <ToolsSheet
          isOpen={isToolsOpen}
          onClose={() => setIsToolsOpen(false)}
          onNavigate={handleToolNavigate}
        />
      )}

    </div>
  );
};
