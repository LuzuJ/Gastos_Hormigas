import React, { useState } from 'react';
import { useDuplicateDetection } from '../../hooks/expenses/useDuplicateDetection';
import { DuplicateWarning } from '../forms/ExpenseForm/DuplicateWarning';
import type { Expense } from '../../types';
import styles from './DuplicateDetectionDemo.module.css';

export const DuplicateDetectionDemo: React.FC = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  
  // Gastos de ejemplo para demostrar la funcionalidad
  const sampleExpenses: Expense[] = [
    {
      id: '1',
      description: 'Café Starbucks',
      amount: 4.50,
      categoryId: 'food',
      subCategory: 'Cafetería',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // Hace 2 días
    },
    {
      id: '2',
      description: 'Gasolina Shell',
      amount: 50.00,
      categoryId: 'transport',
      subCategory: 'Combustible',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // Hace 3 días
    },
    {
      id: '3',
      description: 'Supermercado Carrefour',
      amount: 25,
      categoryId: 'food',
      subCategory: 'Supermercado',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // Hace 5 días
    }
  ];

  const duplicateDetection = useDuplicateDetection({
    expenses: sampleExpenses,
    newExpense: {
      description: description.trim(),
      amount: parseFloat(amount) || 0,
      categoryId: 'food'
    },
    timeWindowDays: 7,
    amountTolerance: 0.01
  });

  const handleTestDuplicate = () => {
    if (duplicateDetection.isDuplicate) {
      setShowWarning(true);
    }
  };

  const presetExamples = [
    { desc: 'Café Starbucks', amount: '4.50', label: 'Duplicado Exacto (Alta confianza)' },
    { desc: 'Combustible Shell', amount: '52.00', label: 'Similar (Media confianza)' },
    { desc: 'Mercado Carrefour', amount: '30.00', label: 'Parecido (Baja confianza)' },
    { desc: 'Pizza Dominos', amount: '15.00', label: 'No duplicado' }
  ];

  // Función para obtener la clase CSS del resultado de detección
  const getDetectionResultClass = () => {
    if (!duplicateDetection.isDuplicate) return styles.noDuplicate;
    
    switch (duplicateDetection.confidence) {
      case 'high': return styles.highConfidence;
      case 'medium': return styles.mediumConfidence;
      case 'low': return styles.lowConfidence;
      default: return styles.noDuplicate;
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        🔍 Demo: Detección de Gastos Duplicados
      </h2>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          📋 Gastos Existentes (para comparar):
        </h3>
        <div className={styles.expensesContainer}>
          {sampleExpenses.map(expense => (
            <div key={expense.id} className={styles.expenseItem}>
              <span className={styles.expenseName}>{expense.description}</span>
              <span className={styles.expenseDetails}>
                ${expense.amount.toFixed(2)} - {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : 'Sin fecha'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          ✏️ Prueba la Detección:
        </h3>
        
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="description-input" className={styles.label}>
              Descripción:
            </label>
            <input
              id="description-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ingresa una descripción..."
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="amount-input" className={styles.label}>
              Monto:
            </label>
            <input
              id="amount-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className={styles.input}
            />
          </div>
        </div>

        {/* Ejemplos predefinidos */}
        <div className={styles.presetsContainer}>
          <p className={styles.presetsLabel}>
            📝 Ejemplos rápidos:
          </p>
          <div className={styles.presetsGrid}>
            {presetExamples.map((example) => (
              <button
                key={example.desc + example.amount}
                onClick={() => {
                  setDescription(example.desc);
                  setAmount(example.amount);
                }}
                className={styles.presetButton}
                title={example.label}
              >
                {example.desc} (${example.amount})
              </button>
            ))}
          </div>
        </div>

        {/* Resultado de detección */}
        {description && amount && (
          <div className={`${styles.detectionResult} ${getDetectionResultClass()}`}>
            <h4 className={styles.detectionTitle}>
              {duplicateDetection.isDuplicate ? '⚠️ Resultado de Detección:' : '✅ Sin Duplicados Detectados'}
            </h4>
            
            {duplicateDetection.isDuplicate ? (
              <>
                <p className={styles.detectionDetail}>
                  <span className={styles.detectionLabel}>Confianza:</span> {duplicateDetection.confidence.toUpperCase()}
                </p>
                <p className={styles.detectionDetail}>
                  <span className={styles.detectionLabel}>Mensaje:</span> {duplicateDetection.message}
                </p>
                <p className={styles.detectionDetail}>
                  <span className={styles.detectionLabel}>Duplicados encontrados:</span> {duplicateDetection.duplicates.length}
                </p>
                
                {duplicateDetection.confidence !== 'low' && (
                  <button
                    onClick={handleTestDuplicate}
                    className={styles.showModalButton}
                  >
                    🚨 Ver Modal de Advertencia
                  </button>
                )}
              </>
            ) : (
              <p className={styles.noDuplicateMessage}>
                Este gasto puede registrarse sin problemas.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal de demostración */}
      <DuplicateWarning
        isVisible={showWarning}
        confidence={duplicateDetection.confidence}
        message={duplicateDetection.message}
        duplicates={duplicateDetection.duplicates}
        onConfirm={() => {
          setShowWarning(false);
          alert('¡Gasto registrado de todas formas!');
        }}
        onCancel={() => {
          setShowWarning(false);
          alert('Registro cancelado para evitar duplicado');
        }}
        onClose={() => setShowWarning(false)}
      />

      <div className={styles.infoSection}>
        <h4 className={styles.infoTitle}>💡 Cómo Funciona:</h4>
        <ul className={styles.infoList}>
          <li><strong>Alta confianza ({'>'}95%):</strong> Muy probable duplicado</li>
          <li><strong>Media confianza (80-95%):</strong> Posible duplicado</li>
          <li><strong>Baja confianza (60-80%):</strong> Similar pero probablemente distinto</li>
          <li><strong>Sin detección ({'<'}60%):</strong> Completamente diferente</li>
        </ul>
      </div>
    </div>
  );
};
