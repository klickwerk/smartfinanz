import React, { useState } from 'react';
import { X, Home, Check } from 'lucide-react';
import { NAVIGATION_TABS } from '../../constants/options';
import { useDefaultView } from '../../context/DefaultViewContext';
import { useTranslation } from '../../i18n';

interface DefaultViewSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DefaultViewSelectorModal: React.FC<DefaultViewSelectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { defaultView, setDefaultView } = useDefaultView();
  const { t } = useTranslation();
  const [selectedView, setSelectedView] = useState<string>(defaultView);

  if (!isOpen) return null;

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

  const getTabDescription = (tabId: string): string => {
    const descriptionMap: Record<string, string> = {
      'dashboard': 'Übersicht über deine Finanzen',
      'planung': 'Finanzplanung und Transaktionen',
      'budgets': 'Budget-Verwaltung',
      'projects': 'Sparziele und Projekte',
      'settings': 'App-Einstellungen'
    };
    
    return descriptionMap[tabId] || '';
  };

  // Filter views to exclude settings
  const filteredViews = NAVIGATION_TABS.filter(tab => tab.id !== 'settings');

  const handleViewSelect = (viewId: string) => {
    setSelectedView(viewId);
  };

  const handleConfirm = () => {
    setDefaultView(selectedView);
    onClose();
  };

  const handleCancel = () => {
    setSelectedView(defaultView); // Reset to current default view
    onClose();
  };

  const ViewItem: React.FC<{ tab: typeof NAVIGATION_TABS[0] }> = ({ tab }) => (
    <button
      onClick={() => handleViewSelect(tab.id)}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-white/10 ${
        selectedView === tab.id
          ? 'bg-turquoise-500/20 border border-turquoise-500/30'
          : 'bg-white/5 border border-white/10'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          selectedView === tab.id
            ? 'bg-turquoise-500/20 text-turquoise-400'
            : 'bg-white/10 text-white/80'
        }`}>
          <tab.icon className="w-6 h-6" />
        </div>
        <div className="text-left">
          <p className="text-white font-semibold text-lg">{getTabLabel(tab.id)}</p>
          <p className="text-white/60 text-sm">{getTabDescription(tab.id)}</p>
        </div>
      </div>
      {selectedView === tab.id && (
        <Check className="w-6 h-6 text-turquoise-400" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <Home className="w-6 h-6 text-turquoise-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Standard-Ansicht auswählen</h2>
              <p className="text-white/60 text-sm">Wähle die Ansicht, die beim App-Start geöffnet wird</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Current Selection */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-3">Aktuelle Auswahl</h3>
            {NAVIGATION_TABS.filter(tab => tab.id === selectedView).map(tab => (
              <ViewItem key={tab.id} tab={tab} />
            ))}
          </div>

          {/* Available Views */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">Verfügbare Ansichten</h3>
            <div className="space-y-3">
              {filteredViews.map((tab) => (
                <ViewItem key={tab.id} tab={tab} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-xl transition-all duration-200"
            >
              Abbrechen
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-4 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-[0.98]"
            >
              Standard-Ansicht ändern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};