
import React from 'react';
import { Card } from '../../../ui/Card/Card';
import { formatCurrency } from '../../../../utils/formatters';

interface CategoryData {
    name: string;
    amount: number;
    color: string;
    percentage: number;
    icon?: string;
}

interface CategoryListProps {
    data: CategoryData[];
    total: number;
}

export const CategoryList: React.FC<CategoryListProps> = ({ data, total }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.map((cat, idx) => (
                <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '8px 0',
                    borderBottom: idx < data.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '32px', height: '32px',
                                borderRadius: '8px',
                                background: `${cat.color}20`,
                                color: cat.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.9rem'
                            }}>
                                {cat.icon || '🏷️'}
                            </div>
                            <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{cat.name}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{formatCurrency(cat.amount)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cat.percentage.toFixed(0)}%</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'var(--bg-hover)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${cat.percentage}%`,
                            height: '100%',
                            background: cat.color,
                            borderRadius: '3px',
                            transition: 'width 0.5s ease-out'
                        }} />
                    </div>
                </div>
            ))}
        </div>
    );
};
