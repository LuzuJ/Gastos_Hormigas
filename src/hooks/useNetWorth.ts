import { useState, useEffect, useCallback, useMemo } from 'react';
import { assetService } from '../services/assetService';
import { liabilityService } from '../services/liabilityService';
import { useLoadingState, handleAsyncOperation } from './useLoadingState';
import type { Asset, Liability, AssetFormData, LiabilityFormData } from '../types';

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

            const unsubscribeAssets = assetService.onAssetsUpdate(userId, (data) => {
                setAssets(data);
                stopLoading();
            });

            const unsubscribeLiabilities = liabilityService.onLiabilitiesUpdate(userId, (data) => {
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
    const totalLiabilities = useMemo(() => liabilities.reduce((sum, liability) => sum + liability.amount, 0), [liabilities]);
    const netWorth = useMemo(() => totalAssets - totalLiabilities, [totalAssets, totalLiabilities]);

    const addAsset = useCallback(async (data: AssetFormData) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => assetService.addAsset(userId, data),
            'Error al agregar el activo'
        );
    }, [userId]);

    const updateAsset = useCallback(async (id: string, data: Partial<AssetFormData>) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => assetService.updateAsset(userId, id, data),
            'Error al actualizar el activo'
        );
    }, [userId]);

    const deleteAsset = useCallback(async (id: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => assetService.deleteAsset(userId, id),
            'Error al eliminar el activo'
        );
    }, [userId]);

    const addLiability = useCallback(async (data: LiabilityFormData) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => liabilityService.addLiability(userId, data),
            'Error al agregar el pasivo'
        );
    }, [userId]);

    const updateLiability = useCallback(async (id: string, data: Partial<LiabilityFormData>) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => liabilityService.updateLiability(userId, id, data),
            'Error al actualizar el pasivo'
        );
    }, [userId]);

    const deleteLiability = useCallback(async (id: string) => {
        if (!userId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        return await handleAsyncOperation(
            () => liabilityService.deleteLiability(userId, id),
            'Error al eliminar el pasivo'
        );
    }, [userId]);

    // Funciones adicionales para análisis básico de deudas
    const getTotalMonthlyDebtPayments = useMemo(() => {
        return liabilities.reduce((total, liability) => {
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