import { useLanguage } from '../context/LanguageContext';
import deTranslations from './locales/de.json';
import enTranslations from './locales/en.json';

// Type for translation keys
type TranslationKeys = typeof deTranslations;

// Available translations
const translations = {
  de: deTranslations,
  en: enTranslations
} as const;

/**
 * Hook for accessing translations
 */
export const useTranslation = () => {
  const { currentLanguage } = useLanguage();

  /**
   * Get translation for a given key
   * @param key - Dot-notation key (e.g., 'dashboard.title')
   * @param params - Parameters to replace in the translation
   * @returns Translated string
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    const languageCode = currentLanguage.code as keyof typeof translations;
    const translation = translations[languageCode] || translations.de;
    
    // Navigate through nested object using dot notation
    const keys = key.split('.');
    let value: any = translation;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to German if key not found
        value = translations.de;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            console.warn(`Translation key "${key}" not found`);
            return key; // Return the key itself as fallback
          }
        }
        break;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" does not resolve to a string`);
      return key;
    }
    
    // Replace parameters in the translation
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };

  /**
   * Get current language code
   */
  const getCurrentLanguage = () => currentLanguage.code;

  /**
   * Check if current language is specific language
   */
  const isLanguage = (languageCode: string) => currentLanguage.code === languageCode;

  return {
    t,
    getCurrentLanguage,
    isLanguage,
    currentLanguage
  };
};

// Export translation type for TypeScript support
export type { TranslationKeys };