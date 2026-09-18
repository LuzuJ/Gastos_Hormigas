
import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useExpensesContext, useFinancialsContext } from '../../../contexts/AppContext';
import { formatCurrency } from '../../../utils/formatters';

export const SmartInsight: React.FC = () => {
    const { expenses } = useExpensesContext();
    const { financials } = useFinancialsContext();

    const insight = useMemo(() => {
        if (!expenses || expenses.length === 0) return null;

        const now = new Date();
        const currentMonth = now.getMonth();

        // 1. Calculate spending velocity
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysPassed = now.getDate();

        const currentMonthExpenses = expenses.filter(e => {
            const d = new Date(e.createdAt || 0);
            return d.getMonth() === currentMonth;
        });

        const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const avgDailySpend = totalSpent / Math.max(1, daysPassed);
        const projectedSpend = totalSpent + (avgDailySpend * (daysInMonth - daysPassed));

        const monthlyIncome = financials?.monthlyIncome || 0;

        // 2. Generate Insight Logic
        if (monthlyIncome > 0) {
            const spendRatio = totalSpent / monthlyIncome;
            const projectedRatio = projectedSpend / monthlyIncome;

            // Danger Zone
            if (spendRatio > 0.9) {
                return {
                    type: 'danger',
                    title: '¡Alerta Roja!',
                    message: `Has consumido el 90% de tus ingresos y faltan ${daysInMonth - daysPassed} días. ¡Frena los gastos ya!`,
                    icon: <AlertTriangle size={24} className="text-danger" />
                };
            }

            // Warning Zone
            if (projectedRatio > 1) {
                return {
                    type: 'warning',
                    title: 'Cuidado con el ritmo',
                    message: `A este paso, gastarás ${formatCurrency(projectedSpend)} este mes, superando tus ingresos. Intenta reducir gastos diarios.`,
                    icon: <TrendingUp size={24} className="text-warning" />
                };
            }

            // Safe Zone (Mid-month check)
            if (daysPassed > 15 && projectedRatio < 0.8) {
                return {
                    type: 'success',
                    title: '¡Vas excelente!',
                    message: `Mantienes un ritmo de ahorro genial. Proyectas terminar el mes con ${formatCurrency(monthlyIncome - projectedSpend)} a favor.`,
                    icon: <CheckCircle2 size={24} className="text-success" />
                };
            }
        }

        // Default: Spending Trend vs Last Week (Simple Heuristic for now)
        // For simplicity, let's just show a daily average insight if no income set
        return {
            type: 'info',
            title: 'Análisis de Ritmo',
            message: `Gastas un promedio de ${formatCurrency(avgDailySpend)} al día. ¿Es esto sostenible para ti?`,
            icon: <Sparkles size={24} className="text-primary" />
        };

    }, [expenses, financials]);

    if (!insight) return null;

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
            borderLeft: `4px solid var(--${insight.type === 'info' ? 'primary' : insight.type})`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            gap: '12px',
            alignItems: 'start'
        }}>
            <div style={{ padding: '4px' }}>
                {insight.icon}
            </div>
            <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700 }}>
                    {insight.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {insight.message}
                </p>
                {insight.type === 'danger' && (
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                        Acción sugerida: Revisa tus gastos fijos.
                    </div>
                )}
            </div>
        </div>
    );
};
