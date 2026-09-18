import { Home, PieChart, Plus, Settings, List, Grid } from 'lucide-react';
import styles from './FloatingDock.module.css';

interface DockItem {
    icon: React.ReactNode;
    label: string;
    id: string;
}

interface FloatingDockProps {
    activeTab: string;
    onTabChange: (id: string) => void;
    onAddClick: () => void;
    onMenuClick: () => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ activeTab, onTabChange, onAddClick, onMenuClick }) => {
    const items: DockItem[] = [
        { id: 'dashboard', label: 'Inicio', icon: <Home size={22} /> },
        { id: 'transactions', label: 'Actividad', icon: <List size={22} /> },
        // Add Button Middle
        { id: 'analysis', label: 'Insights', icon: <PieChart size={22} /> },
        { id: 'profile', label: 'Ajustes', icon: <Settings size={22} /> }
    ];

    // We will place the "Menu" (Tools) button replacing/next to one of them?
    // User requested "Activity" working.
    // The "Analysis" is "Insights".
    // Let's replace "Adjustes" (Settings) with "Menu" in the dock, and move Settings inside Profile or Tools?
    // Or just add "Menu" as a 5th element inside the "Tools Sheet" triggers.

    // Actually, "Settings" is Profile.
    // Let's add a small "Menu" button to the right of "Profile" or floating elsewhere?
    // Wait, the dock has 4 items + Add.
    // Let's use the layout: [Home, Activity] [ADD] [Insights, Menu]
    // And "Profile" can be accessed via Header or inside Menu?
    // Or keep Profile in Dock and put Menu in header?
    // User asked for "Centro de Herramientas".
    // Zen strategy: [Home, Activity] [ADD] [Stats, Menu]
    // Profile is usually less accessed. Let's move Profile to Header (which it kind of is) or inside Menu.

    // Updated Zen Dock:
    // 1. Home
    // 2. Activity (List)
    // [ADD]
    // 3. Stats (Insights)
    // 4. Menu (Tools -> Budget, categories, etc... AND Profile)

    const itemsFinal: DockItem[] = [
        { id: 'dashboard', label: 'Inicio', icon: <Home size={22} /> },
        { id: 'transactions', label: 'Actividad', icon: <List size={22} /> },
        { id: 'analysis', label: 'Insights', icon: <PieChart size={22} /> },
        { id: 'menu', label: 'Menú', icon: <Grid size={22} /> }
    ];

    const leftItems = itemsFinal.slice(0, 2);
    const rightItems = itemsFinal.slice(2);

    return (
        <nav className={styles.dockContainer}>
            {leftItems.map(item => (
                <button
                    key={item.id}
                    className={`${styles.dockItem} ${activeTab === item.id ? styles.active : ''}`}
                    onClick={() => onTabChange(item.id)}
                >
                    {item.icon}
                    <span className={styles.tooltip}>{item.label}</span>
                </button>
            ))}

            <button className={styles.addButton} onClick={onAddClick}>
                <Plus size={26} strokeWidth={3} />
            </button>

            {rightItems.map(item => (
                <button
                    key={item.id}
                    className={`${styles.dockItem} ${activeTab === item.id ? styles.active : ''}`}
                    onClick={() => item.id === 'menu' ? onMenuClick() : onTabChange(item.id)}
                >
                    {item.icon}
                    <span className={styles.tooltip}>{item.label}</span>
                </button>
            ))}
        </nav>
    );
};
