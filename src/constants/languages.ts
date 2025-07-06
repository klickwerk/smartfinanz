/**
 * Available languages for the application
 */

export interface LanguageOption {
  code: string; // ISO 639-1 language code
  name: string; // Native language name
  flag: string; // Flag emoji
  region?: string; // Optional region specification
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    region: 'Österreich'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    region: 'United States'
  }
];

// Default language
export const DEFAULT_LANGUAGE = 'de';

// Helper function to get language by code
export const getLanguageByCode = (code: string): LanguageOption | undefined => {
  return AVAILABLE_LANGUAGES.find(language => language.code === code);
};

// Helper function to get language display name
export const getLanguageDisplayName = (code: string): string => {
  const language = getLanguageByCode(code);
  if (!language) return code;
  
  return language.region ? `${language.name} (${language.region})` : language.name;
};