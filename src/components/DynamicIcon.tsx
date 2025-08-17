import React from 'react';
import * as icons from 'lucide-react';

interface DynamicIconProps extends icons.LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  // Aseguramos que el nombre del icono empiece con mayúscula para que coincida con la exportación
  const iconName = name.charAt(0).toUpperCase() + name.slice(1) as keyof typeof icons;
  const IconComponent = icons[iconName];

  // Verifica que IconComponent sea un componente React válido (ForwardRefExoticComponent)
  if (
    !IconComponent ||
    typeof IconComponent === 'function' && IconComponent.length > 1 || // Factory function, not a component
    IconComponent === icons // Prevent rendering the whole index object
  ) {
    // Si el icono no se encuentra o no es un componente válido, devolvemos un icono por defecto
    return <icons.Tag {...props} />;
  }

  // Solo renderiza si IconComponent es un componente React válido
  return React.createElement(IconComponent as React.ElementType, props);
};