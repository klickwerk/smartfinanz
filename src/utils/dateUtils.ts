import { useLanguage } from '../context/LanguageContext';

/**
 * Utility functions for date calculations and formatting
 */

export interface DateInfo {
  currentYear: number;
  currentMonth: number;
  nextMonth: number;
  nextMonthYear: number;
  today: Date;
  startOfMonth: Date;
  endOfMonth: Date;
  daysInMonth: number;
  daysPassed: number;
  daysRemaining: number;
  monthProgress: number;
}

/**
 * Get comprehensive date information for the current date
 */
export function getCurrentDateInfo(): DateInfo {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const daysPassed = today.getDate();
  const daysRemaining = daysInMonth - daysPassed;
  const monthProgress = (daysPassed / daysInMonth) * 100;

  return {
    currentYear,
    currentMonth,
    nextMonth,
    nextMonthYear,
    today,
    startOfMonth,
    endOfMonth,
    daysInMonth,
    daysPassed,
    daysRemaining,
    monthProgress
  };
}

/**
 * Get the number of days until next month
 */
export function getDaysUntilNextMonth(): number {
  const { daysRemaining } = getCurrentDateInfo();
  return daysRemaining;
}

/**
 * Get the number of days until a specific date
 */
export function getDaysUntilDate(targetDate: string | Date): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format date with language context
 * 
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @param locale - Locale override (auto-detected if not provided)
 * @returns Formatted date string
 */
export function formatDateGerman(date: Date | string, options?: Intl.DateTimeFormatOptions, locale?: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultLocale = locale || 'de-AT';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  
  return dateObj.toLocaleDateString(defaultLocale, { ...defaultOptions, ...options });
}

/**
 * Hook for formatting dates with language context
 */
export const useDateFormatter = () => {
  const { currentLanguage } = useLanguage();
  
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const locale = currentLanguage.code === 'en' ? 'en-US' : 'de-AT';
    return formatDateGerman(date, options, locale);
  };
  
  return { formatDate };
};

/**
 * Get month name in German
 */
export function getMonthNameGerman(monthIndex: number): string {
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  return months[monthIndex] || '';
}

/**
 * Get short month name in German
 */
export function getShortMonthNameGerman(monthIndex: number): string {
  const months = [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
  ];
  return months[monthIndex] || '';
}

/**
 * Get default date for forms (today)
 */
export function getDefaultDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get default end date for budgets (next month)
 */
export function getDefaultEndDate(): string {
  const { nextMonthYear, nextMonth } = getCurrentDateInfo();
  return new Date(nextMonthYear, nextMonth + 1, 0).toISOString().split('T')[0];
}

/**
 * Get default due date for projects (6 months from now)
 */
export function getDefaultProjectDueDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 6);
  return date.toISOString().split('T')[0];
}