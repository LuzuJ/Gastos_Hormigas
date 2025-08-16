import { useState, useEffect, useMemo } from 'react';

export const useTheme = () => {
  // Lee el tema del localStorage o usa 'light' por defecto
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Efecto que aplica el tema al <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Función para cambiar el tema
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const isDark = useMemo(() => theme === 'dark', [theme]);

  return { theme, toggleTheme, isDark };
};