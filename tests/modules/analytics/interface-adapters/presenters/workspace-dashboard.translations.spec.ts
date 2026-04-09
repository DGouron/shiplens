import { workspaceDashboardTranslations } from '@modules/analytics/interface-adapters/presenters/workspace-dashboard.translations.js';
import { describe, expect, it } from 'vitest';

describe('workspaceDashboardTranslations', () => {
  it('has translations for both en and fr locales', () => {
    expect(workspaceDashboardTranslations).toHaveProperty('en');
    expect(workspaceDashboardTranslations).toHaveProperty('fr');
  });

  it('en and fr have the same keys', () => {
    const englishKeys = Object.keys(workspaceDashboardTranslations.en).sort();
    const frenchKeys = Object.keys(workspaceDashboardTranslations.fr).sort();

    expect(englishKeys).toEqual(frenchKeys);
  });

  it('no translation value is empty string', () => {
    for (const [key, value] of Object.entries(
      workspaceDashboardTranslations.en,
    )) {
      expect(value, `en.${key} should not be empty`).not.toBe('');
    }
    for (const [key, value] of Object.entries(
      workspaceDashboardTranslations.fr,
    )) {
      expect(value, `fr.${key} should not be empty`).not.toBe('');
    }
  });

  it('english nav and page texts match spec', () => {
    const english = workspaceDashboardTranslations.en;

    expect(english.breadcrumbDashboard).toBe('Dashboard');
    expect(english.navSettings).toBe('Settings');
    expect(english.themeToggleTitle).toBe('Toggle theme');
    expect(english.pageTitle).toBe('Dashboard');
  });

  it('french nav and page texts match spec', () => {
    const french = workspaceDashboardTranslations.fr;

    expect(french.breadcrumbDashboard).toBe('Dashboard');
    expect(french.navSettings).toBe('Settings');
    expect(french.themeToggleTitle).toBe('Changer de theme');
    expect(french.pageTitle).toBe('Dashboard');
  });

  it('english sync labels match spec', () => {
    const english = workspaceDashboardTranslations.en;

    expect(english.lastSync).toBe('Last sync: ');
    expect(english.neverSynced).toBe('Never synced');
    expect(english.resynchronize).toBe('Resynchronize');
    expect(english.syncInProgress).toBe('Synchronization in progress...');
  });

  it('french sync labels match spec', () => {
    const french = workspaceDashboardTranslations.fr;

    expect(french.lastSync).toBe('Derniere sync : ');
    expect(french.neverSynced).toBe('Jamais synchronise');
    expect(french.resynchronize).toBe('Resynchroniser');
    expect(french.syncInProgress).toBe('Synchronisation en cours...');
  });

  it('english KPI labels match spec', () => {
    const english = workspaceDashboardTranslations.en;

    expect(english.kpiCompletion).toBe('Completion');
    expect(english.kpiVelocity).toBe('Velocity');
    expect(english.kpiBlockedIssues).toBe('Blocked issues');
  });

  it('french KPI labels match spec', () => {
    const french = workspaceDashboardTranslations.fr;

    expect(french.kpiCompletion).toBe('Completion');
    expect(french.kpiVelocity).toBe('Velocite');
    expect(french.kpiBlockedIssues).toBe('Issues bloquees');
  });

  it('english report link texts match spec', () => {
    const english = workspaceDashboardTranslations.en;

    expect(english.viewReport).toBe('View report');
    expect(english.noReportAvailable).toBe('No report available');
  });

  it('french report link texts match spec', () => {
    const french = workspaceDashboardTranslations.fr;

    expect(french.viewReport).toBe('Voir le rapport');
    expect(french.noReportAvailable).toBe('Aucun rapport disponible');
  });

  it('english loading and empty state texts match spec', () => {
    const english = workspaceDashboardTranslations.en;

    expect(english.loading).toBe('Loading...');
    expect(english.noActiveCycle).toBe('No active cycle');
    expect(english.errorUnknown).toBe('Unknown error');
  });

  it('french loading and empty state texts match spec', () => {
    const french = workspaceDashboardTranslations.fr;

    expect(french.loading).toBe('Chargement...');
    expect(french.noActiveCycle).toBe('Aucun cycle actif');
    expect(french.errorUnknown).toBe('Erreur inconnue');
  });
});
