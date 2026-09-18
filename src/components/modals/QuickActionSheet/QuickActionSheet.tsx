import React, { useState, useEffect } from 'react';
import { useCategoriesContext, useExpensesContext, useNetWorthContext } from '../../../contexts/AppContext';
import toast from 'react-hot-toast';
import { X, Check } from 'lucide-react';
import styles from './QuickActionSheet.module.css';

interface QuickActionSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

type Mode = 'expense' | 'income';

export const QuickActionSheet: React.FC<QuickActionSheetProps> = ({ isOpen, onClose }) => {
    const { categories } = useCategoriesContext();
    const { addExpense } = useExpensesContext();
    const { assets, updateAsset } = useNetWorthContext();

    const [mode, setMode] = useState<Mode>('expense');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [assetId, setAssetId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial State defaults
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setDescription('');
            if (categories.length > 0) setCategoryId(categories[0].id);
            if (assets.length > 0) setAssetId(assets[0].id);
        }
    }, [isOpen, categories, assets]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = parseFloat(amount);

        if (!value || value <= 0) {
            toast.error('Monto inválido');
            return;
        }

        setIsSubmitting(true);
        try {
            if (mode === 'expense') {
                if (!categoryId) throw new Error('Categoría requerida');
                const cat = categories.find(c => c.id === categoryId);

                await addExpense({
                    description: description || cat?.name || 'Gasto',
                    amount: value,
                    categoryId,
                    subCategory: 'General',
                    createdAt: new Date().toISOString()
                });

                // Deduct from asset if selected
                if (assetId) {
                    const asset = assets.find(a => a.id === assetId);
                    if (asset) {
                        await updateAsset(asset.id, { ...asset, value: asset.value - value });
                    }
                }
                toast.success(`💸 Gasto de $${value} registrado`);
            } else {
                // Income Logic (Simplified for now as we don't have dedicated 'addIncome' generic hook context yet, using Asset update directly or similar)
                // Assuming we just add to asset or creates a record. For now, let's update Asset directly + Toast
                if (assetId) {
                    const asset = assets.find(a => a.id === assetId);
                    if (asset) {
                        await updateAsset(asset.id, { ...asset, value: asset.value + value });
                        toast.success(`💰 Ingreso de $${value} añadido a ${asset.name}`);
                    }
                } else {
                    toast.success('Ingreso registrado (Sin cuenta asociada)');
                }
            }
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={e => e.stopPropagation()}>
                {/* Header / Tabs */}
                <div className={styles.header}>
                    <div className={`${styles.indicator} ${styles[mode]}`} />
                    <button
                        className={`${styles.tab} ${mode === 'expense' ? styles.active : ''}`}
                        onClick={() => setMode('expense')}
                    >
                        Gasto
                    </button>
                    <button
                        className={`${styles.tab} ${mode === 'income' ? styles.active : ''}`}
                        onClick={() => setMode('income')}
                    >
                        Ingreso
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.content}>
                    {/* Amount */}
                    <div className={styles.amountGroup}>
                        <span className={styles.label}>Monto</span>
                        <div className={styles.amountInputContainer}>
                            <span className={styles.currency}>$</span>
                            <input
                                type="number"
                                className={styles.amountInput}
                                placeholder="0"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className={styles.grid}>
                        {mode === 'expense' && (
                            <div className={styles.field}>
                                <label className={styles.label}>Categoría</label>
                                <select
                                    className={styles.select}
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className={mode === 'expense' ? styles.field : `${styles.field} ${styles.fullWidth}`}>
                            <label className={styles.label}>
                                {mode === 'expense' ? 'Método Pago' : 'Depositar en'}
                            </label>
                            <select
                                className={styles.select}
                                value={assetId}
                                onChange={e => setAssetId(e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                {assets.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={`${styles.field} ${styles.fullWidth}`}>
                            <label className={styles.label}>Nota</label>
                            <input
                                type="text"
                                className={styles.textInput}
                                placeholder="Descripción opcional..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.footer}>
                        <button type="button" className={styles.btnCancel} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                            <Check size={18} />
                            Confirmar {mode === 'expense' ? 'Gasto' : 'Ingreso'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
