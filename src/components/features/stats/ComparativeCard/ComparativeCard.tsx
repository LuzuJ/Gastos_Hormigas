
import React, { useMemo } from 'react';
import { Card } from '../../../ui/Card/Card';
import { formatCurrency } from '../../../../utils/formatters';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface ComparativeData {
    name: string;
    actual: number;
    anterior: number;
}

interface ComparativeCardProps {
    data: ComparativeData[];
}

export const ComparativeCard: React.FC<ComparativeCardProps> = ({ data }) => {
    // 1. Calculate Totals
    const { totalActual, totalAnterior } = useMemo(() => {
        return data.reduce((acc, item) => ({
            totalActual: acc.totalActual + item.actual,
            totalAnterior: acc.totalAnterior + item.anterior
        }), { totalActual: 0, totalAnterior: 0 });
    }, [data]);

    const totalDiff = totalActual - totalAnterior;
    const totalPercent = totalAnterior > 0 ? (totalDiff / totalAnterior) * 100 : 0;

    // 2. Sort by largest absolute change to show most relevant first
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => Math.abs(b.actual - b.anterior) - Math.abs(a.actual - a.anterior));
    }, [data]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Summary Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-hover)',
                padding: '12px',
                borderRadius: '12px'
            }}>
                <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total vs Mes Anterior</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCurrency(totalActual)}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: totalDiff > 0 ? 'var(--danger)' : 'var(--success)', // Spending more is usually "bad"
                        fontWeight: 600
                    }}>
                        {totalDiff > 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        <span>{Math.abs(totalPercent).toFixed(1)}%</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {totalDiff > 0 ? '+' : ''}{formatCurrency(totalDiff)}
                    </span>
                </div>
            </div>

            {/* List Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedData.map((item, idx) => {
                    const diff = item.actual - item.anterior;
                    const isZero = diff === 0;

                    if (item.actual === 0 && item.anterior === 0) return null;

                    return (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid var(--border)',
                            paddingBottom: '8px'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Ant: {formatCurrency(item.anterior)}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatCurrency(item.actual)}</div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: isZero ? 'var(--text-secondary)' : (diff > 0 ? 'var(--danger)' : 'var(--success)')
                                }}>
                                    {isZero ? <Minus size={12} /> : (diff > 0 ? '+' : '')}
                                    {!isZero && formatCurrency(diff)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
