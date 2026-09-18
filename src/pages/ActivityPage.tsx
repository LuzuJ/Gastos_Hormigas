import React, { useState, useMemo } from 'react';
import { Search, Calendar } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer/PageContainer';
import { Card } from '../components/ui/Card/Card';
import { useExpensesContext } from '../contexts/AppContext';
import { formatCurrency } from '../utils/formatters';
import styles from './ActivityPage.module.css';

// Dummy categorization for icons (in real app, use category icon)
const getIcon = (catName: string) => {
    const map: Record<string, string> = {
        'Alimento': '🍔', 'Transporte': '🚗', 'Hogar': '🏠',
        'Entretenimiento': '🎬', 'Salud': '💊', 'Otro': '🛍️'
    };
    return map[catName] || '💸';
};

const ITEMS_PER_PAGE = 20;

export const ActivityPage: React.FC = () => {
    const { expenses } = useExpensesContext();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'expense' | 'income' | 'month'>('all');
    const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);

    // 1. Prepare Data (Merge & Sort)
    const allTransactions = useMemo(() => {
        // Map expenses to common format
        const _expenses = expenses.map(e => ({
            id: e.id,
            type: 'expense' as const,
            description: e.description,
            amount: e.amount,
            category: 'General', // TODO: Lookup name from categories context
            date: new Date(e.createdAt || Date.now()),
            timestamp: new Date(e.createdAt || Date.now()).getTime()
        }));

        return _expenses.sort((a, b) => b.timestamp - a.timestamp);
    }, [expenses]);

    // 2. Filter Logic
    const filtereddata = useMemo(() => {
        let data = allTransactions;

        // Text Search
        if (searchTerm) {
            const lowerInfo = searchTerm.toLowerCase();
            data = data.filter(t =>
                t.description.toLowerCase().includes(lowerInfo) ||
                t.category.toLowerCase().includes(lowerInfo)
            );
        }

        // Chip Filters
        const now = new Date();
        if (activeFilter === 'expense') {
            data = data.filter(t => t.type === 'expense');
        } else if (activeFilter === 'month') {
            data = data.filter(t =>
                t.date.getMonth() === now.getMonth() &&
                t.date.getFullYear() === now.getFullYear()
            );
        }

        return data;
    }, [allTransactions, searchTerm, activeFilter]);


    // 3. Paginate (slice)
    const visibleData = filtereddata.slice(0, displayLimit);
    const hasMore = visibleData.length < filtereddata.length;

    // 4. Group by Date
    const groupedData = useMemo(() => {
        const groups: Record<string, typeof visibleData> = {};
        visibleData.forEach(item => {
            const dateKey = item.date.toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long'
            });
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(item);
        });
        return groups;
    }, [visibleData]);

    const titleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return (
        <PageContainer>
            <div className={styles.container}>
                {/* Search Header */}
                <div className={styles.stickyHeader}>
                    <div className={styles.searchBar}>
                        <Search size={18} className="text-secondary" />
                        <input
                            type="text"
                            placeholder="Buscar movimientos..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Filters (Mock) */}
                    <div className={styles.filterRow}>
                        <button
                            className={`${styles.filterChip} ${activeFilter === 'all' ? styles.active : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            Todo
                        </button>
                        <button
                            className={`${styles.filterChip} ${activeFilter === 'expense' ? styles.active : ''}`}
                            onClick={() => setActiveFilter('expense')}
                        >
                            Gastos
                        </button>
                        <button
                            className={`${styles.filterChip} ${activeFilter === 'income' ? styles.active : ''}`}
                            onClick={() => setActiveFilter('income')}
                        >
                            Ingresos
                        </button>
                        <button
                            className={`${styles.filterChip} ${activeFilter === 'month' ? styles.active : ''}`}
                            onClick={() => setActiveFilter('month')}
                        >
                            <Calendar size={12} /> Este Mes
                        </button>
                    </div>
                </div>

                {/* List */}
                {Object.keys(groupedData).length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No se encontraron movimientos</p>
                    </div>
                ) : (
                    Object.entries(groupedData).map(([date, items]) => (
                        <div key={date}>
                            <h3 className={styles.groupTitle}>{titleCase(date)}</h3>
                            {items.map(item => (
                                <Card key={item.id} className={styles.transactionCard} padding="md">
                                    <div className={styles.txLeft}>
                                        <div className={styles.iconBox}>
                                            {getIcon(item.category)}
                                        </div>
                                        <div className={styles.txInfo}>
                                            <span className={styles.txDesc}>{item.description}</span>
                                            <span className={styles.txMeta}>{item.category} • {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className={styles.txRight}>
                                        <span className={`${styles.txAmount} ${item.type === 'expense' ? styles.expense : styles.income}`}>
                                            {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ))
                )}

                {hasMore && (
                    <button
                        className={styles.loadMore}
                        onClick={() => setDisplayLimit(prev => prev + ITEMS_PER_PAGE)}
                    >
                        Cargar más movimientos
                    </button>
                )}
            </div>
        </PageContainer>
    );
};

export default ActivityPage;
