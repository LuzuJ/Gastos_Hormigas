import { supabase } from '../../config/supabase';
import type { Category, SubCategory } from '../../types';
import { defaultCategoriesStructure } from '../../constants';
import type { RealtimeChannel } from '@supabase/supabase-js';

// --- Objeto del Servicio ---

export const categoryService = {
    /**
     * Crea las categorías por defecto para un usuario nuevo si no tiene ninguna.
     */
    initializeDefaultCategories: async (userId: string): Promise<boolean> => {
        try {
            // Verificar si ya existen categorías para este usuario
            const { data: existingCategories, error: checkError } = await supabase
                .from('categories')
                .select('id')
                .eq('user_id', userId)
                .limit(1);

            if (checkError) {
                throw checkError;
            }

            if (!existingCategories || existingCategories.length === 0) {
                // Insertar categorías por defecto
                for (const category of defaultCategoriesStructure) {
                    const { data: categoryData, error: categoryError } = await supabase
                        .from('categories')
                        .insert({
                            user_id: userId,
                            name: category.name,
                            icon: category.icon,
                            color: category.color,
                            is_default: true
                        })
                        .select()
                        .single();

                    if (categoryError) {
                        throw categoryError;
                    }

                    // Insertar subcategorías
                    if (categoryData && category.subcategories.length > 0) {
                        const subcategoryData = category.subcategories.map(subName => ({
                            category_id: categoryData.id,
                            name: subName
                        }));

                        const { error: subError } = await supabase
                            .from('subcategories')
                            .insert(subcategoryData);

                        if (subError) {
                            throw subError;
                        }
                    }
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al inicializar categorías por defecto:', error);
            throw error;
        }
    },

    /**
     * Obtiene todas las categorías de un usuario con sus subcategorías.
     */
    getCategories: async (userId: string): Promise<Category[]> => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select(`
                    id,
                    name,
                    icon,
                    color,
                    is_default,
                    budget,
                    subcategories (
                        id,
                        name
                    )
                `)
                .eq('user_id', userId)
                .order('name');

            if (error) {
                throw error;
            }

            return data?.map(category => ({
                id: category.id,
                name: category.name,
                icon: category.icon,
                color: category.color,
                isDefault: category.is_default,
                budget: category.budget,
                subcategories: category.subcategories || []
            })) || [];
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return [];
        }
    },

    /**
     * Se suscribe a los cambios en las categorías de un usuario en tiempo real.
     */
    onCategoriesUpdate: (userId: string, callback: (data: Category[]) => void): (() => void) => {
        let channel: RealtimeChannel;

        const setupSubscription = async () => {
            // Obtener datos iniciales
            const initialData = await categoryService.getCategories(userId);
            callback(initialData);

            // Configurar suscripción en tiempo real
            channel = supabase
                .channel(`categories_${userId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'categories',
                        filter: `user_id=eq.${userId}`
                    },
                    async () => {
                        // Cuando hay cambios, recargar todas las categorías
                        const updatedData = await categoryService.getCategories(userId);
                        callback(updatedData);
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'subcategories'
                    },
                    async () => {
                        // También escuchar cambios en subcategorías
                        const updatedData = await categoryService.getCategories(userId);
                        callback(updatedData);
                    }
                )
                .subscribe();
        };

        setupSubscription();

        // Retornar función para desuscribirse
        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    },

    /**
     * Añade una nueva categoría para un usuario.
     */
    addCategory: async (userId: string, categoryName: string, icon: string = 'Tag', color: string = '#607D8B') => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert({
                    user_id: userId,
                    name: categoryName,
                    is_default: false,
                    icon,
                    color
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error al añadir categoría:', error);
            throw error;
        }
    },

    /**
     * Elimina una categoría por su ID.
     */
    deleteCategory: async (userId: string, categoryId: string) => {
        try {
            // Primero eliminar las subcategorías (cascade debería manejarlas automáticamente)
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryId)
                .eq('user_id', userId);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            throw error;
        }
    },

    /**
     * Añade una nueva subcategoría a una categoría existente.
     */
    addSubCategory: async (userId: string, categoryId: string, subCategoryName: string) => {
        try {
            // Verificar que la categoría pertenece al usuario
            const { data: category, error: checkError } = await supabase
                .from('categories')
                .select('id')
                .eq('id', categoryId)
                .eq('user_id', userId)
                .single();

            if (checkError || !category) {
                throw new Error('Categoría no encontrada o no pertenece al usuario');
            }

            const { data, error } = await supabase
                .from('subcategories')
                .insert({
                    category_id: categoryId,
                    name: subCategoryName
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error al añadir subcategoría:', error);
            throw error;
        }
    },

    /**
     * Elimina una subcategoría.
     */
    deleteSubCategory: async (userId: string, categoryId: string, subCategoryId: string) => {
        try {
            // Verificar que la categoría pertenece al usuario
            const { data: category, error: checkError } = await supabase
                .from('categories')
                .select('id')
                .eq('id', categoryId)
                .eq('user_id', userId)
                .single();

            if (checkError || !category) {
                throw new Error('Categoría no encontrada o no pertenece al usuario');
            }

            const { error } = await supabase
                .from('subcategories')
                .delete()
                .eq('id', subCategoryId)
                .eq('category_id', categoryId);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error al eliminar subcategoría:', error);
            throw error;
        }
    },

    /**
     * Actualiza el presupuesto de una categoría.
     */
    updateCategoryBudget: async (userId: string, categoryId: string, budget: number) => {
        try {
            const { error } = await supabase
                .from('categories')
                .update({ budget })
                .eq('id', categoryId)
                .eq('user_id', userId);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error al actualizar presupuesto de categoría:', error);
            throw error;
        }
    },

    /**
     * Actualiza el estilo (icono y color) de una categoría.
     */
    updateCategoryStyle: async (userId: string, categoryId: string, style: { icon: string; color: string }) => {
        try {
            const { error } = await supabase
                .from('categories')
                .update({
                    icon: style.icon,
                    color: style.color
                })
                .eq('id', categoryId)
                .eq('user_id', userId);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error al actualizar estilo de categoría:', error);
            throw error;
        }
    },

    /**
     * Obtiene una categoría específica con sus subcategorías.
     */
    getCategory: async (userId: string, categoryId: string): Promise<Category | null> => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select(`
                    id,
                    name,
                    icon,
                    color,
                    is_default,
                    budget,
                    subcategories (
                        id,
                        name
                    )
                `)
                .eq('id', categoryId)
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    return null;
                }
                throw error;
            }

            return {
                id: data.id,
                name: data.name,
                icon: data.icon,
                color: data.color,
                isDefault: data.is_default,
                budget: data.budget,
                subcategories: data.subcategories || []
            };
        } catch (error) {
            console.error('Error al obtener categoría específica:', error);
            return null;
        }
    }
};
