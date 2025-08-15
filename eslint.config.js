// eslint.config.js (en la raíz del proyecto)

import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    // Ignora la carpeta de build
    ignores: ["dist"],
  },
  // Configuración base para todo el proyecto
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.browser, // El entorno por defecto es de navegador
    },
  },
  // Configuración específica para tu código de React en la carpeta 'src'
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    ...pluginReactConfig,
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // No es necesario con Vite/React 17+
      "react/prop-types": "off", // Ya usamos TypeScript para esto
    },
    settings: {
      react: {
        version: "detect", // Detecta la versión de React automáticamente
      },
    },
  },
];