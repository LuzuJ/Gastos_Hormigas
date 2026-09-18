import React, { useState } from 'react';
import { Category, Account } from '../core/models/ledger';
import { Delete, Check, Sparkles, CreditCard } from 'lucide-react';

interface QuickCapturePadProps {
  categories: Category[];
  accounts: Account[];
  onCapture: (amount: number, categoryId: string, accountId: string, description: string) => void;
}

export const QuickCapturePad: React.FC<QuickCapturePadProps> = ({
  categories,
  accounts,
  onCapture,
}) => {
  const [displayAmount, setDisplayAmount] = useState<string>('0');
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const [selectedAccId, setSelectedAccId] = useState<string>(accounts[0]?.id || '');
  const [description, setDescription] = useState<string>('');
  const [justCaptured, setJustCaptured] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (displayAmount === '0' && digit !== '.') {
      setDisplayAmount(digit);
    } else if (digit === '.' && displayAmount.includes('.')) {
      return;
    } else {
      if (displayAmount.length < 8) {
        setDisplayAmount(displayAmount + digit);
      }
    }
  };

  const handleBackspace = () => {
    if (displayAmount.length <= 1) {
      setDisplayAmount('0');
    } else {
      setDisplayAmount(displayAmount.slice(0, -1));
    }
  };

  const handleQuickAdd = (addValue: number) => {
    const current = parseFloat(displayAmount) || 0;
    const nextVal = current + addValue;
    setDisplayAmount(Number.isInteger(nextVal) ? String(nextVal) : nextVal.toFixed(2));
  };

  const handleSubmit = () => {
    const numeric = parseFloat(displayAmount);
    if (!numeric || numeric <= 0) return;

    onCapture(numeric, selectedCatId, selectedAccId, description);
    setJustCaptured(true);
    setTimeout(() => setJustCaptured(false), 1400);

    setDisplayAmount('0');
    setDescription('');
  };

  const activeCategory = categories.find(c => c.id === selectedCatId) || categories[0];

  return (
    <div className="glass-card animate-pop-in" style={{
      padding: '14px 16px 18px 16px',
      maxWidth: '460px',
      margin: '0 auto',
      position: 'relative',
      borderRadius: '20px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Top Header: Account & Category Quick Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedAccId}
              onChange={e => setSelectedAccId(e.target.value)}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#cbd5e1',
                padding: '4px 24px 4px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} style={{ background: '#090d16', color: '#f8fafc' }}>
                  {acc.icon} {acc.name} (${acc.currentBalance.toFixed(0)})
                </option>
              ))}
            </select>
            <CreditCard size={11} color="#94a3b8" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Selected Category Tag */}
        {activeCategory && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: `${activeCategory.color}1a`,
            border: `1px solid ${activeCategory.color}44`,
            padding: '3px 8px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 700,
            color: activeCategory.color
          }}>
            <span>{activeCategory.icon}</span>
            <span>{activeCategory.name}</span>
          </div>
        )}
      </div>

      {/* Monto Display Screen */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(8, 12, 22, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
        position: 'relative',
        boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#64748b' }}>$</span>
          <span
            className="font-mono-num"
            style={{
              fontSize: '34px',
              fontWeight: 900,
              letterSpacing: '-1px',
              lineHeight: 1.1,
              color: justCaptured ? '#10b981' : '#ffffff',
              transition: 'color 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {displayAmount}
          </span>
        </div>

        {/* Optional quick note input */}
        <input
          type="text"
          placeholder="Nota rápida opcional (ej: café, taxi)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{
            marginTop: '2px',
            width: '85%',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px dashed rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            fontSize: '11px',
            textAlign: 'center',
            outline: 'none',
            padding: '2px 4px'
          }}
        />

        {justCaptured && (
          <div className="animate-pop-in" style={{
            position: 'absolute',
            top: '6px',
            background: '#10b981',
            color: '#ffffff',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
          }}>
            <Check size={11} /> ¡Gasto Capturado!
          </div>
        )}
      </div>

      {/* Quick Add Increment Pills */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
        {[1, 2, 5, 10, 20].map(val => (
          <button
            key={val}
            onClick={() => handleQuickAdd(val)}
            type="button"
            className="tactile-btn"
            style={{
              flex: 1,
              padding: '5px 0',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              background: 'rgba(56, 189, 248, 0.08)',
              color: '#38bdf8',
              fontWeight: 800,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            +${val}
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '5px',
        marginBottom: '8px'
      }}>
        {categories.slice(0, 6).map(cat => {
          const isSelected = cat.id === selectedCatId;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              type="button"
              className="tactile-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 8px',
                borderRadius: '8px',
                border: isSelected ? `2px solid ${cat.color}` : '1px solid rgba(255, 255, 255, 0.06)',
                background: isSelected ? `${cat.color}26` : 'rgba(255, 255, 255, 0.03)',
                color: isSelected ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: isSelected ? 800 : 600,
                textAlign: 'left',
                boxShadow: isSelected ? `0 0 10px ${cat.color}33` : 'none'
              }}
            >
              <span style={{ fontSize: '14px' }}>{cat.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tactile Keypad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '5px',
        marginBottom: '10px'
      }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map(digit => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            type="button"
            className="tactile-btn font-mono-num"
            style={{
              padding: '8px 0',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          >
            {digit}
          </button>
        ))}

        <button
          onClick={handleBackspace}
          type="button"
          className="tactile-btn"
          style={{
            padding: '8px 0',
            borderRadius: '8px',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            background: 'rgba(244, 63, 94, 0.1)',
            color: '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Delete size={16} />
        </button>
      </div>

      {/* Big Action Button */}
      <button
        onClick={handleSubmit}
        type="button"
        disabled={parseFloat(displayAmount) <= 0}
        className="tactile-btn"
        style={{
          width: '100%',
          padding: '11px',
          borderRadius: '10px',
          border: 'none',
          background: parseFloat(displayAmount) > 0
            ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #6366f1 100%)'
            : 'rgba(255, 255, 255, 0.06)',
          color: parseFloat(displayAmount) > 0 ? '#ffffff' : '#64748b',
          fontWeight: 800,
          fontSize: '13px',
          letterSpacing: '0.3px',
          cursor: parseFloat(displayAmount) > 0 ? 'pointer' : 'not-allowed',
          boxShadow: parseFloat(displayAmount) > 0 ? '0 8px 18px -4px rgba(56, 189, 248, 0.4)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <Sparkles size={15} />
        REGISTRAR GASTO
      </button>
    </div>
  );
};
