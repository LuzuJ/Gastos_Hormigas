import React, { useState } from 'react';
import type { Liability } from '../../types';
import { Trash2, CreditCard, DollarSign, Calendar, TrendingDown, Plus, Target } from 'lucide-react';

type PaymentType = 'regular' | 'extra' | 'interest_only';

interface DebtManagerProps {
  liabilities: Liability[];
  onAddLiability: (data: any) => void;
  onDeleteLiability: (id: string) => void;
  onUpdateLiability: (id: string, data: any) => void;
  onMakePayment: (liabilityId: string, amount: number, paymentType: PaymentType, description?: string) => void;
  getDebtAnalysis?: () => any[];
  monthlyExtraBudget?: number;
  onUpdateExtraBudget?: (amount: number) => void;
}

const LiabilityForm: React.FC<{ 
  onAdd: (data: any) => void; 
  onClose: () => void; 
}> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    originalAmount: '',
    type: 'credit_card' as const,
    interestRate: '',
    monthlyPayment: '',
    dueDate: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    const originalAmount = parseFloat(formData.originalAmount) || amount;
    const interestRate = parseFloat(formData.interestRate) || undefined;
    const monthlyPayment = parseFloat(formData.monthlyPayment) || undefined;

    if (formData.name.trim() && !isNaN(amount) && amount > 0) {
      onAdd({
        name: formData.name.trim(),
        amount,
        originalAmount,
        type: formData.type,
        interestRate,
        monthlyPayment,
        dueDate: formData.dueDate || undefined,
        description: formData.description || undefined
      });
      onClose();
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333'
  };

  const formGroupStyle = {
    marginBottom: '1rem'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ marginTop: 0 }}>Agregar Nueva Deuda</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Nombre de la deuda:</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Ej: Tarjeta de Crédito VISA"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Monto actual:</label>
              <input
                type="number"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Monto original (opcional):</label>
              <input
                type="number"
                value={formData.originalAmount}
                onChange={e => setFormData({...formData, originalAmount: e.target.value})}
                placeholder="0.00"
                step="0.01"
                min="0"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Tipo de deuda:</label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value as any})}
              style={inputStyle}
            >
              <option value="credit_card">Tarjeta de Crédito</option>
              <option value="loan">Préstamo Personal</option>
              <option value="mortgage">Hipoteca</option>
              <option value="student_loan">Préstamo Estudiantil</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Tasa de interés (% anual):</label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={e => setFormData({...formData, interestRate: e.target.value})}
                placeholder="15.5"
                step="0.1"
                min="0"
                max="100"
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Pago mensual mínimo:</label>
              <input
                type="number"
                value={formData.monthlyPayment}
                onChange={e => setFormData({...formData, monthlyPayment: e.target.value})}
                placeholder="0.00"
                step="0.01"
                min="0"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Fecha de vencimiento:</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData({...formData, dueDate: e.target.value})}
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Descripción:</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Información adicional..."
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Agregar Deuda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PaymentModalProps {
  liability: Liability;
  onClose: () => void;
  onMakePayment: (amount: number, paymentType: PaymentType, description?: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ liability, onClose, onMakePayment }) => {
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('regular');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      onMakePayment(numAmount, paymentType, description || undefined);
      onClose();
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333'
  };

  const formGroupStyle = {
    marginBottom: '1rem'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ marginTop: 0 }}>Realizar Pago - {liability.name}</h3>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Deuda actual: <strong>${liability.amount.toFixed(2)}</strong>
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Monto del pago:</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Tipo de pago:</label>
            <select 
              value={paymentType} 
              onChange={e => setPaymentType(e.target.value as PaymentType)}
              style={inputStyle}
            >
              <option value="regular">Pago Regular</option>
              <option value="extra">Pago Extra (reduce capital)</option>
              <option value="interest_only">Solo Intereses</option>
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Descripción (opcional):</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ej: Pago mensual abril"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Realizar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DebtManager: React.FC<DebtManagerProps> = ({ 
  liabilities, 
  onAddLiability, 
  onDeleteLiability, 
  onUpdateLiability,
  onMakePayment,
  getDebtAnalysis,
  monthlyExtraBudget = 0,
  onUpdateExtraBudget = () => {}
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Liability | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'planner'>('list');

  const debtAnalysis = typeof getDebtAnalysis === 'function' ? getDebtAnalysis() : [];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const getDebtTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card': return <CreditCard size={20} />;
      case 'mortgage': return <Calendar size={20} />;
      default: return <DollarSign size={20} />;
    }
  };

  const getDebtTypeLabel = (type: string) => {
    const labels = {
      credit_card: 'Tarjeta de Crédito',
      loan: 'Préstamo Personal',
      mortgage: 'Hipoteca',
      student_loan: 'Préstamo Estudiantil',
      other: 'Otro'
    };
    return labels[type as keyof typeof labels] || 'Deuda';
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Gestión de Deudas</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setCurrentView('list')}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ccc',
                backgroundColor: currentView === 'list' ? '#007bff' : 'white',
                color: currentView === 'list' ? 'white' : 'black',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Ver Lista
            </button>
            <button 
              onClick={() => setCurrentView('planner')}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ccc',
                backgroundColor: currentView === 'planner' ? '#007bff' : 'white',
                color: currentView === 'planner' ? 'white' : 'black',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Target size={16} />
              Planificador
            </button>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={16} />
            Agregar Deuda
          </button>
        </div>
      </div>

      {currentView === 'planner' ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4>Planificador de Deudas</h4>
          <p>Esta funcionalidad estará disponible próximamente.</p>
        </div>
      ) : (
        <div>
          {liabilities.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p>No tienes deudas registradas.</p>
              <button 
                onClick={() => setShowAddForm(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Agregar primera deuda
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {debtAnalysis.length > 0 ? debtAnalysis.map((analysis: any) => (
                <div key={analysis.liability.id} style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  backgroundColor: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {getDebtTypeIcon(analysis.liability.type)}
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{analysis.liability.name}</span>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>
                        {getDebtTypeLabel(analysis.liability.type)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => setSelectedDebt(analysis.liability)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <TrendingDown size={16} />
                        Pagar
                      </button>
                      <button 
                        onClick={() => onDeleteLiability(analysis.liability.id)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#666' }}>Deuda actual:</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formatCurrency(analysis.liability.amount)}</span>
                      </div>
                      {analysis.originalAmount > analysis.liability.amount && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#666' }}>Monto original:</span>
                          <span style={{ fontWeight: 'bold' }}>{formatCurrency(analysis.originalAmount)}</span>
                        </div>
                      )}
                    </div>

                    {analysis.progressPercentage > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                          <span>Progreso: {analysis.progressPercentage.toFixed(1)}%</span>
                          <span>Pagado: {formatCurrency(analysis.totalPaid)}</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: '#e0e0e0',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(100, analysis.progressPercentage)}%`,
                            backgroundColor: '#28a745',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                      {analysis.liability.interestRate && (
                        <span>Interés: {analysis.liability.interestRate}% anual</span>
                      )}
                      {analysis.liability.monthlyPayment && (
                        <span>Pago mensual: {formatCurrency(analysis.liability.monthlyPayment)}</span>
                      )}
                      {analysis.monthsToPayOff > 0 && (
                        <span>Tiempo estimado: {analysis.monthsToPayOff} meses</span>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                liabilities.map(liability => (
                <div key={liability.id} style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  backgroundColor: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {getDebtTypeIcon(liability.type)}
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{liability.name}</span>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>
                        {getDebtTypeLabel(liability.type)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => setSelectedDebt(liability)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <TrendingDown size={16} />
                        Pagar
                      </button>
                      <button 
                        onClick={() => onDeleteLiability(liability.id)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#666' }}>Deuda actual:</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formatCurrency(liability.amount)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                      {liability.interestRate && (
                        <span>Interés: {liability.interestRate}% anual</span>
                      )}
                      {liability.monthlyPayment && (
                        <span>Pago mensual: {formatCurrency(liability.monthlyPayment)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <LiabilityForm
          onAdd={onAddLiability}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {selectedDebt && (
        <PaymentModal
          liability={selectedDebt}
          onClose={() => setSelectedDebt(null)}
          onMakePayment={(amount, paymentType, description) => {
            onMakePayment(selectedDebt.id, amount, paymentType, description);
            setSelectedDebt(null);
          }}
        />
      )}
    </div>
  );
};

export default DebtManager;
