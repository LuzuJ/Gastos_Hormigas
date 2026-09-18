import React, { useState } from 'react';
import { JournalEntry, Category, Account } from '../core/models/ledger';
import { Trash2, Flame, Filter, Clock, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AntExpenseFeedProps {
  entries: JournalEntry[];
  categories: Category[];
  accounts: Account[];
  onDeleteEntry: (id: string) => void;
}

export const AntExpenseFeed: React.FC<AntExpenseFeedProps> = ({
  entries,
  categories,
  accounts,
  onDeleteEntry,
}) => {
  const [onlyAnts, setOnlyAnts] = useState<boolean>(false);

  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const accountMap = new Map(accounts.map(a => [a.id, a]));

  const filteredEntries = onlyAnts
    ? entries.filter(e => e.isAntExpense)
    : entries;

  return (
    <div style={{
      maxWidth: '520px',
      margin: '20px auto 0 auto',
    }}>
      {/* Header with Filter Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.2px' }}>
            {onlyAnts ? 'Fugas Hormiga' : 'Movimientos del Ledger'}
          </h3>
          <span style={{
            fontSize: '11px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            padding: '2px 8px',
            borderRadius: '999px',
            fontWeight: 800
          }}>
            {filteredEntries.length}
          </span>
        </div>

        <button
          onClick={() => setOnlyAnts(!onlyAnts)}
          type="button"
          className="tactile-btn"
          style={{
            background: onlyAnts ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: onlyAnts ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
            color: onlyAnts ? '#f43f5e' : '#94a3b8',
            borderRadius: '12px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Filter size={12} />
          {onlyAnts ? 'Solo Hormiga' : 'Todos'}
        </button>
      </div>

      {/* Entry List */}
      {filteredEntries.length === 0 ? (
        <div className="glass-card" style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#64748b',
          fontSize: '13px'
        }}>
          <Sparkles size={24} color="#38bdf8" style={{ marginBottom: '8px', opacity: 0.7 }} />
          <div>No hay transacciones registradas aún.</div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
            Usa el teclado rápido para capturar tu primer gasto en 1 segundo.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredEntries.slice(0, 20).map(entry => {
            const cat = entry.categoryId ? categoryMap.get(entry.categoryId) : null;
            const acc = entry.sourceAccountId ? accountMap.get(entry.sourceAccountId) : null;

            let timeAgo = '';
            try {
              timeAgo = formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: es });
            } catch {
              timeAgo = 'reciente';
            }

            return (
              <div
                key={entry.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '18px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '14px',
                    background: cat ? `${cat.color}22` : 'rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    border: cat ? `1px solid ${cat.color}44` : '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    {cat?.icon || '📦'}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                        {entry.description || cat?.name || 'Gasto'}
                      </span>
                      {entry.isAntExpense && (
                        <span style={{
                          fontSize: '9px',
                          background: '#f43f5e',
                          color: '#ffffff',
                          padding: '1px 6px',
                          borderRadius: '6px',
                          fontWeight: 900,
                          letterSpacing: '0.4px'
                        }}>
                          HORMIGA
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      <Clock size={11} />
                      <span>{timeAgo}</span>
                      {acc && <span>• {acc.name}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    className="font-mono-num"
                    style={{
                      fontSize: '17px',
                      fontWeight: 900,
                      color: entry.isAntExpense ? '#f43f5e' : '#f8fafc'
                    }}
                  >
                    -${entry.amount.toFixed(2)}
                  </span>

                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    type="button"
                    title="Eliminar registro"
                    className="tactile-btn"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
