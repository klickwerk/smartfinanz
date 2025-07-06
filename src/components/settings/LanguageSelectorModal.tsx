import React, { useState } from 'react';
import { X, Globe, Check, Languages } from 'lucide-react';
import { AVAILABLE_LANGUAGES, LanguageOption, getLanguageDisplayName } from '../../constants/languages';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../i18n';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(currentLanguage);

  if (!isOpen) return null;

  const handleLanguageSelect = (language: LanguageOption) => {
    setSelectedLanguage(language);
  };

  const handleConfirm = () => {
    setCurrentLanguage(selectedLanguage);
    onClose();
  };

  const handleCancel = () => {
    setSelectedLanguage(currentLanguage); // Reset to current language
    onClose();
  };

  const LanguageItem: React.FC<{ language: LanguageOption }> = ({ language }) => (
    <button
      onClick={() => handleLanguageSelect(language)}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-white/10 ${
        selectedLanguage.code === language.code
          ? 'bg-turquoise-500/20 border border-turquoise-500/30'
          : 'bg-white/5 border border-white/10'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          selectedLanguage.code === language.code
            ? 'bg-turquoise-500/20'
            : 'bg-white/10'
        }`}>
          {language.flag}
        </div>
        <div className="text-left">
          <p className="text-white font-semibold text-lg">{language.name}</p>
          {language.region && (
            <p className="text-white/60 text-sm">{language.region}</p>
          )}
          <p className="text-white/40 text-xs">{language.code.toUpperCase()}</p>
        </div>
      </div>
      {selectedLanguage.code === language.code && (
        <Check className="w-6 h-6 text-turquoise-400" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <Languages className="w-6 h-6 text-turquoise-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {currentLanguage.code === 'de' ? 'Sprache auswählen' : 'Select Language'}
              </h2>
              <p className="text-white/60 text-sm">
                {currentLanguage.code === 'de' 
                  ? 'Wähle deine bevorzugte Sprache' 
                  : 'Choose your preferred language'
                }
              </p>
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
            <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-turquoise-400" />
              {currentLanguage.code === 'de' ? 'Aktuelle Auswahl' : 'Current Selection'}
            </h3>
            <LanguageItem language={selectedLanguage} />
          </div>

          {/* Available Languages */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">
              {currentLanguage.code === 'de' ? 'Verfügbare Sprachen' : 'Available Languages'}
            </h3>
            <div className="space-y-3">
              {AVAILABLE_LANGUAGES.map((language) => (
                <LanguageItem key={language.code} language={language} />
              ))}
            </div>
          </div>

          {/* Language Info */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <p className="text-white/60 text-sm text-center">
              {currentLanguage.code === 'de' 
                ? 'Die Sprachänderung wird sofort angewendet und in deinem Browser gespeichert.'
                : 'Language changes will be applied immediately and saved in your browser.'
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-xl transition-all duration-200"
            >
              {currentLanguage.code === 'de' ? 'Abbrechen' : 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-4 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-[0.98]"
            >
              {currentLanguage.code === 'de' ? 'Sprache ändern' : 'Change Language'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};