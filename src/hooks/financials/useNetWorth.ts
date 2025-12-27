import { useState, useEffect, useCallback, useMemo } from 'react';
import { AssetServiceRepo } from '../../services/assetServiceRepo';
import { LiabilityServiceRepo } from '../../services/liabilityServiceRepo';
import { useLoadingState, handleAsyncOperation } from '../context/useLoadingState';
import type { Asset, Liability, AssetFormData, LiabilityFormData } from '../../types';

// Crear instancias de los servicios repositorio
const assetServiceRepo = new AssetServiceRepo();
const liabilityServiceRepo = new LiabilityServiceRepo();

export const useNetWorth = (userId: string | null) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [liabilities, setLiabilities] = useState<Liability[]>([]);
    const { 
        loading: loadingNetWorth, 
        error: netWorthError, 
        startLoading, 
        stopLoading, 
        clearError 
    } = useLoadingState(true);

    useEffect(() => {
        if (!userId) {
            setAssets([]);
            setLiabilities([]);
            stopLoading();
            return;
        }

        try {
            startLoading();
            clearError();

            const unsubscribeAssets = assetServiceRepo.subscribeToAssets(userId, (data: Asset[]) => {
                setAssets(data);
                stopLoading();
            });

            const unsubscribeLiabilities = liabilityServiceRepo.subscribeToLiabilities(userId, (data: Liability[]) => {
                setLiabilities(data);
                stopLoading();
            });

            return () => {
                unsubscribeAssets();
                unsubscribeLiabilities();
            };
        } catch (error) {
            console.error('Error en useNetWorth:', error);
            stopLoading();
            setAssets([]);
            setLiabilities([]);
        }
    }, [userId, startLoading, stopLoading, clearError]);

    const totalAssets = useMemo(() => assets.reduce((sum, asset) => sum + asset.value, 0), [assets]);
    const totalLiabilities = useMemo(() => 
        liabilities.filter(liability => !liability.isArchived).reduce((sum, liability) => sum + liability.amount, 0), 
        [liabilities]
    );
    const netWorth = useMemo(() => totalAssets - totalLiabilities, [totalAssets, totalLiabilities]);

    const addAsset = useCallback(async (data: AssetFormData) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        const result = await handleAsyncOperation(
            () => assetServiceRepo.addAsset(userId, data),
            'Error al agregar el activo'
        );

        // Forzar refresh manual después de agregar (fallback para Realtime)
        if (result.success) {
            console.log('[useNetWorth] 🔄 Refreshing assets after add...');
            const updatedAssets = await assetServiceRepo.getAssets(userId);
            setAssets(updatedAssets);
        }

        return result;
    }, [userId]);

    const updateAsset = useCallback(async (id: string, data: Partial<AssetFormData>) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        const result = await handleAsyncOperation(
            () => assetServiceRepo.updateAsset(userId, id, data),
            'Error al actualizar el activo'
        );

        // Forzar refresh manual después de actualizar (fallback para Realtime)
        if (result.success) {
            console.log('[useNetWorth] 🔄 Refreshing assets after update...');
            const updatedAssets = await assetServiceRepo.getAssets(userId);
            setAssets(updatedAssets);
        }

        return result;
    }, [userId]);

    const deleteAsset = useCallback(async (id: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        const result = await handleAsyncOperation(
            () => assetServiceRepo.deleteAsset(userId, id),
            'Error al eliminar el activo'
        );

        // Forzar refresh manual después de eliminar (fallback para Realtime)
        if (result.success) {
            console.log('[useNetWorth] 🔄 Refreshing assets after delete...');
            const updatedAssets = await assetServiceRepo.getAssets(userId);
            setAssets(updatedAssets);
        }

        return result;
    }, [userId]);

    const addLiability = useCallback(async (data: LiabilityFormData) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        const result = await handleAsyncOperation(
            () => liabilityServiceRepo.addLiability(userId, data),
            'Error al agregar el pasivo'
        );

        // Forzar refresh manual después de agregar (fallback para Realtime)
        if (result.success) {
            console.log('[useNetWorth] 🔄 Refreshing liabilities after add...');
            const updatedLiabilities = await liabilityServiceRepo.getLiabilities(userId);
            setLiabilities(updatedLiabilities);
        }

        return result;
    }, [userId]);

    const updateLiability = useCallback(async (id: string, data: Partial<LiabilityFormData>) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        const result = await handleAsyncOperation(
            () => liabilityServiceRepo.updateLiability(userId, id, data),
            'Error al actualizar el pasivo'
        );

        // Forzar refresh manual después de actualizar (fallback para Realtime)
        if (result.success) {
            console.log('[useNetWorth] 🔄 Refreshing liabilities after update...');
            const updatedLiabilities = await liabilityServiceRepo.getLiabilities(userId);
            setLiabilities(updatedLiabilities);
        }

        return result;
    }, [userId]);

    const deleteLiability = useCallback(async (id: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        const result = await handleAsyncOperation(
            () => liabilityServiceRepo.deleteLiability(userId, id),
            'Error al eliminar el pasivo'
        );

        // Forzar refresh manual después de eliminar (fallback para Realtime)
        if (result.success) {
            console.log('[useNetWorth] 🔄 Refreshing liabilities after delete...');
            const updatedLiabilities = await liabilityServiceRepo.getLiabilities(userId);
            setLiabilities(updatedLiabilities);
        }

        return result;
    }, [userId]);

    // Funciones adicionales para análisis básico de deudas
    const getTotalMonthlyDebtPayments = useMemo(() => {
        return liabilities
            .filter(liability => !liability.isArchived)
            .reduce((total, liability) => {
                return total + (liability.monthlyPayment || 0);
            }, 0);
    }, [liabilities]);

    return {
        assets,
        liabilities,
        loadingNetWorth,
        netWorthError,
        clearNetWorthError: clearError,
        totalAssets,
        totalLiabilities,
        netWorth,
        addAsset,
        updateAsset,
        deleteAsset,
        addLiability,
        updateLiability,
        deleteLiability,
        getTotalMonthlyDebtPayments
    };
};