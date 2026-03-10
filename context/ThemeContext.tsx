import React, { createContext, useContext } from 'react';

export type AppTheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: AppTheme;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useThemeContext() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useThemeContext must be used within a ThemeContext.Provider');
  }

  return value;
}

