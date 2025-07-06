import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyOption, ALL_CURRENCY_OPTIONS, DEFAULT_CURRENCY } from '../constants/currencies';

interface CurrencyContextType {
  displayCurrency: CurrencyOption;
  setDisplayCurrency: (currency: CurrencyOption) => void;
  updateCurrency: (currencyCode: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  // Initialize with default currency (EUR)
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyOption>(() => {
    // Try to load from localStorage first
    const savedCurrency = localStorage.getItem('finanzapp-display-currency');
    if (savedCurrency) {
      try {
        const parsed = JSON.parse(savedCurrency);
        const foundCurrency = ALL_CURRENCY_OPTIONS.find(c => c.value === parsed.value);
        if (foundCurrency) {
          return foundCurrency;
        }
      } catch (error) {
        console.warn('Failed to parse saved currency from localStorage:', error);
      }
    }
    
    // Fallback to default currency
    return ALL_CURRENCY_OPTIONS.find(c => c.value === DEFAULT_CURRENCY) || ALL_CURRENCY_OPTIONS[0];
  });

  // Save to localStorage whenever currency changes
  useEffect(() => {
    localStorage.setItem('finanzapp-display-currency', JSON.stringify(displayCurrency));
  }, [displayCurrency]);

  const updateCurrency = (currencyCode: string) => {
    const newCurrency = ALL_CURRENCY_OPTIONS.find(c => c.value === currencyCode);
    if (newCurrency) {
      setDisplayCurrency(newCurrency);
    }
  };

  const value: CurrencyContextType = {
    displayCurrency,
    setDisplayCurrency,
    updateCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};