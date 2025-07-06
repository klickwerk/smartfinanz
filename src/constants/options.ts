import { Home, Target, Wallet, Settings, Calendar, User, Bell, Shield, Palette, Globe, HelpCircle, Users } from 'lucide-react';

// Transaction and Budget Categories
export const CATEGORIES = {
  expense: ['Wohnen', 'Transport', 'Lebensmittel', 'Entertainment', 'Gesundheit', 'Bildung', 'Sonstiges'],
  income: ['Gehalt', 'Freelance', 'Investitionen', 'Bonus', 'Sonstiges']
} as const;

// Budget specific categories
export const BUDGET_CATEGORIES = [
  'Lebensmittel',
  'Transport',
  'Entertainment',
  'Gesundheit',
  'Bildung',
  'Wohnen',
  'Kleidung',
  'Privat',
  'Sonstiges'
] as const;

// Project categories
export const PROJECT_CATEGORIES = [
  'Reisen',
  'Wohnen',
  'Auto',
  'Bildung',
  'Gesundheit',
  'Notgroschen',
  'Investitionen',
  'Hobby',
  'Familie',
  'Sonstiges'
] as const;

// Recurrence options
export const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Einmalig' },
  { value: 'monthly', label: 'Monatlich' },
  { value: 'quarterly', label: 'Quartalsweise' },
  { value: 'yearly', label: 'Jährlich' }
] as const;

// Budget recurrence options (no 'none' option)
export const BUDGET_RECURRENCE_OPTIONS = [
  { value: 'monthly', label: 'Monatlich' },
  { value: 'quarterly', label: 'Quartalsweise' },
  { value: 'yearly', label: 'Jährlich' }
] as const;

// Color options for budgets
export const COLOR_OPTIONS = [
  { value: 'from-blue-500 to-blue-400', label: 'Blau', preview: 'bg-gradient-to-r from-blue-500 to-blue-400' },
  { value: 'from-green-500 to-green-400', label: 'Grün', preview: 'bg-gradient-to-r from-green-500 to-green-400' },
  { value: 'from-purple-500 to-purple-400', label: 'Lila', preview: 'bg-gradient-to-r from-purple-500 to-purple-400' },
  { value: 'from-red-500 to-red-400', label: 'Rot', preview: 'bg-gradient-to-r from-red-500 to-red-400' },
  { value: 'from-yellow-500 to-yellow-400', label: 'Gelb', preview: 'bg-gradient-to-r from-yellow-500 to-yellow-400' },
  { value: 'from-pink-500 to-pink-400', label: 'Pink', preview: 'bg-gradient-to-r from-pink-500 to-pink-400' },
  { value: 'from-orange-500 to-orange-400', label: 'Orange', preview: 'bg-gradient-to-r from-orange-500 to-orange-400' },
  { value: 'from-teal-500 to-teal-400', label: 'Türkis', preview: 'bg-gradient-to-r from-teal-500 to-teal-400' }
] as const;

// Project status options
export const PROJECT_STATUS_OPTIONS = [
  { value: 'active', label: 'Aktiv', color: 'text-green-400' },
  { value: 'paused', label: 'Pausiert', color: 'text-yellow-400' },
  { value: 'completed', label: 'Abgeschlossen', color: 'text-blue-400' }
] as const;

// Navigation tabs
export const NAVIGATION_TABS = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'planung', icon: Calendar, label: 'Planung' },
  { id: 'budgets', icon: Wallet, label: 'Budgets' },
  { id: 'projects', icon: Target, label: 'Projekte' },
  { id: 'settings', icon: Settings, label: 'Einstellungen' }
] as const;

// Default view options (derived from navigation tabs)
export const DEFAULT_VIEW_OPTIONS = NAVIGATION_TABS.map(tab => ({
  id: tab.id,
  label: tab.label,
  icon: tab.icon
}));

// Settings groups
export const SETTINGS_GROUPS = [
  {
    title: 'Profil',
    items: [
      { icon: User, label: 'Persönliche Daten', value: 'Demo Benutzer' },
      { icon: Bell, label: 'Benachrichtigungen', value: 'Aktiviert' },
      { icon: Shield, label: 'Datenschutz & Sicherheit', value: null }
    ]
  },
  {
    title: 'Familie',
    items: [
      { icon: Users, label: 'Familie verwalten', value: 'Mitglieder einladen' },
      { icon: Users, label: 'Berechtigungen', value: null },
      { icon: Home, label: 'Standard-Ansicht', value: 'Unser Haushalt' }
    ]
  },
  {
    title: 'App',
    items: [
      { icon: Palette, label: 'Design', value: 'Dunkel' },
      { icon: Globe, label: 'Sprache', value: 'Deutsch (Österreich)' }
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Hilfe & Support', value: null }
    ]
  }
] as const;

// Currency options
export const CURRENCY_OPTIONS = [
  { value: 'EUR', label: '€', symbol: '€' },
  { value: 'USD', label: '$', symbol: '$' },
  { value: 'CHF', label: 'CHF', symbol: 'CHF' }
] as const;