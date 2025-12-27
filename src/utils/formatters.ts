// Currency and date formatting utilities
import type { UserProfile } from '../types';

// Currency configuration map
const CURRENCY_CONFIG: Record<UserProfile['currency'], { locale: string; currency: string }> = {
  USD: { locale: 'en-US', currency: 'USD' },
  EUR: { locale: 'es-ES', currency: 'EUR' },
  MXN: { locale: 'es-MX', currency: 'MXN' },
  COP: { locale: 'es-CO', currency: 'COP' },
  ARS: { locale: 'es-AR', currency: 'ARS' },
  CLP: { locale: 'es-CL', currency: 'CLP' },
  PEN: { locale: 'es-PE', currency: 'PEN' },
};

// Default currency - can be overridden
let defaultCurrency: UserProfile['currency'] = 'USD';

/**
 * Set the default currency for the application
 * Call this when the user profile loads
 */
export const setDefaultCurrency = (currency: UserProfile['currency']) => {
  defaultCurrency = currency;
};

/**
 * Get the current default currency
 */
export const getDefaultCurrency = (): UserProfile['currency'] => {
  return defaultCurrency;
};

/**
 * Format a number as currency
 * @param value - The number to format
 * @param currency - Optional currency override (defaults to user preference)
 */
export const formatCurrency = (value: number, currency?: UserProfile['currency']): string => {
  const curr = currency || defaultCurrency;
  const config = CURRENCY_CONFIG[curr] || CURRENCY_CONFIG.USD;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Get currency symbol for a given currency
 */
export const getCurrencySymbol = (currency?: UserProfile['currency']): string => {
  const curr = currency || defaultCurrency;
  const config = CURRENCY_CONFIG[curr] || CURRENCY_CONFIG.USD;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency
  }).format(0).replace(/[\d\s.,]/g, '').trim();
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

export const formatMonth = (date: Date): string => {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long'
  }).format(date);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value / 100);
};

// Number formatting
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-MX').format(value);
};

// Time calculations
export const getMonthsDifference = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Currency validation
export const isValidCurrency = (value: string | number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= 0;
};

export const parseCurrency = (value: string): number => {
  // Remove currency symbols and parse
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

// Currency options for UI selects
export const CURRENCY_OPTIONS: { value: UserProfile['currency']; label: string }[] = [
  { value: 'USD', label: 'Dólar Estadounidense ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'MXN', label: 'Peso Mexicano ($)' },
  { value: 'COP', label: 'Peso Colombiano ($)' },
  { value: 'ARS', label: 'Peso Argentino ($)' },
  { value: 'CLP', label: 'Peso Chileno ($)' },
  { value: 'PEN', label: 'Sol Peruano (S/)' },
];
