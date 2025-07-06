import { useTranslation } from '../i18n';

// UI Constants for consistent text across the application
// Note: These are now dynamic and use translations

export const usePlaceholders = () => {
  const { t } = useTranslation();
  
  return {
    AMOUNT: t('placeholders.amount'),
    EMAIL: t('placeholders.email'),
    NAME: t('placeholders.name'),
    DESCRIPTION: t('placeholders.description'),
    TITLE: t('placeholders.title'),
    TAG: t('placeholders.tag'),
    SEARCH: t('placeholders.search')
  };
};

// Static placeholders for backwards compatibility (fallback to German)
export const PLACEHOLDERS = {
  AMOUNT: 'z.B. 250',
  EMAIL: 'deine@email.at',
  NAME: 'z.B. Max Mustermann',
  DESCRIPTION: 'Beschreibung eingeben...',
  TITLE: 'Titel eingeben...',
  TAG: 'Tag hinzufügen...',
  SEARCH: 'Suchen...'
} as const;

// Legacy export for backwards compatibility
export const AMOUNT_PLACEHOLDER = PLACEHOLDERS.AMOUNT;