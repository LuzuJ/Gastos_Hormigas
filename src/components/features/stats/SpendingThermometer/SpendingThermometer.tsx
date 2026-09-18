
import React from 'react';
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card } from '../../../ui/Card/Card';
import { formatCurrency } from '../../../../utils/formatters';

interface SpendingThermometerProps {
    spent: number;
    limit: number; // Income or Budget
    label?: string;
}

export const SpendingThermometer: React.FC<SpendingThermometerProps> = ({ spent, limit, label = "Ingresos Mensuales" }) => {
    // Avoid division by zero
    const effectiveLimit = limit > 0 ? limit : 1;
    const percentage = Math.min((spent / effectiveLimit) * 100, 100);
    const isOverLimit = spent > limit;

    // Determine Status
    let statusColor = "var(--success)";
    let statusIcon = <CheckCircle2 size={20} />;
    let statusMessage = "Gasto saludable";

    if (percentage > 85) {
        statusColor = "var(--danger)";
        statusIcon = <AlertTriangle size={20} />;
        statusMessage = "¡Cuidado! Límite cercano";
    } else if (percentage > 60) {
        statusColor = "var(--warning)";
        statusIcon = <TrendingUp size={20} />;
        statusMessage = "Ritmo moderado";
    }

    if (limit === 0) {
        return (
            <Card padding="md" style={{ background: 'linear-gradient(to right, var(--bg-card), var(--bg-hover))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                    <AlertTriangle size={24} />
                    <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Sin límite definido</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>Registra tus ingresos para ver el termómetro.</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card padding="lg" style={{ borderLeft: `4px solid ${statusColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Termómetro de Gasto</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        vs {label}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: statusColor, fontWeight: 500, fontSize: '0.9rem' }}>
                    {statusIcon}
                    <span>{percentage.toFixed(0)}%</span>
                </div>
            </div>

            {/* Gauge Track */}
            <div style={{
                height: '12px',
                width: '100%',
                background: 'var(--bg-hover)',
                borderRadius: '6px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Fill */}
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: statusColor,
                    borderRadius: '6px',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem', fontWeight: 500 }}>
                <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(spent)}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(limit)}</span>
            </div>
        </Card>
    );
};
