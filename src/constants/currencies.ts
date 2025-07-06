/**
 * Comprehensive list of major world currencies
 * Includes the most commonly used currencies worldwide
 */

export interface CurrencyOption {
  value: string; // ISO 4217 currency code
  label: string; // Full currency name
  symbol: string; // Currency symbol
  country?: string; // Primary country/region
}

export const ALL_CURRENCY_OPTIONS: CurrencyOption[] = [
  // Major European Currencies
  { value: 'EUR', label: 'Euro', symbol: '€', country: 'Eurozone' },
  { value: 'GBP', label: 'British Pound Sterling', symbol: '£', country: 'United Kingdom' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF', country: 'Switzerland' },
  { value: 'NOK', label: 'Norwegian Krone', symbol: 'kr', country: 'Norway' },
  { value: 'SEK', label: 'Swedish Krona', symbol: 'kr', country: 'Sweden' },
  { value: 'DKK', label: 'Danish Krone', symbol: 'kr', country: 'Denmark' },
  { value: 'PLN', label: 'Polish Złoty', symbol: 'zł', country: 'Poland' },
  { value: 'CZK', label: 'Czech Koruna', symbol: 'Kč', country: 'Czech Republic' },
  { value: 'HUF', label: 'Hungarian Forint', symbol: 'Ft', country: 'Hungary' },
  { value: 'RON', label: 'Romanian Leu', symbol: 'lei', country: 'Romania' },

  // North American Currencies
  { value: 'USD', label: 'US Dollar', symbol: '$', country: 'United States' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$', country: 'Canada' },
  { value: 'MXN', label: 'Mexican Peso', symbol: '$', country: 'Mexico' },

  // Asian Currencies
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥', country: 'Japan' },
  { value: 'CNY', label: 'Chinese Yuan', symbol: '¥', country: 'China' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹', country: 'India' },
  { value: 'KRW', label: 'South Korean Won', symbol: '₩', country: 'South Korea' },
  { value: 'SGD', label: 'Singapore Dollar', symbol: 'S$', country: 'Singapore' },
  { value: 'HKD', label: 'Hong Kong Dollar', symbol: 'HK$', country: 'Hong Kong' },
  { value: 'TWD', label: 'Taiwan Dollar', symbol: 'NT$', country: 'Taiwan' },
  { value: 'THB', label: 'Thai Baht', symbol: '฿', country: 'Thailand' },
  { value: 'MYR', label: 'Malaysian Ringgit', symbol: 'RM', country: 'Malaysia' },
  { value: 'IDR', label: 'Indonesian Rupiah', symbol: 'Rp', country: 'Indonesia' },
  { value: 'PHP', label: 'Philippine Peso', symbol: '₱', country: 'Philippines' },
  { value: 'VND', label: 'Vietnamese Dong', symbol: '₫', country: 'Vietnam' },

  // Oceania Currencies
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$', country: 'Australia' },
  { value: 'NZD', label: 'New Zealand Dollar', symbol: 'NZ$', country: 'New Zealand' },

  // Middle Eastern Currencies
  { value: 'AED', label: 'UAE Dirham', symbol: 'د.إ', country: 'United Arab Emirates' },
  { value: 'SAR', label: 'Saudi Riyal', symbol: '﷼', country: 'Saudi Arabia' },
  { value: 'QAR', label: 'Qatari Riyal', symbol: '﷼', country: 'Qatar' },
  { value: 'KWD', label: 'Kuwaiti Dinar', symbol: 'د.ك', country: 'Kuwait' },
  { value: 'BHD', label: 'Bahraini Dinar', symbol: '.د.ب', country: 'Bahrain' },
  { value: 'OMR', label: 'Omani Rial', symbol: '﷼', country: 'Oman' },
  { value: 'ILS', label: 'Israeli Shekel', symbol: '₪', country: 'Israel' },
  { value: 'TRY', label: 'Turkish Lira', symbol: '₺', country: 'Turkey' },

  // African Currencies
  { value: 'ZAR', label: 'South African Rand', symbol: 'R', country: 'South Africa' },
  { value: 'EGP', label: 'Egyptian Pound', symbol: '£', country: 'Egypt' },
  { value: 'NGN', label: 'Nigerian Naira', symbol: '₦', country: 'Nigeria' },
  { value: 'KES', label: 'Kenyan Shilling', symbol: 'KSh', country: 'Kenya' },
  { value: 'GHS', label: 'Ghanaian Cedi', symbol: '₵', country: 'Ghana' },
  { value: 'MAD', label: 'Moroccan Dirham', symbol: 'د.م.', country: 'Morocco' },

  // South American Currencies
  { value: 'BRL', label: 'Brazilian Real', symbol: 'R$', country: 'Brazil' },
  { value: 'ARS', label: 'Argentine Peso', symbol: '$', country: 'Argentina' },
  { value: 'CLP', label: 'Chilean Peso', symbol: '$', country: 'Chile' },
  { value: 'COP', label: 'Colombian Peso', symbol: '$', country: 'Colombia' },
  { value: 'PEN', label: 'Peruvian Sol', symbol: 'S/', country: 'Peru' },
  { value: 'UYU', label: 'Uruguayan Peso', symbol: '$U', country: 'Uruguay' },

  // Other Notable Currencies
  { value: 'RUB', label: 'Russian Ruble', symbol: '₽', country: 'Russia' },
  { value: 'UAH', label: 'Ukrainian Hryvnia', symbol: '₴', country: 'Ukraine' },
  { value: 'BGN', label: 'Bulgarian Lev', symbol: 'лв', country: 'Bulgaria' },
  { value: 'HRK', label: 'Croatian Kuna', symbol: 'kn', country: 'Croatia' },
  { value: 'RSD', label: 'Serbian Dinar', symbol: 'дин', country: 'Serbia' },
  { value: 'ISK', label: 'Icelandic Króna', symbol: 'kr', country: 'Iceland' }
];

// Helper function to get currency by code
export const getCurrencyByCode = (code: string): CurrencyOption | undefined => {
  return ALL_CURRENCY_OPTIONS.find(currency => currency.value === code);
};

// Helper function to get currency symbol by code
export const getCurrencySymbol = (code: string): string => {
  const currency = getCurrencyByCode(code);
  return currency?.symbol || code;
};

// Default currency
export const DEFAULT_CURRENCY = 'EUR';

// Most commonly used currencies (for quick selection)
export const POPULAR_CURRENCIES = [
  'EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'BRL'
];