import { useState, useEffect, useCallback, useMemo } from 'react';
import { assetService } from '../services/assetService';
import { liabilityService } from '../services/liabilityService';
import type { Asset, Liability, AssetFormData, LiabilityFormData } from '../types';

export const useNetWorth = (userId: string | null) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [liabilities, setLiabilities] = useState<Liability[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setAssets([]);
            setLiabilities([]);
            setLoading(false);
            return;
        }

        const unsubscribeAssets = assetService.onAssetsUpdate(userId, (data) => {
            setAssets(data);
            setLoading(false);
        });

        const unsubscribeLiabilities = liabilityService.onLiabilitiesUpdate(userId, (data) => {
            setLiabilities(data);
            setLoading(false);
        });

        return () => {
            unsubscribeAssets();
            unsubscribeLiabilities();
        };
    }, [userId]);

    const totalAssets = useMemo(() => assets.reduce((sum, asset) => sum + asset.value, 0), [assets]);
    const totalLiabilities = useMemo(() => liabilities.reduce((sum, liability) => sum + liability.amount, 0), [liabilities]);
    const netWorth = useMemo(() => totalAssets - totalLiabilities, [totalAssets, totalLiabilities]);

    const addAsset = useCallback((data: AssetFormData) => assetService.addAsset(userId!, data), [userId]);
    const deleteAsset = useCallback((id: string) => assetService.deleteAsset(userId!, id), [userId]);
    const addLiability = useCallback((data: LiabilityFormData) => liabilityService.addLiability(userId!, data), [userId]);
    const deleteLiability = useCallback((id: string) => liabilityService.deleteLiability(userId!, id), [userId]);

    return {
        assets,
        liabilities,
        loadingNetWorth: loading,
        totalAssets,
        totalLiabilities,
        netWorth,
        addAsset,
        deleteAsset,
        addLiability,
        deleteLiability,
    };
};