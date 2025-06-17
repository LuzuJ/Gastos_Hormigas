import React, { useState } from 'react';
import { useExpensesController } from '../hooks/useExpensesController';
import { Trash2, PlusSquare, Lock } from 'lucide-react';
import styles from './ManageCategoriesPage.module.css'; 

interface ManageCategoriesPageProps {
  userId: string | null;
}

export const ManageCategoriesPage: React.FC<ManageCategoriesPageProps> = ({ userId }) => {
    // Usamos el hook que ya tiene toda la lógica para las categorías
    const { categories, addCategory, deleteCategory, error } = useExpensesController(userId);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            addCategory(newCategoryName);
            setNewCategoryName(''); // Limpiar el input después de añadir
        }
    };
    
    // Separamos las categorías en dos listas para la UI
    const defaultCats = categories.filter(c => c.isDefault);
    const customCats = categories.filter(c => !c.isDefault);

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>
                <PlusSquare size={24} className={styles.icon}/>
                Gestionar Mis Categorías
            </h2>
            <p className={styles.subtitle}>
                Añade categorías personalizadas para organizar mejor tus gastos.
            </p>

            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nombre de la nueva categoría"
                    className={styles.input}
                />
                <button type="submit" className={styles.button}>Añadir</button>
            </form>

            {/* Mostramos primero las categorías por defecto */}
            <h3 className={styles.listTitle}>Categorías por Defecto</h3>
            <ul className={styles.list}>
                {defaultCats.map(cat => (
                    <li key={cat.id} className={`${styles.listItem} ${styles.defaultItem}`}>
                        <span>{cat.name}</span>
                        <Lock size={16} aria-label="Categoría por defecto, no se puede eliminar" />
                    </li>
                ))}
            </ul>

            {/* Luego las personalizadas, con opción de eliminar */}
            <h3 className={styles.listTitle}>Tus Categorías Personalizadas</h3>
            <ul className={styles.list}>
                {customCats.length > 0 ? (
                    customCats.map(cat => (
                        <li key={cat.id} className={styles.listItem}>
                            <span>{cat.name}</span>
                            <button onClick={() => deleteCategory(cat.id)} className={styles.deleteButton} aria-label="Eliminar categoría">
                                <Trash2 size={18} />
                            </button>
                        </li>
                    ))
                ) : (
                    <p className={styles.emptyMessage}>Aún no has añadido ninguna categoría personalizada.</p>
                )}
            </ul>
        </div>
    );
};
