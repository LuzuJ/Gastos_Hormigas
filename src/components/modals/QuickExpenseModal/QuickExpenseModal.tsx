import React, { useState, useEffect } from 'react';
import { DollarSign, Tag, Calendar, CreditCard } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../common/Input/Input';
import { useCategoriesContext, useExpensesContext, useNetWorthContext } from '../../../contexts/AppContext';
import { formatCurrency } from '../../../utils/formatters';
import toast from 'react-hot-toast';
import styles from './QuickExpenseModal.module.css';

interface QuickExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({ isOpen, onClose }) => {
    const { categories } = useCategoriesContext();
    const { addExpense } = useExpensesContext();
    const { assets } = useNetWorthContext();

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [assetId, setAssetId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Set defaults when modal opens
    useEffect(() => {
        if (isOpen) {
            if (categories.length > 0 && !categoryId) {
                setCategoryId(categories[0].id);
                if (categories[0].subcategories?.length > 0) {
                    setSubCategory(categories[0].subcategories[0].name);
                }
            }
            if (assets.length > 0 && !assetId) {
                const defaultAsset = assets.find(a => a.type === 'cash') || assets[0];
                setAssetId(defaultAsset.id);
            }
        }
    }, [isOpen, categories, assets, categoryId, assetId]);

    // Update subcategory when category changes
    useEffect(() => {
        if (categoryId) {
            const category = categories.find(c => c.id === categoryId);
            if (category && category.subcategories && category.subcategories.length > 0) {
                setSubCategory(category.subcategories[0].name);
            } else {
                setSubCategory('General');
            }
        }
    }, [categoryId, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !categoryId) {
            toast.error('Completa el monto y la categoría');
            return;
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error('El monto debe ser mayor a 0');
            return;
        }

        setIsSubmitting(true);

        try {
            const selectedCat = categories.find(c => c.id === categoryId);
            const finalDescription = description.trim() || selectedCat?.name || 'Gasto General';

            await addExpense({
                description: finalDescription,
                amount: parsedAmount,
                categoryId,
                subCategory: subCategory || 'General',
                createdAt: new Date().toISOString()
            });

            toast.success('💸 Gasto registrado');
            resetForm();
            onClose();
        } catch (error) {
            console.error('Error adding expense:', error);
            toast.error('Error al registrar el gasto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setDescription('');
        setAmount('');
        setCategoryId(categories[0]?.id || '');
        setSubCategory('');
        setAssetId('');
    };

    const selectedCategory = categories.find(c => c.id === categoryId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="💸 Gasto Rápido"
            size="medium"
        >
            <form onSubmit={handleSubmit} className={styles.form}>

                {/* 1. Monto (Prioridad Alta) */}
                <div className={styles.amountGroup}>
                    <label className={styles.label}>
                        <DollarSign size={14} />
                        Monto
                    </label>
                    <Input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                        autoFocus
                        className={styles.amountInput}
                    />
                </div>

                {/* 2. Categoría y Subcategoría */}
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <Tag size={14} />
                            Categoría
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className={styles.select}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Subcategoría</label>
                            <select
                                value={subCategory}
                                onChange={(e) => setSubCategory(e.target.value)}
                                className={styles.select}
                            >
                                {selectedCategory.subcategories.map(sub => (
                                    <option key={sub.id} value={sub.name}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* 3. Descripción (Opcional) */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        <Tag size={14} />
                        Descripción <span className={styles.optional}>(Opcional)</span>
                    </label>
                    <Input
                        type="text"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                        placeholder={selectedCategory?.name || "Descripción del gasto"}
                    />
                </div>

                {/* 4. Método de Pago (Activo) */}
                {assets.length > 0 && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <CreditCard size={14} />
                            Descontar de
                        </label>
                        <select
                            value={assetId}
                            onChange={(e) => setAssetId(e.target.value)}
                            className={styles.select}
                        >
                            <option value="">Sin descontar</option>
                            {assets.map(asset => (
                                <option key={asset.id} value={asset.id}>
                                    {asset.name} - {formatCurrency(asset.value)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.cancelButton}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Guardando...' : 'Registrar Gasto'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
