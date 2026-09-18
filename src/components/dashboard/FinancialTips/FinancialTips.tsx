import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '../../ui/Card/Card';

export const FinancialTips: React.FC = () => {
    // Basic static tips for now
    const tips = [
        {
            icon: <TrendingUp size={20} className="text-success" />,
            title: "Regla 50/30/20",
            desc: "Intenta destinar 50% a necesidades, 30% a deseos y 20% a ahorros/deudas."
        },
        {
            icon: <AlertTriangle size={20} className="text-warning" />,
            title: "Fondo de Emergencia",
            desc: "Antes de invertir, asegúrate de tener 3-6 meses de gastos cubiertos."
        },
        {
            icon: <Lightbulb size={20} className="text-primary" />,
            title: "Elimina Gastos Hormiga",
            desc: "Pequeños gastos diarios pueden sumar miles al año. Identifícalos."
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={24} color="#FFC107" fill="#FFC107" />
                Consejos Financieros
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                {tips.map((tip, idx) => (
                    <Card key={idx} padding="md">
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{
                                minWidth: '40px', height: '40px',
                                background: 'var(--bg-hover)', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {tip.icon}
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600 }}>{tip.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                    {tip.desc}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
