// Componentes comunes reutilizables
export { Button } from './Button/Button';
export type { ButtonProps } from './Button/Button';

export { ProgressBar } from './ProgressBar/ProgressBar';
export type { ProgressBarProps } from './ProgressBar/ProgressBar';

export { Card } from './Card/Card';
export type { CardProps } from './Card/Card';

export { Input } from './Input/Input';
export type { InputProps } from './Input/Input';

// Componentes de lazy loading para optimización de performance
export { LazyRoute, createLazyRoute, usePreloadRoute } from './LazyRoute/LazyRoute';
export { LazyChart, usePreloadCharts } from './LazyChart/LazyChart';

// Re-exportar utilities para fácil acceso
export * from '../../utils/formatters';
