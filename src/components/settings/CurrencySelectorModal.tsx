import React, { useState } from 'react';
import { X, Search, Globe, Check, Star } from 'lucide-react';
import { ALL_CURRENCY_OPTIONS, POPULAR_CURRENCIES, CurrencyOption } from '../../constants/currencies';
import { useCurrency } from '../../context/CurrencyContext';

interface CurrencySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencySelectorModal: React.FC<CurrencySelectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { displayCurrency, setDisplayCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(displayCurrency);

  if (!isOpen) return null;

  // Filter currencies based on search term
  const filteredCurrencies = ALL_CURRENCY_OPTIONS.filter(currency =>
    currency.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get popular currencies for quick selection
  const popularCurrencyOptions = ALL_CURRENCY_OPTIONS.filter(currency =>
    POPULAR_CURRENCIES.includes(currency.value)
  );

  const handleCurrencySelect = (currency: CurrencyOption) => {
    setSelectedCurrency(currency);
  };

  const handleConfirm = () => {
    setDisplayCurrency(selectedCurrency);
    onClose();
  };

  const handleCancel = () => {
    setSelectedCurrency(displayCurrency); // Reset to current currency
    onClose();
  };

  const CurrencyItem: React.FC<{ currency: CurrencyOption; isPopular?: boolean }> = ({ 
    currency, 
    isPopular = false 
  }) => (
    <button
      onClick={() => handleCurrencySelect(currency)}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-white/10 ${
        selectedCurrency.value === currency.value
          ? 'bg-turquoise-500/20 border border-turquoise-500/30'
          : 'bg-white/5 border border-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
          selectedCurrency.value === currency.value
            ? 'bg-turquoise-500/20 text-turquoise-400'
            : 'bg-white/10 text-white/80'
        }`}>
          {currency.symbol}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <p className="text-white font-semibold">{currency.value}</p>
            {isPopular && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
          </div>
          <p className="text-white/60 text-sm">{currency.label}</p>
          {currency.country && (
            <p className="text-white/40 text-xs">{currency.country}</p>
          )}
        </div>
      </div>
      {selectedCurrency.value === currency.value && (
        <Check className="w-5 h-5 text-turquoise-400" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <Globe className="w-6 h-6 text-turquoise-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Währung auswählen</h2>
              <p className="text-white/60 text-sm">Wähle deine bevorzugte Anzeigewährung</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
              placeholder="Währung suchen..."
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Current Selection */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-3">Aktuelle Auswahl</h3>
            <CurrencyItem currency={selectedCurrency} />
          </div>

          {/* Popular Currencies */}
          {!searchTerm && (
            <div className="mb-6">
              <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Beliebte Währungen
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {popularCurrencyOptions.map((currency) => (
                  <CurrencyItem key={currency.value} currency={currency} isPopular />
                ))}
              </div>
            </div>
          )}

          {/* All Currencies */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">
              {searchTerm ? `Suchergebnisse (${filteredCurrencies.length})` : 'Alle Währungen'}
            </h3>
            {filteredCurrencies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60">Keine Währungen gefunden</p>
                <p className="text-white/40 text-sm mt-1">Versuche einen anderen Suchbegriff</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCurrencies.map((currency) => (
                  <CurrencyItem 
                    key={currency.value} 
                    currency={currency}
                    isPopular={POPULAR_CURRENCIES.includes(currency.value)}
                  />
                ))}
              </div>
            )}
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
              Währung ändern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};