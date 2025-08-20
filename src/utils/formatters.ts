// Currency and date formatting utilities
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
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
