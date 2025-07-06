import React, { useState } from 'react';
import { X, Palette, Check, Eye } from 'lucide-react';
import { THEME_OPTIONS, ThemeOption } from '../../constants/themes';
import { useTheme } from '../../context/ThemeContext';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { activeTheme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(activeTheme);
  const [previewTheme, setPreviewTheme] = useState<ThemeOption | null>(null);

  if (!isOpen) return null;

  const handleThemeSelect = (theme: ThemeOption) => {
    setSelectedTheme(theme);
  };

  const handlePreview = (theme: ThemeOption) => {
    setPreviewTheme(theme);
  };

  const handleStopPreview = () => {
    setPreviewTheme(null);
  };

  const handleConfirm = () => {
    setTheme(selectedTheme);
    onClose();
  };

  const handleCancel = () => {
    setSelectedTheme(activeTheme); // Reset to current theme
    setPreviewTheme(null);
    onClose();
  };

  const currentDisplayTheme = previewTheme || selectedTheme;

  const ThemeItem: React.FC<{ theme: ThemeOption }> = ({ theme }) => (
    <div className="relative group">
      <button
        onClick={() => handleThemeSelect(theme)}
        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-white/10 ${
          selectedTheme.id === theme.id
            ? 'bg-turquoise-500/20 border border-turquoise-500/30'
            : 'bg-white/5 border border-white/10'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Theme Preview */}
          <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-white/20">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${theme.backgroundImage})` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo}`} />
          </div>
          
          <div className="text-left">
            <p className="text-white font-semibold text-lg">{theme.name}</p>
            <p className="text-white/60 text-sm">{theme.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Preview Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (previewTheme?.id === theme.id) {
                handleStopPreview();
              } else {
                handlePreview(theme);
              }
            }}
            className={`p-2 rounded-lg transition-all duration-200 ${
              previewTheme?.id === theme.id
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
            }`}
            title={previewTheme?.id === theme.id ? 'Vorschau beenden' : 'Vorschau'}
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {/* Selection Check */}
          {selectedTheme.id === theme.id && (
            <Check className="w-5 h-5 text-turquoise-400" />
          )}
        </div>
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Preview Background */}
      {previewTheme && (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center transition-all duration-500"
            style={{
              backgroundImage: `url(${previewTheme.backgroundImage})`,
              backgroundAttachment: 'fixed'
            }}
          />
          <div className={`fixed inset-0 bg-gradient-to-b ${previewTheme.gradientFrom} ${previewTheme.gradientVia} ${previewTheme.gradientTo} transition-all duration-500`} />
        </>
      )}
      
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <Palette className="w-6 h-6 text-turquoise-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Design-Theme auswählen</h2>
              <p className="text-white/60 text-sm">Wähle dein bevorzugtes Hintergrundfarbschema</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Current Selection Preview */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <h3 className="text-white font-semibold text-lg mb-3">
            {previewTheme ? 'Vorschau' : 'Aktuelle Auswahl'}
          </h3>
          <div className="relative">
            <div className="relative w-full h-24 rounded-xl overflow-hidden border border-white/20">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${currentDisplayTheme.backgroundImage})` }}
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${currentDisplayTheme.gradientFrom} ${currentDisplayTheme.gradientVia} ${currentDisplayTheme.gradientTo}`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white font-bold text-xl">{currentDisplayTheme.name}</p>
                  <p className="text-white/80 text-sm">{currentDisplayTheme.description}</p>
                </div>
              </div>
            </div>
            {previewTheme && (
              <div className="mt-2 text-center">
                <button
                  onClick={handleStopPreview}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Vorschau beenden
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Theme Options */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Verfügbare Themes</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {THEME_OPTIONS.map((theme) => (
              <ThemeItem key={theme.id} theme={theme} />
            ))}
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
              Theme ändern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};