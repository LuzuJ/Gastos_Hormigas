
import React, { useMemo } from 'react';
import { Quote, Sparkles } from 'lucide-react';

const WISDOM_DB = [
    "Cuida los pequeños gastos; un pequeño agujero hunde un barco. — Benjamin Franklin",
    "No ahorres lo que te sobra después de gastar, gasta lo que te sobra después de ahorrar. — Warren Buffett",
    "La regla 50/30/20: 50% Necesidades, 30% Deseos, 20% Ahorro. ¿La cumpliste hoy?",
    "El precio de algo es la cantidad de vida que cambias por ello. — Thoreau",
    "Invierte en ti mismo, es la inversión que paga el mejor interés.",
    "Un presupuesto no limita tu libertad, te da libertad para gastar sin culpa.",
    "Antes de comprar, espera 24 horas. Si aún lo quieres, cómpralo. Evita el impulso.",
    "Los gastos hormiga pueden sumar hasta $15,000 al año. ¡Identifícalos!",
    "No es cuánto ganas, sino cuánto conservas.",
    "Si no puedes comprarlo dos veces, no puedes permitírtelo.",
    "La educación financiera es el activo más valioso.",
    "Págate a ti mismo primero.",
    "Diferencia entre 'lo necesito' y 'lo quiero'.",
    "El interés compuesto es la octava maravilla del mundo.",
    "Revisar tus gastos semanalmente reduce el despilfarro un 20%."
];

export const DailyWisdom: React.FC = () => {
    // Select a quote based on the day of the year to be stable but changing daily
    const quote = useMemo(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        return WISDOM_DB[dayOfYear % WISDOM_DB.length];
    }, []);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex',
            gap: '12px',
            alignItems: 'start'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                padding: '8px',
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <Sparkles size={18} className="text-primary" />
            </div>
            <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Sabiduría del Día
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: '1.5' }}>
                    "{quote}"
                </p>
            </div>
        </div>
    );
};
