import React, { type ReactNode } from 'react';
import { PlanningProvider } from './PlanningContext';

interface PlanningPageProviderProps {
  children: ReactNode;
  userId: string | null;
}

/**
 * Proveedor específico para la página de planificación.
 * Solo carga los contextos necesarios para esta página.
 */
export const PlanningPageProvider: React.FC<PlanningPageProviderProps> = ({ children, userId }) => {
  return (
    <PlanningProvider userId={userId}>
      {children}
    </PlanningProvider>
  );
};
