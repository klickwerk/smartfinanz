import { useLanguage } from '../context/LanguageContext';

/**
 * Utility functions for formatting currency and other values
 */

/**
 * Format currency amount according to the specified currency and locale
 * 
 * @param amount - The amount to format
 * @param currencyCode - The currency code (ISO 4217)
 * @param locale - The locale to use (auto-detected from language context if not provided)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  currencyCode: string = 'EUR',
  locale?: string
): string {
  // Auto-detect locale based on current language if not provided
  const defaultLocale = locale || (typeof window !== 'undefined' && window.navigator?.language) || 'de-AT';
  
  try {
    return new Intl.NumberFormat(defaultLocale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is not supported
    console.warn(`Currency code ${currencyCode} not supported, falling back to EUR`);
    return new Intl.NumberFormat(defaultLocale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }
}

/**
 * Hook for formatting currency with language context
 */
export const useCurrencyFormatter = () => {
  const { currentLanguage } = useLanguage();
  
  const formatCurrencyWithLanguage = (
    amount: number, 
    currencyCode: string = 'EUR'
  ): string => {
    const locale = currentLanguage.code === 'en' ? 'en-US' : 'de-AT';
    return formatCurrency(amount, currencyCode, locale);
  };
  
  return { formatCurrency: formatCurrencyWithLanguage };
};

/**
 * Format a number with locale formatting
 * 
 * @param value - The number to format
 * @param locale - The locale to use (auto-detected if not provided)
 * @returns Formatted number string
 */
export function formatNumber(value: number, locale?: string): string {
  const defaultLocale = locale || (typeof window !== 'undefined' && window.navigator?.language) || 'de-AT';
  return new Intl.NumberFormat(defaultLocale).format(value);
}

/**
 * Format percentage with locale
 * 
 * @param value - The percentage value (0-100)
 * @param locale - The locale to use (auto-detected if not provided)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, locale?: string): string {
  const defaultLocale = locale || (typeof window !== 'undefined' && window.navigator?.language) || 'de-AT';
  return new Intl.NumberFormat(defaultLocale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value / 100);
}