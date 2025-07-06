import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DefaultViewContextType {
  defaultView: string;
  setDefaultView: (view: string) => void;
  updateDefaultView: (viewId: string) => void;
}

const DefaultViewContext = createContext<DefaultViewContextType | undefined>(undefined);

interface DefaultViewProviderProps {
  children: ReactNode;
}

export const DefaultViewProvider: React.FC<DefaultViewProviderProps> = ({ children }) => {
  // Initialize with default view (dashboard)
  const [defaultView, setDefaultView] = useState<string>(() => {
    // Try to load from localStorage first
    const savedView = localStorage.getItem('finanzapp-default-view');
    if (savedView) {
      try {
        return savedView;
      } catch (error) {
        console.warn('Failed to parse saved default view from localStorage:', error);
      }
    }
    
    // Fallback to dashboard
    return 'dashboard';
  });

  // Save to localStorage whenever default view changes
  useEffect(() => {
    localStorage.setItem('finanzapp-default-view', defaultView);
  }, [defaultView]);

  const updateDefaultView = (viewId: string) => {
    setDefaultView(viewId);
  };

  const value: DefaultViewContextType = {
    defaultView,
    setDefaultView,
    updateDefaultView
  };

  return (
    <DefaultViewContext.Provider value={value}>
      {children}
    </DefaultViewContext.Provider>
  );
};

export const useDefaultView = (): DefaultViewContextType => {
  const context = useContext(DefaultViewContext);
  if (context === undefined) {
    throw new Error('useDefaultView must be used within a DefaultViewProvider');
  }
  return context;
};