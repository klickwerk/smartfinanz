import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageOption, AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from '../constants/languages';

interface LanguageContextType {
  currentLanguage: LanguageOption;
  setCurrentLanguage: (language: LanguageOption) => void;
  updateLanguage: (languageCode: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Initialize with default language (German)
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>(() => {
    // Try to load from localStorage first
    const savedLanguage = localStorage.getItem('finanzapp-language');
    if (savedLanguage) {
      try {
        const parsed = JSON.parse(savedLanguage);
        const foundLanguage = AVAILABLE_LANGUAGES.find(l => l.code === parsed.code);
        if (foundLanguage) {
          return foundLanguage;
        }
      } catch (error) {
        console.warn('Failed to parse saved language from localStorage:', error);
      }
    }
    
    // Fallback to default language
    return AVAILABLE_LANGUAGES.find(l => l.code === DEFAULT_LANGUAGE) || AVAILABLE_LANGUAGES[0];
  });

  // Save to localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem('finanzapp-language', JSON.stringify(currentLanguage));
  }, [currentLanguage]);

  const updateLanguage = (languageCode: string) => {
    const newLanguage = AVAILABLE_LANGUAGES.find(l => l.code === languageCode);
    if (newLanguage) {
      setCurrentLanguage(newLanguage);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    setCurrentLanguage,
    updateLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};