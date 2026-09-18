import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import type { Category } from '../../../types';
import styles from './CategoryDetailsSheet.module.css';
import { SUPABASE_TABLES } from '../../../constants';

interface CategoryDetailsSheetProps {
    category: Category | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateBudget: (catId: string, amount: number) => void;
    onAddSubCategory: (catId: string, name: string) => void;
    onDeleteSubCategory: (catId: string, subId: string, subName: string) => void;
    onDeleteCategory?: (catId: string) => void;
}

export const CategoryDetailsSheet: React.FC<CategoryDetailsSheetProps> = ({
    category, isOpen, onClose, onUpdateBudget, onAddSubCategory, onDeleteSubCategory, onDeleteCategory
}) => {
    // Reset inputs when category opens
    const [budgetInput, setBudgetInput] = useState('');
    const [subInput, setSubInput] = useState('');

    useEffect(() => {
        if (category) {
            setBudgetInput(category.budget?.toString() || '0');
        }
    }, [category]);

    if (!isOpen || !category) return null;

    const handleSaveBudget = () => {
        const val = parseFloat(budgetInput);
        if (!isNaN(val)) {
            onUpdateBudget(category.id, val);
        }
    };

    const handleAddSub = (e: React.FormEvent) => {
        e.preventDefault();
        if (subInput.trim()) {
            onAddSubCategory(category.id, subInput);
            setSubInput('');
        }
    };

    const handleDeleteCategory = () => {
        if (onDeleteCategory && window.confirm('¿Estás seguro de eliminar esta categoría y todos sus gastos?')) {
            onDeleteCategory(category.id);
            onClose();
        }
    };

    // Safe subcategory access
    const subCategories = category.subcategories || (category as any).subCategories || (category as any)[SUPABASE_TABLES.SUBCATEGORIES] || [];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <div className={styles.iconBox} style={{ color: category.color }}>
                            {category.icon || '🏷️'}
                        </div>
                        <div>
                            <h3 className={styles.title}>{category.name}</h3>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {subCategories.length || 0} subcategorías
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {onDeleteCategory && (
                            <button
                                onClick={handleDeleteCategory}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                                title="Eliminar Categoría"
                            >
                                <Trash2 size={24} />
                            </button>
                        )}
                        {/* Removed Top Close Button per user request */}
                    </div>
                </div>

                {/* Budget Section */}
                <div className={styles.section}>
                    <span className={styles.label}>Presupuesto Mensual</span>
                    <div className={styles.inputGroup}>
                        <input
                            type="number"
                            className={styles.input}
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                        />
                        <button
                            className={styles.btnPrimary}
                            onClick={() => {
                                handleSaveBudget();
                                // Tiny visual feedback
                                const btn = document.activeElement as HTMLElement;
                                if (btn) {
                                    btn.style.background = 'var(--success)';
                                    setTimeout(() => { btn.style.background = ''; }, 1000);
                                }
                            }}
                        >
                            <Save size={18} />
                        </button>
                    </div>
                </div>

                {/* Subcategories Section */}
                <div className={styles.section}>
                    <span className={styles.label}>Subcategorías</span>
                    <form onSubmit={handleAddSub} className={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="Nueva subcategoría..."
                            className={styles.input}
                            value={subInput}
                            onChange={(e) => setSubInput(e.target.value)}
                        />
                        <button type="submit" className={styles.btnPrimary}>
                            <Plus size={18} />
                        </button>
                    </form>

                    <div className={styles.subList}>
                        {subCategories.map((sub: any) => (
                            <div key={sub.id} className={styles.subChip}>
                                {sub.name}
                                <button
                                    className={styles.deleteSub}
                                    onClick={() => onDeleteSubCategory(category.id, sub.id, sub.name)}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {(!subCategories || subCategories.length === 0) && (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                Sin subcategorías
                            </span>
                        )}
                    </div>
                </div>

                {/* Bottom Close Button */}
                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-md)' }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'var(--bg-hover)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
