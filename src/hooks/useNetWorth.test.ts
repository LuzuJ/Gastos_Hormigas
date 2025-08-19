import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNetWorth } from './useNetWorth';
import { assetService } from '../services/assetService';
import { liabilityService } from '../services/liabilityService';
import type { Asset, Liability } from '../types';

// Mock de los servicios
vi.mock('../services/assetService');
vi.mock('../services/liabilityService');

// Mock del hook useDebtPayments
vi.mock('./useDebtPayments', () => ({
  useDebtPayments: vi.fn(() => ({
    debtPayments: [],
    loadingPayments: false,
    paymentsError: null,
    clearPaymentsError: vi.fn(),
    addDebtPayment: vi.fn(),
    deleteDebtPayment: vi.fn(),
    makeDebtPayment: vi.fn(),
    getPaymentsForLiability: vi.fn(() => []),
    getTotalPaidForLiability: vi.fn(() => 0),
    getPaymentProgress: vi.fn(() => ({
      totalPaid: 0,
      remainingAmount: 0,
      progressPercentage: 0,
      originalAmount: 0
    }))
  }))
}));

const mockAssets: Asset[] = [
  { id: '1', name: 'Cuenta Ahorros', value: 5000, type: 'cash' },
  { id: '2', name: 'Inversiones', value: 10000, type: 'investment' },
];

const mockLiabilities: Liability[] = [
  { id: '1', name: 'Préstamo Auto', amount: 8000, type: 'loan' },
  { id: '2', name: 'Tarjeta Crédito', amount: 2000, type: 'credit_card' },
];

describe('Hook useNetWorth', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock por defecto para evitar errores
    vi.mocked(assetService.onAssetsUpdate).mockReturnValue(() => {});
    vi.mocked(liabilityService.onLiabilitiesUpdate).mockReturnValue(() => {});
  });

  it('debería inicializar con arrays vacíos y loading true', () => {
    const { result } = renderHook(() => useNetWorth('test-user'));

    expect(result.current.assets).toEqual([]);
    expect(result.current.liabilities).toEqual([]);
    expect(result.current.loadingNetWorth).toBe(true);
    expect(result.current.totalAssets).toBe(0);
    expect(result.current.totalLiabilities).toBe(0);
    expect(result.current.netWorth).toBe(0);
  });

  it('debería manejar userId null correctamente', () => {
    const { result } = renderHook(() => useNetWorth(null));

    expect(result.current.assets).toEqual([]);
    expect(result.current.liabilities).toEqual([]);
    expect(result.current.loadingNetWorth).toBe(false);
  });

  it('debería suscribirse a actualizaciones de activos y pasivos', () => {
    renderHook(() => useNetWorth('test-user'));

    expect(assetService.onAssetsUpdate).toHaveBeenCalledWith(
      'test-user',
      expect.any(Function)
    );
    expect(liabilityService.onLiabilitiesUpdate).toHaveBeenCalledWith(
      'test-user', 
      expect.any(Function)
    );
  });

  it('debería actualizar activos cuando se reciben datos', async () => {
    vi.mocked(assetService.onAssetsUpdate).mockImplementation((userId, callback) => {
      callback(mockAssets);
      return () => {};
    });

    const { result } = renderHook(() => useNetWorth('test-user'));

    await waitFor(() => {
      expect(result.current.assets).toEqual(mockAssets);
      expect(result.current.loadingNetWorth).toBe(false);
    });
  });

  it('debería actualizar pasivos cuando se reciben datos', async () => {
    vi.mocked(liabilityService.onLiabilitiesUpdate).mockImplementation((userId, callback) => {
      callback(mockLiabilities);
      return () => {};
    });

    const { result } = renderHook(() => useNetWorth('test-user'));

    await waitFor(() => {
      expect(result.current.liabilities).toEqual(mockLiabilities);
      expect(result.current.loadingNetWorth).toBe(false);
    });
  });

  it('debería calcular el total de activos correctamente', async () => {
    vi.mocked(assetService.onAssetsUpdate).mockImplementation((userId, callback) => {
      callback(mockAssets);
      return () => {};
    });

    const { result } = renderHook(() => useNetWorth('test-user'));

    await waitFor(() => {
      expect(result.current.totalAssets).toBe(15000); // 5000 + 10000
    });
  });

  it('debería calcular el total de pasivos correctamente', async () => {
    vi.mocked(liabilityService.onLiabilitiesUpdate).mockImplementation((userId, callback) => {
      callback(mockLiabilities);
      return () => {};
    });

    const { result } = renderHook(() => useNetWorth('test-user'));

    await waitFor(() => {
      expect(result.current.totalLiabilities).toBe(10000); // 8000 + 2000
    });
  });

  it('debería calcular el patrimonio neto correctamente', async () => {
    vi.mocked(assetService.onAssetsUpdate).mockImplementation((userId, callback) => {
      callback(mockAssets);
      return () => {};
    });

    vi.mocked(liabilityService.onLiabilitiesUpdate).mockImplementation((userId, callback) => {
      callback(mockLiabilities);
      return () => {};
    });

    const { result } = renderHook(() => useNetWorth('test-user'));

    await waitFor(() => {
      expect(result.current.netWorth).toBe(5000); // 15000 - 10000
    });
  });

  it('debería llamar a addAsset con los datos correctos', async () => {
    const { result } = renderHook(() => useNetWorth('test-user'));

    const newAsset = { name: 'Nuevo Activo', value: 3000, type: 'cash' as const };

    await act(async () => {
      result.current.addAsset(newAsset);
    });

    expect(assetService.addAsset).toHaveBeenCalledWith('test-user', newAsset);
  });

  it('debería llamar a deleteAsset con el ID correcto', async () => {
    const { result } = renderHook(() => useNetWorth('test-user'));

    await act(async () => {
      result.current.deleteAsset('asset-123');
    });

    expect(assetService.deleteAsset).toHaveBeenCalledWith('test-user', 'asset-123');
  });

  it('debería llamar a addLiability con los datos correctos', async () => {
    const { result } = renderHook(() => useNetWorth('test-user'));

    const newLiability = { name: 'Nuevo Pasivo', amount: 1500, type: 'credit_card' as const };

    await act(async () => {
      result.current.addLiability(newLiability);
    });

    expect(liabilityService.addLiability).toHaveBeenCalledWith('test-user', newLiability);
  });

  it('debería llamar a deleteLiability con el ID correcto', async () => {
    const { result } = renderHook(() => useNetWorth('test-user'));

    await act(async () => {
      result.current.deleteLiability('liability-456');
    });

    expect(liabilityService.deleteLiability).toHaveBeenCalledWith('test-user', 'liability-456');
  });

  it('debería limpiar las suscripciones al desmontar', () => {
    const unsubscribeAssets = vi.fn();
    const unsubscribeLiabilities = vi.fn();

    vi.mocked(assetService.onAssetsUpdate).mockReturnValue(unsubscribeAssets);
    vi.mocked(liabilityService.onLiabilitiesUpdate).mockReturnValue(unsubscribeLiabilities);

    const { unmount } = renderHook(() => useNetWorth('test-user'));

    unmount();

    expect(unsubscribeAssets).toHaveBeenCalled();
    expect(unsubscribeLiabilities).toHaveBeenCalled();
  });

  it('debería limpiar las suscripciones al cambiar userId', () => {
    const unsubscribeAssets = vi.fn();
    const unsubscribeLiabilities = vi.fn();

    vi.mocked(assetService.onAssetsUpdate).mockReturnValue(unsubscribeAssets);
    vi.mocked(liabilityService.onLiabilitiesUpdate).mockReturnValue(unsubscribeLiabilities);

    const { rerender } = renderHook(
      ({ userId }) => useNetWorth(userId),
      { initialProps: { userId: 'user-1' } }
    );

    rerender({ userId: 'user-2' });

    expect(unsubscribeAssets).toHaveBeenCalled();
    expect(unsubscribeLiabilities).toHaveBeenCalled();
  });
});
