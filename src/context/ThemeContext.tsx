import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeOption, THEME_OPTIONS, DEFAULT_THEME } from '../constants/themes';

interface ThemeContextType {
  activeTheme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  updateTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize with default theme (Deep Purple)
  const [activeTheme, setActiveTheme] = useState<ThemeOption>(() => {
    // Try to load from localStorage first
    const savedTheme = localStorage.getItem('finanzapp-theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        const foundTheme = THEME_OPTIONS.find(t => t.id === parsed.id);
        if (foundTheme) {
          return foundTheme;
        }
      } catch (error) {
        console.warn('Failed to parse saved theme from localStorage:', error);
      }
    }
    
    // Fallback to default theme
    return DEFAULT_THEME;
  });

  // Save to localStorage whenever theme changes
  useEffect(() => {
    localStorage.setItem('finanzapp-theme', JSON.stringify(activeTheme));
  }, [activeTheme]);

  const setTheme = (theme: ThemeOption) => {
    setActiveTheme(theme);
  };

  const updateTheme = (themeId: string) => {
    const newTheme = THEME_OPTIONS.find(t => t.id === themeId);
    if (newTheme) {
      setActiveTheme(newTheme);
    }
  };

  const value: ThemeContextType = {
    activeTheme,
    setTheme,
    updateTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};