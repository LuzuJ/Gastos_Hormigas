import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, DollarSign, AlertTriangle } from 'lucide-react';
import styles from './ExpenseForm.module.css';
import toast from 'react-hot-toast';
import type { Category, Expense, ExpenseFormData, SubCategory, PaymentSource, EnhancedExpense } from '../../../types';
import { BudgetProgressBar } from '../../features/financials/BudgetProgressBar/BudgetProgressBar';
import { Input } from '../../common';
import { expenseFormSchema } from '../../../schemas';
import { useDuplicateDetection } from '../../../hooks/expenses/useDuplicateDetection';
// DESHABILITADO: useFinancialAutomation fue movido a legacy-firebase
import { DuplicateWarning } from './DuplicateWarning';

import { formatCurrency } from '../../../utils/formatters';

interface ExpenseFormProps {
    onAdd: (data: Omit<ExpenseFormData, 'createdAt'>) => Promise<{ success: boolean; error?: string }>; // <-- CORRECCIÓN 1
    onAddSubCategory: (categoryId: string, subCategoryName: string) => Promise<void>;
    categories: Category[];
    expenses: Expense[];
    isSubmitting: boolean;
    paymentSources?: PaymentSource[]; // Nueva prop opcional
    userId?: string | null; // Para el sistema de automatización
    enableBalanceTracking?: boolean; // Habilitar tracking automático de saldos
}

const ADD_NEW_SUBCATEGORY_VALUE = '--add-new--';

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
    onAdd, 
    onAddSubCategory, 
    categories, 
    expenses, 
    isSubmitting, 
    paymentSources = [],
    userId = null,
    enableBalanceTracking = false
}) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [selectedPaymentSourceId, setSelectedPaymentSourceId] = useState('');
    const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);
    const [formError, setFormError] = useState('');
    const [showNewSubCategoryInput, setShowNewSubCategoryInput] = useState(false);
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [isOpen, setIsOpen] = useState(true); // Para el formulario plegable
    
    // Estados para detección de duplicados
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const [pendingExpenseData, setPendingExpenseData] = useState<any>(null);

    // Hook para automatización financiera - DESHABILITADO
    // El servicio fue movido a legacy-firebase y necesita reimplementación con Supabase
    // const {
    //     processExpenseWithBalance,
    //     paymentSourceBalances,
    //     refreshPaymentSourceBalance
    // } = useFinancialAutomation(userId);
    
    // Stubs temporales para mantener compatibilidad
    const paymentSourceBalances: any[] = [];
    const refreshPaymentSourceBalance = (_id: string) => {};
    const processExpenseWithBalance = async (_expense: any, _paymentSourceId: string) => ({ 
        success: true 
    });

    // Hook para detección de duplicados
    const duplicateDetection = useDuplicateDetection({
        expenses,
        newExpense: {
            description: description.trim(),
            amount: parseFloat(amount) || 0,
            categoryId: selectedCategoryId
        },
        timeWindowDays: 7, // Buscar duplicados en los últimos 7 días
        amountTolerance: 0.01 // Tolerancia de 1 centavo
    });

    // Función para obtener información de saldo de una fuente de pago
    const getPaymentSourceBalance = (paymentSourceId: string) => {
        const source = paymentSources.find(ps => ps.id === paymentSourceId);
        const balanceInfo = paymentSourceBalances.find(pb => pb.paymentSourceId === paymentSourceId);
        
        return {
            source,
            balance: balanceInfo?.currentBalance ?? source?.balance ?? 0,
            projectedBalance: balanceInfo?.projectedBalance ?? source?.balance ?? 0,
            hasBalance: balanceInfo || source?.balance !== undefined
        };
    };

    // Verificar si hay saldo suficiente
    const checkSufficientBalance = () => {
        if (!enableBalanceTracking || !selectedPaymentSourceId || !amount) {
            return { sufficient: true, message: '' };
        }

        const expenseAmount = parseFloat(amount);
        const { balance, hasBalance } = getPaymentSourceBalance(selectedPaymentSourceId);

        if (!hasBalance) {
            return { sufficient: true, message: 'Saldo no disponible' };
        }

        if (balance < expenseAmount) {
            return { 
                sufficient: false, 
                message: `Saldo insuficiente. Disponible: ${formatCurrency(balance)}, Requerido: ${formatCurrency(expenseAmount)}` 
            };
        }

        return { sufficient: true, message: '' };
    };

    const balanceCheck = checkSufficientBalance();

     useEffect(() => {
        if (categories.length > 0 && !selectedCategoryId) {
            const firstCategory = categories[0];
            setSelectedCategoryId(firstCategory.id);
            const subcategories = firstCategory.subcategories || [];
            setAvailableSubCategories(subcategories);
            
            if (subcategories.length > 0) {
                setSelectedSubCategory(subcategories[0].name);
                setShowNewSubCategoryInput(false);
            } else {
                setSelectedSubCategory(ADD_NEW_SUBCATEGORY_VALUE);
                setShowNewSubCategoryInput(true);
            }
        }
    }, [categories, selectedCategoryId]);

    // useEffect para inicializar fuente de pago por defecto
    useEffect(() => {
        if (paymentSources.length > 0 && !selectedPaymentSourceId) {
            // Buscar la primera fuente activa, preferiblemente efectivo o cuenta corriente
            const preferredSource = paymentSources.find(ps => 
                ps.isActive && (ps.type === 'cash' || ps.type === 'checking')
            ) || paymentSources.find(ps => ps.isActive);
            
            if (preferredSource) {
                setSelectedPaymentSourceId(preferredSource.id);
            }
        }
    }, [paymentSources, selectedPaymentSourceId]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategoryId = e.target.value;
        setSelectedCategoryId(newCategoryId);
        const category = categories.find(c => c.id === newCategoryId);
        const subcategories = category?.subcategories || [];
        
        setAvailableSubCategories(subcategories);
        
        if (subcategories.length > 0) {
            setSelectedSubCategory(subcategories[0].name);
            setShowNewSubCategoryInput(false);
        } else {
            setSelectedSubCategory(ADD_NEW_SUBCATEGORY_VALUE);
            setShowNewSubCategoryInput(true);
        }
    };

    const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedSubCategory(value);
        if (value === ADD_NEW_SUBCATEGORY_VALUE) {
            setShowNewSubCategoryInput(true);
        } else {
            setShowNewSubCategoryInput(false);
            setNewSubCategoryName('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(''); 

        let subCategoryToSave: string;

        if (showNewSubCategoryInput) {
            if (newSubCategoryName.trim().length < 2) {
                setFormError('El nombre de la nueva subcategoría es muy corto.');
                return;
            }
            await onAddSubCategory(selectedCategoryId, newSubCategoryName.trim());
            subCategoryToSave = newSubCategoryName.trim();
        } else {
            subCategoryToSave = selectedSubCategory;
        }

        const validationResult = expenseFormSchema.safeParse({
            description,
            amount,
            categoryId: selectedCategoryId,
            subCategory: subCategoryToSave,
            paymentSourceId: selectedPaymentSourceId || undefined
        });

        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0].message;
            setFormError(firstError);
            return;
        }

        // Verificar duplicados antes de proceder
        if (duplicateDetection.isDuplicate && duplicateDetection.confidence !== 'low') {
            // Guardar los datos para procesar después de la confirmación
            setPendingExpenseData(validationResult.data);
            setShowDuplicateWarning(true);
            return;
        }

        // Si no hay duplicados o es de baja confianza, proceder normalmente
        await submitExpense(validationResult.data);
    };

    // Función separada para enviar el gasto
    const submitExpense = async (expenseData: any) => {
        try {
            // Si está habilitado el tracking de balance y hay fuente de pago seleccionada
            if (enableBalanceTracking && selectedPaymentSourceId && userId) {
                // Crear el expense mejorado para el sistema de automatización
                const enhancedExpense: EnhancedExpense = {
                    id: '', // Se asignará automáticamente
                    description: expenseData.description,
                    amount: parseFloat(amount),
                    categoryId: expenseData.categoryId,
                    subCategory: expenseData.subCategory,
                    createdAt: new Date().toISOString(),
                    paymentSourceId: selectedPaymentSourceId,
                    isAutomatic: false
                };

                // Procesar el gasto con descuento automático de saldo
                const balanceResult = await processExpenseWithBalance(
                    enhancedExpense, 
                    selectedPaymentSourceId
                );

                if (!balanceResult.success) {
                    // Si falla el procesamiento de saldo, mostrar error pero permitir continuar
                    toast.error('Error procesando el saldo');
                    
                    // Preguntar al usuario si quiere continuar sin procesar el saldo
                    const continueAnyway = globalThis.confirm(
                        '¿Deseas registrar el gasto sin actualizar el saldo automáticamente?'
                    );
                    
                    if (!continueAnyway) {
                        return;
                    }
                }
            }

            // Procesar el gasto normalmente
            const result = await onAdd(expenseData);

            if (result.success) {
                toast.success(
                    enableBalanceTracking && selectedPaymentSourceId 
                        ? '¡Gasto añadido y saldo actualizado!' 
                        : '¡Gasto añadido con éxito!'
                );
                
                // Actualizar la proyección de saldo si está habilitado
                if (enableBalanceTracking && selectedPaymentSourceId) {
                    refreshPaymentSourceBalance(selectedPaymentSourceId);
                }
                
                resetForm();
            } else { 
                toast.error(result.error || 'Ocurrió un error inesperado.');
                setFormError(result.error || 'Ocurrió un error inesperado.'); 
            }
        } catch (error) {
            console.error('Error in submitExpense:', error);
            toast.error('Error procesando el gasto');
            setFormError('Error procesando el gasto');
        }
    };

    // Función para resetear el formulario
    const resetForm = () => {
        setDescription('');
        setAmount('');
        setFormError('');
        setNewSubCategoryName('');
        setShowNewSubCategoryInput(false);
        if (categories.length > 0) {
            const firstCategory = categories[0];
            setSelectedCategoryId(firstCategory.id);
            setAvailableSubCategories(firstCategory.subcategories);
            setSelectedSubCategory(firstCategory.subcategories[0]?.name || '');
        }
        // Resetear fuente de pago a la primera activa
        if (paymentSources.length > 0) {
            const preferredSource = paymentSources.find(ps => 
                ps.isActive && (ps.type === 'cash' || ps.type === 'checking')
            ) || paymentSources.find(ps => ps.isActive);
            
            if (preferredSource) {
                setSelectedPaymentSourceId(preferredSource.id);
            }
        }
    };

    // Handlers para la modal de duplicados
    const handleDuplicateConfirm = async () => {
        setShowDuplicateWarning(false);
        if (pendingExpenseData) {
            await submitExpense(pendingExpenseData);
            setPendingExpenseData(null);
        }
    };

    const handleDuplicateCancel = () => {
        setShowDuplicateWarning(false);
        setPendingExpenseData(null);
        // El formulario mantiene los datos para que el usuario pueda modificarlos
    };

    const handleDuplicateClose = () => {
        setShowDuplicateWarning(false);
        setPendingExpenseData(null);
    };
    
    const budgetInfo = useMemo(() => {
        if (!selectedCategoryId) return null;
        const category = categories.find(c => c.id === selectedCategoryId);
        if (!category || !category.budget) return null;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const spent = expenses
            .filter(e => {
                const expenseDate = e.createdAt ? new Date(e.createdAt) : null;
                return e.categoryId === selectedCategoryId &&
                       expenseDate &&
                       expenseDate.getMonth() === currentMonth &&
                       expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);
        return { budget: category.budget, spent };
    }, [selectedCategoryId, categories, expenses]);

    return (
        <div className={styles.card}>
            <button
                type="button"
                className={styles.title}
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                aria-expanded={isOpen}
            >
                <PlusCircle className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`} />
                <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>Añadir Gasto</span>
            </button>
            
            {isOpen && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroupDescription}>
                        <label htmlFor="description" className={styles.label}>Descripción</label>
                        <Input 
                            id="description" 
                            type="text" 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            placeholder="Ej: Café con leche" 
                        />
                    </div>
                    <div className={styles.formGroupAmount}>
                        <label htmlFor="amount" className={styles.label}>Monto ($)</label>
                        <Input 
                            id="amount" 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                            placeholder="0.00" 
                        />
                    </div>
                    <div className={styles.formGroupCategory}>
                        <label htmlFor="category" className={styles.label}>Categoría</label>
                        <select id="category" value={selectedCategoryId} onChange={handleCategoryChange} className={styles.select}>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroupSubCategory}>
                        <label htmlFor="subCategory" className={styles.label}>Subcategoría</label>
                        <select id="subCategory" value={selectedSubCategory} onChange={handleSubCategoryChange} className={styles.select}>
                            {availableSubCategories.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                            <option value={ADD_NEW_SUBCATEGORY_VALUE}>+ Crear nueva subcategoría...</option>
                        </select>
                    </div>
                    {showNewSubCategoryInput && (
                        <div className={styles.formGroupNewSubCategory}>
                            <label htmlFor="newSubCategory" className={styles.label}>Nombre de la Nueva Subcategoría</label>
                            <Input
                                id="newSubCategory"
                                type="text"
                                value={newSubCategoryName}
                                onChange={(e) => setNewSubCategoryName(e.target.value)}
                                placeholder="Ej: Comida para llevar"
                            />
                        </div>
                    )}
                    
                    {/* Botón temporal para limpiar duplicados */}
                    {userId && paymentSources.length > 4 && (
                        <div className={styles.formGroupCleanup}>
                            <button
                                type="button"
                                onClick={() => {
                                    // NOTA: Servicio de limpieza de duplicados deshabilitado
                                    // Supabase ahora maneja duplicados con constraints únicos en la base de datos
                                    toast('La limpieza automática de duplicados ya no es necesaria. Supabase previene duplicados automáticamente.', { icon: '✅' });
                                }}
                                className={styles.cleanupButton}
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                disabled
                            >
                                🧹 Limpiar Duplicados (No necesario con Supabase)
                            </button>
                        </div>
                    )}
                    
                    {/* Selector de fuente de pago */}
                    {paymentSources.length > 0 && (
                        <div className={styles.formGroupPaymentSource}>
                            <label htmlFor="paymentSource" className={styles.label}>
                                <DollarSign size={16} />
                                Fuente de Pago
                                {enableBalanceTracking && (
                                    <span className={styles.labelNote}>(Con tracking automático)</span>
                                )}
                            </label>
                            <select 
                                id="paymentSource" 
                                value={selectedPaymentSourceId} 
                                onChange={(e) => setSelectedPaymentSourceId(e.target.value)} 
                                className={`${styles.select} ${!balanceCheck.sufficient ? styles.selectError : ''}`}
                            >
                                <option value="">Seleccionar fuente...</option>
                                {paymentSources
                                    .filter(ps => ps.isActive)
                                    .map(ps => {
                                        const { balance, hasBalance } = getPaymentSourceBalance(ps.id);
                                        return (
                                            <option key={ps.id} value={ps.id}>
                                                {ps.icon} {ps.name}
                                                {hasBalance && ` (${formatCurrency(balance)})`}
                                            </option>
                                        );
                                    })
                                }
                            </select>
                            
                            {/* Información de saldo */}
                            {enableBalanceTracking && selectedPaymentSourceId && (
                                <div className={styles.balanceInfo}>
                                    {(() => {
                                        const { balance, projectedBalance, hasBalance } = getPaymentSourceBalance(selectedPaymentSourceId);
                                        if (!hasBalance) {
                                            return (
                                                <div className={styles.balanceWarning}>
                                                    <AlertTriangle size={14} />
                                                    Saldo no disponible
                                                </div>
                                            );
                                        }
                                        
                                        return (
                                            <div className={styles.balanceDetails}>
                                                <span className={styles.balanceItem}>
                                                    Disponible: {formatCurrency(balance)}
                                                </span>
                                                {Math.abs(projectedBalance - balance) > 0.01 && (
                                                    <span className={styles.balanceItem}>
                                                        Proyectado: {formatCurrency(projectedBalance)}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                            
                            {/* Alerta de saldo insuficiente */}
                            {!balanceCheck.sufficient && (
                                <div className={styles.balanceError}>
                                    <AlertTriangle size={16} />
                                    {balanceCheck.message}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {budgetInfo && (
                        <div className={`${styles.fullWidth} ${styles.budgetTracker}`}>
                            <label className={styles.label}>Progreso del Presupuesto para "{categories.find(c=>c.id === selectedCategoryId)?.name}"</label>
                            <BudgetProgressBar spent={budgetInfo.spent} budget={budgetInfo.budget} />
                        </div>
                    )}
                    <div className={styles.fullWidth}>
                       {formError && <p className={styles.error}>{formError}</p>}
                        <button type="submit" disabled={isSubmitting} className={styles.button}>
                            {isSubmitting ? 'Agregando...' : 'Agregar Gasto'}
                        </button>
                    </div>
                </form>
            )}

            {/* Modal de advertencia de duplicados */}
            <DuplicateWarning
                isVisible={showDuplicateWarning}
                confidence={duplicateDetection.confidence}
                message={duplicateDetection.message}
                duplicates={duplicateDetection.duplicates}
                onConfirm={handleDuplicateConfirm}
                onCancel={handleDuplicateCancel}
                onClose={handleDuplicateClose}
            />
        </div>
    );
};