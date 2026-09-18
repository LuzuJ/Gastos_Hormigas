import React from 'react';
import { Home, Zap, Flame, Sliders, Target, Building2 } from 'lucide-react';

export type NavTab = 'dashboard' | 'capture' | 'radar' | 'budget' | 'planning' | 'accounts' | 'erp';

interface BottomNavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  antBadgeCount?: number;
  isErpWorkspace?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
  antBadgeCount = 0,
  isErpWorkspace = false,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Inicio', icon: Home },
    { id: 'capture' as NavTab, label: 'Captura', icon: Zap, highlight: true },
    { id: 'radar' as NavTab, label: 'Fugas', icon: Flame, badge: antBadgeCount },
    { id: 'budget' as NavTab, label: 'Presupuesto', icon: Sliders },
    { id: 'planning' as NavTab, label: 'Metas', icon: Target },
    { id: 'erp' as NavTab, label: 'ERP Pro', icon: Building2, isErp: true },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 28px)',
      maxWidth: '560px',
      background: 'rgba(10, 15, 26, 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '24px',
      padding: '8px 10px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
      zIndex: 999
    }}>
      {tabs.map(tab => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;

        if (tab.highlight) {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              type="button"
              className="tactile-btn"
              style={{
                position: 'relative',
                top: '-12px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #6366f1 100%)',
                color: '#ffffff',
                border: '3px solid #060913',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 10px 20px -4px rgba(14, 165, 233, 0.6)'
              }}
            >
              <Icon size={20} />
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            type="button"
            className="tactile-btn"
            style={{
              background: 'none',
              border: 'none',
              color: isActive ? (tab.isErp ? '#818CF8' : '#38bdf8') : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px 6px',
              position: 'relative',
              borderRadius: '12px'
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} color={tab.isErp && isActive ? '#818CF8' : undefined} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  background: '#f43f5e',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 900,
                  borderRadius: '999px',
                  padding: '2px 5px',
                  lineHeight: 1
                }}>
                  {tab.badge}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: isActive ? 800 : 600,
              letterSpacing: '-0.2px'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
