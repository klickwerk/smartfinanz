import React from 'react';
import { NAVIGATION_TABS } from '../../constants/options';
import { useTranslation } from '../../i18n';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  // Map tab IDs to translation keys
  const getTabLabel = (tabId: string): string => {
    const labelMap: Record<string, string> = {
      'dashboard': t('navigation.home'),
      'planung': t('navigation.planning'),
      'budgets': t('navigation.budgets'),
      'projects': t('navigation.projects'),
      'settings': t('navigation.settings')
    };
    
    return labelMap[tabId] || tabId;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      <div className="bg-zinc-900/80 backdrop-blur-xl border-t border-white/10 px-6 py-3">
        <div className="flex items-center justify-around">
          {NAVIGATION_TABS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 ${
                activeTab === id
                  ? 'bg-turquoise-500/20 text-turquoise-400'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              } active:scale-95`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{getTabLabel(id)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};