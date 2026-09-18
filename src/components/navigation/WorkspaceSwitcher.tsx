import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Briefcase, User, Plus, Check, ChevronDown } from 'lucide-react';

export const WorkspaceSwitcher: React.FC = () => {
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsType, setNewWsType] = useState<'personal' | 'business'>('business');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setIsSubmitting(true);
    const created = await createWorkspace(newWsName.trim(), newWsType);
    setIsSubmitting(false);
    if (created) {
      setNewWsName('');
      setIsModalOpen(false);
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '12px',
          background: activeWorkspace?.type === 'business' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.08)',
          border: `1px solid ${activeWorkspace?.type === 'business' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
          color: '#fff',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {activeWorkspace?.type === 'business' ? (
          <Briefcase size={16} color="#818CF8" />
        ) : (
          <User size={16} color="#34D399" />
        )}
        <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeWorkspace?.name || 'Espacio'}
        </span>
        <span
          style={{
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            padding: '2px 6px',
            borderRadius: '6px',
            background: activeWorkspace?.type === 'business' ? '#4F46E5' : '#059669',
            color: '#fff',
          }}
        >
          {activeWorkspace?.type === 'business' ? 'ERP Pro' : 'Personal'}
        </span>
        <ChevronDown size={14} style={{ opacity: 0.7 }} />
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '260px',
              background: '#18181B',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '8px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ padding: '6px 8px', fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 600, textTransform: 'uppercase' }}>
              Tus Espacios de Trabajo
            </div>

            {workspaces.map((ws) => {
              const isSelected = ws.id === activeWorkspace?.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    border: 'none',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {ws.type === 'business' ? <Briefcase size={14} color="#818CF8" /> : <User size={14} color="#34D399" />}
                    <span>{ws.name}</span>
                  </div>
                  {isSelected && <Check size={14} color="#818CF8" />}
                </button>
              );
            })}

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '6px 0' }} />

            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 10px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                color: '#E4E4E7',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              <Plus size={14} />
              <span>Nuevo Espacio (ERP / Personal)</span>
            </button>
          </div>
        </>
      )}

      {/* Modal de Creación de Workspace */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              background: '#18181B',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#fff' }}>Crear Espacio de Trabajo</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#A1A1AA' }}>
              Elige si deseas un gestor personal rápido o un sistema contable estilo ERP con partida doble.
            </p>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#D4D4D8', marginBottom: '6px' }}>
                  Nombre del Espacio
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mi Negocio, Consultora o Gastos Hogar"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#27272A',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#D4D4D8', marginBottom: '8px' }}>
                  Tipo de Sistema
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div
                    onClick={() => setNewWsType('personal')}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid ${newWsType === 'personal' ? '#10B981' : 'rgba(255, 255, 255, 0.1)'}`,
                      background: newWsType === 'personal' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <User size={20} color={newWsType === 'personal' ? '#10B981' : '#71717A'} style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Personal</div>
                    <div style={{ fontSize: '0.7rem', color: '#A1A1AA' }}>Gastos Hormiga y Presupuesto</div>
                  </div>

                  <div
                    onClick={() => setNewWsType('business')}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid ${newWsType === 'business' ? '#6366F1' : 'rgba(255, 255, 255, 0.1)'}`,
                      background: newWsType === 'business' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <Briefcase size={20} color={newWsType === 'business' ? '#6366F1' : '#71717A'} style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Micro-ERP</div>
                    <div style={{ fontSize: '0.7rem', color: '#A1A1AA' }}>Partida Doble y Centros de Costo</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#D4D4D8',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newWsName.trim()}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Espacio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
