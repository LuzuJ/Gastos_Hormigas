import React, { useMemo, useState } from 'react';
import { Sparkles, Quote, RefreshCw } from 'lucide-react';

const WISDOM_DB = [
  { quote: "Cuida los pequeños gastos; un pequeño agujero hunde un barco.", author: "Benjamin Franklin" },
  { quote: "No ahorres lo que te sobra después de gastar, gasta lo que te sobra después de ahorrar.", author: "Warren Buffett" },
  { quote: "La regla 50/30/20: 50% Necesidades, 30% Deseos, 20% Ahorro. ¿La cumpliste hoy?", author: "Principio Financiero" },
  { quote: "El precio de algo es la cantidad de vida que cambias por ello.", author: "Henry David Thoreau" },
  { quote: "Un presupuesto no limita tu libertad, te da libertad para gastar sin culpa.", author: "Dave Ramsey" },
  { quote: "Antes de comprar por impulso, espera 24 horas. Si aún lo necesitas, cómpralo.", author: "Hábito Anti-Fuga" },
  { quote: "Los gastos hormiga pueden sumar hasta $15,000 al año. ¡Identifícalos y toma el control!", author: "Regla del 1%" },
  { quote: "No es cuánto ganas en tu empleo, sino cuánto logras conservar e invertir.", author: "Robert Kiyosaki" },
  { quote: "El interés compuesto es la octava maravilla del mundo. Quien lo entiende lo gana; quien no, lo paga.", author: "Albert Einstein" },
  { quote: "Diferencia siempre entre lo que realmente 'necesitas' y lo que simplemente 'deseas'.", author: "Estoicismo Financiero" }
];

export const DailyWisdom: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState<number>(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % WISDOM_DB.length;
  });

  const current = WISDOM_DB[quoteIndex % WISDOM_DB.length];

  const handleNextQuote = () => {
    setQuoteIndex(prev => (prev + 1) % WISDOM_DB.length);
  };

  return (
    <div className="glass-card animate-pop-in" style={{
      padding: '18px 20px',
      marginBottom: '18px',
      background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
      border: '1px solid rgba(56, 189, 248, 0.2)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '12px',
          background: 'rgba(56, 189, 248, 0.15)',
          color: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid rgba(56, 189, 248, 0.3)'
        }}>
          <Sparkles size={18} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, color: '#38bdf8' }}>
              Sabiduría Diaria
            </span>
            <button
              onClick={handleNextQuote}
              type="button"
              className="tactile-btn"
              title="Siguiente consejo"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '8px'
              }}
            >
              <RefreshCw size={12} /> Cambiar
            </button>
          </div>

          <p style={{
            fontSize: '14px',
            color: '#f1f5f9',
            fontStyle: 'italic',
            lineHeight: '1.5',
            margin: '0 0 6px 0'
          }}>
            "{current.quote}"
          </p>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>
            — {current.author}
          </span>
        </div>
      </div>
    </div>
  );
};
