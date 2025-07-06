/**
 * Validierungsfunktionen für Transaktionen
 * Enthält wiederverwendbare Logik zur Validierung von Transaktionsdaten
 */

import { Transaction } from '../types';

/**
 * Validiert die Daten eines Transaktionsformulars
 * @param formData - Die zu validierenden Formulardaten
 * @returns Ein Array von Fehlermeldungen oder ein leeres Array, wenn die Validierung erfolgreich ist
 */
export function validateTransactionForm(formData: Partial<Transaction>): string[] {
  const errors: string[] = [];

  // Titel validieren
  if (!formData.title?.trim()) {
    errors.push('Titel ist erforderlich');
  } else if (formData.title.length > 100) {
    errors.push('Titel darf maximal 100 Zeichen lang sein');
  }

  // Betrag validieren
  if (!formData.amount && formData.amount !== 0) {
    errors.push('Betrag ist erforderlich');
  } else {
    const amount = typeof formData.amount === 'string' 
      ? parseFloat(formData.amount) 
      : formData.amount;
    
    if (isNaN(amount) || amount <= 0) {
      errors.push('Betrag muss größer als 0 sein');
    }
    
    if (amount > 1000000) {
      errors.push('Betrag darf maximal 1.000.000 sein');
    }
  }

  // Kategorie validieren
  if (!formData.category) {
    errors.push('Kategorie ist erforderlich');
  }

  // Datum validieren - nur wenn Status nicht "someday" ist
  if (formData.status !== 'someday') {
    if (!formData.date) {
      errors.push('Datum ist erforderlich');
    } else {
      // Prüfen, ob das Datum gültig ist
      const dateObj = new Date(formData.date);
      if (isNaN(dateObj.getTime())) {
        errors.push('Datum ist ungültig');
      }
    }
  }

  // Zuweisung validieren
  if (!formData.assignedTo) {
    errors.push('Zuweisung an eine Person ist erforderlich');
  }

  // Währung validieren
  if (!formData.currency) {
    errors.push('Währung ist erforderlich');
  }

  // Typ validieren
  if (!formData.type || (formData.type !== 'income' && formData.type !== 'expense')) {
    errors.push('Transaktionstyp ist ungültig');
  }

  // Tags validieren (optional, aber wenn vorhanden, dann richtig)
  if (formData.tags && Array.isArray(formData.tags)) {
    for (const tag of formData.tags) {
      if (typeof tag !== 'string' || tag.trim().length === 0) {
        errors.push('Tags müssen gültige Textwerte sein');
        break;
      }
      
      if (tag.length > 50) {
        errors.push('Tags dürfen maximal 50 Zeichen lang sein');
        break;
      }
    }
  }

  // Beschreibung validieren (optional, aber wenn vorhanden, dann richtig)
  if (formData.description && formData.description.length > 500) {
    errors.push('Beschreibung darf maximal 500 Zeichen lang sein');
  }

  return errors;
}