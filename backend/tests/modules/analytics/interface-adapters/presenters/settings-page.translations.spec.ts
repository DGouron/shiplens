import { settingsPageTranslations } from '@modules/analytics/interface-adapters/presenters/settings-page.translations.js';
import { describe, expect, it } from 'vitest';

describe('settingsPageTranslations', () => {
  it('has translations for both en and fr locales', () => {
    expect(settingsPageTranslations).toHaveProperty('en');
    expect(settingsPageTranslations).toHaveProperty('fr');
  });

  it('en and fr have the same keys', () => {
    const englishKeys = Object.keys(settingsPageTranslations.en).sort();
    const frenchKeys = Object.keys(settingsPageTranslations.fr).sort();

    expect(englishKeys).toEqual(frenchKeys);
  });

  it('english section titles match spec', () => {
    const english = settingsPageTranslations.en;

    expect(english.timezoneTitle).toBe('Timezone');
    expect(english.excludedStatusesTitle).toBe(
      'Blocked issues — Excluded statuses',
    );
    expect(english.driftGridTitle).toBe(
      'Drift grid — Points to duration mapping',
    );
  });

  it('french section titles match spec', () => {
    const french = settingsPageTranslations.fr;

    expect(french.timezoneTitle).toBe('Fuseau horaire');
    expect(french.excludedStatusesTitle).toBe(
      'Issues bloquees — Statuts exclus',
    );
    expect(french.driftGridTitle).toBe(
      'Grille de derive — Correspondance points / duree',
    );
  });

  it('english team selector texts match spec', () => {
    const english = settingsPageTranslations.en;

    expect(english.teamSelectorEmpty).toBe('Select a team...');
    expect(english.teamSelectorLoading).toBe('Loading teams...');
  });

  it('french team selector texts match spec', () => {
    const french = settingsPageTranslations.fr;

    expect(french.teamSelectorEmpty).toBe('Selectionnez une equipe...');
    expect(french.teamSelectorLoading).toBe('Chargement des equipes...');
  });

  it('english toast messages match spec', () => {
    const english = settingsPageTranslations.en;

    expect(english.toastTimezoneSaved).toBe('Timezone saved');
    expect(english.toastStatusSaved).toBe('Settings saved');
    expect(english.toastLanguageSaved).toBe('Language saved');
  });

  it('french toast messages match spec', () => {
    const french = settingsPageTranslations.fr;

    expect(french.toastTimezoneSaved).toBe('Fuseau horaire sauvegarde');
    expect(french.toastStatusSaved).toBe('Parametres sauvegardes');
    expect(french.toastLanguageSaved).toBe('Langue sauvegardee');
  });

  it('english drift grid values match spec', () => {
    const english = settingsPageTranslations.en;

    expect(english.driftRow3Hours).toBe('8h (1 day)');
    expect(english.driftRow5Hours).toBe('20h (2-3 days)');
    expect(english.driftGridNote).toContain(
      'Tickets estimated at 8 points or more are flagged',
    );
  });

  it('french drift grid values match spec', () => {
    const french = settingsPageTranslations.fr;

    expect(french.driftRow3Hours).toBe('8h (1 jour)');
    expect(french.driftRow5Hours).toBe('20h (2-3 jours)');
    expect(french.driftGridNote).toContain(
      'Les tickets estimes a 8 points ou plus sont signales',
    );
  });

  it('english status labels match spec', () => {
    const english = settingsPageTranslations.en;

    expect(english.statusIncludedLabel).toBe('Analyzed');
    expect(english.statusExcludedLabel).toBe('Excluded');
  });

  it('french status labels match spec', () => {
    const french = settingsPageTranslations.fr;

    expect(french.statusIncludedLabel).toBe('Analyse');
    expect(french.statusExcludedLabel).toBe('Exclu');
  });

  it('english theme toggle tooltip matches spec', () => {
    expect(settingsPageTranslations.en.themeToggleTitle).toBe('Toggle theme');
  });

  it('french theme toggle tooltip matches spec', () => {
    expect(settingsPageTranslations.fr.themeToggleTitle).toBe(
      'Changer de theme',
    );
  });

  it('no translation value is empty string', () => {
    for (const [key, value] of Object.entries(settingsPageTranslations.en)) {
      expect(value, `en.${key} should not be empty`).not.toBe('');
    }
    for (const [key, value] of Object.entries(settingsPageTranslations.fr)) {
      expect(value, `fr.${key} should not be empty`).not.toBe('');
    }
  });
});
