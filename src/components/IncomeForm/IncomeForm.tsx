import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import styles from './IncomeForm.module.css';
import { Input } from '../common';

interface IncomeFormProps {
    currentIncome: number;
    onSetIncome: (income: number) => Promise<void>;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ currentIncome, onSetIncome }) => {
    const [income, setIncome] = useState(currentIncome.toString());
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setIncome(currentIncome.toString());
    }, [currentIncome]);

    const handleSave = async () => {
        const newIncome = parseFloat(income);
        if (!isNaN(newIncome)) {
            await onSetIncome(newIncome);
            setIsEditing(false);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <DollarSign className={styles.icon} />
                <h3>Ingreso Mensual</h3>
            </div>
            {isEditing ? (
                <div className={styles.form}>
                    <Input
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        placeholder="0.00"
                    />
                    <button onClick={handleSave} className={styles.button}>Guardar</button>
                    <button onClick={() => setIsEditing(false)} className={`${styles.button} ${styles.cancelButton}`}>Cancelar</button>
                </div>
            ) : (
                <div className={styles.display}>
                    <p className={styles.incomeValue}>${currentIncome.toFixed(2)}</p>
                    <button onClick={() => setIsEditing(true)} className={styles.editButton}>Establecer o Editar</button>
                </div>
            )}
        </div>
    );
};
