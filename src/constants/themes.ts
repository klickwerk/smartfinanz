/**
 * Theme options for background customization
 * Each theme includes a background image and gradient overlay colors
 */

export interface ThemeOption {
  id: string;
  name: string;
  backgroundImage: string; // Pexels URL
  gradientFrom: string; // Tailwind class
  gradientVia: string; // Tailwind class
  gradientTo: string; // Tailwind class
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'deep-purple',
    name: 'Deep Purple',
    backgroundImage: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    gradientFrom: 'from-purple-900/70',
    gradientVia: 'via-violet-900/70',
    gradientTo: 'to-indigo-900/70',
    description: 'Mystisches Lila mit tiefen Schatten'
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    backgroundImage: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    gradientFrom: 'from-blue-900/70',
    gradientVia: 'via-slate-900/70',
    gradientTo: 'to-blue-900/70',
    description: 'Beruhigendes Ozeanblau'
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    backgroundImage: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    gradientFrom: 'from-green-900/70',
    gradientVia: 'via-slate-900/70',
    gradientTo: 'to-emerald-900/70',
    description: 'Natürliches Waldgrün'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    backgroundImage: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    gradientFrom: 'from-orange-900/70',
    gradientVia: 'via-zinc-900/70',
    gradientTo: 'to-red-900/70',
    description: 'Warmes Sonnenuntergang-Orange'
  },
  {
    id: 'midnight-teal',
    name: 'Midnight Teal',
    backgroundImage: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    gradientFrom: 'from-teal-900/70',
    gradientVia: 'via-cyan-900/70',
    gradientTo: 'to-teal-900/70',
    description: 'Elegantes Mitternachts-Türkis'
  },
  {
    id: 'cosmic-purple',
    name: 'Cosmic Purple',
    backgroundImage: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    gradientFrom: 'from-purple-900/70',
    gradientVia: 'via-indigo-900/70',
    gradientTo: 'to-purple-900/70',
    description: 'Kosmisches Lila mit Sternen'
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    backgroundImage: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    gradientFrom: 'from-rose-900/70',
    gradientVia: 'via-zinc-900/70',
    gradientTo: 'to-pink-900/70',
    description: 'Elegantes Roségold'
  },
  {
    id: 'arctic-blue',
    name: 'Arctic Blue',
    backgroundImage: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    gradientFrom: 'from-sky-900/85',
    gradientVia: 'via-blue-900/85',
    gradientTo: 'to-sky-900/85',
    description: 'Kühles Arktisblau'
  }
];

// Default theme
export const DEFAULT_THEME = THEME_OPTIONS[0]; // Deep Purple

// Helper function to get theme by ID
export const getThemeById = (id: string): ThemeOption | undefined => {
  return THEME_OPTIONS.find(theme => theme.id === id);
};