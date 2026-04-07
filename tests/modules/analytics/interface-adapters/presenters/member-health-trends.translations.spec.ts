import { memberHealthTrendsTranslations } from '@modules/analytics/interface-adapters/presenters/member-health-trends.translations.js';
import { describe, expect, it } from 'vitest';

describe('memberHealthTrendsTranslations', () => {
  it('has translations for both en and fr locales', () => {
    expect(memberHealthTrendsTranslations).toHaveProperty('en');
    expect(memberHealthTrendsTranslations).toHaveProperty('fr');
  });

  it('en and fr have the same keys', () => {
    const englishKeys = Object.keys(memberHealthTrendsTranslations.en).sort();
    const frenchKeys = Object.keys(memberHealthTrendsTranslations.fr).sort();

    expect(englishKeys).toEqual(frenchKeys);
  });

  it('no translation value is empty string', () => {
    for (const [key, value] of Object.entries(
      memberHealthTrendsTranslations.en,
    )) {
      expect(value, `en.${key} should not be empty`).not.toBe('');
    }
    for (const [key, value] of Object.entries(
      memberHealthTrendsTranslations.fr,
    )) {
      expect(value, `fr.${key} should not be empty`).not.toBe('');
    }
  });

  it('english page texts match spec', () => {
    const english = memberHealthTrendsTranslations.en;

    expect(english.pageTitle).toBe('Health Trends');
    expect(english.backToCycleReport).toBe('Back to cycle report');
    expect(english.completedSprintsLabel).toBe('Completed sprints to analyze:');
  });

  it('french page texts match spec', () => {
    const french = memberHealthTrendsTranslations.fr;

    expect(french.pageTitle).toBe('Tendances de sante');
    expect(french.backToCycleReport).toBe('Retour au rapport de cycle');
    expect(french.completedSprintsLabel).toBe('Sprints termines a analyser :');
  });

  it('english signal labels match spec', () => {
    const english = memberHealthTrendsTranslations.en;

    expect(english.signalEstimationScore).toBe('Estimation Score');
    expect(english.signalUnderestimationRatio).toBe('Underestimation Ratio');
    expect(english.signalAverageCycleTime).toBe('Average Cycle Time');
    expect(english.signalDriftingTickets).toBe('Drifting Tickets');
    expect(english.signalMedianReviewTime).toBe('Median Review Time');
  });

  it('french signal labels match spec', () => {
    const french = memberHealthTrendsTranslations.fr;

    expect(french.signalEstimationScore).toBe("Score d'estimation");
    expect(french.signalUnderestimationRatio).toBe('Ratio de sous-estimation');
    expect(french.signalAverageCycleTime).toBe('Cycle time moyen');
    expect(french.signalDriftingTickets).toBe('Tickets en derive');
    expect(french.signalMedianReviewTime).toBe('Temps median de review');
  });

  it('english indicators match spec', () => {
    const english = memberHealthTrendsTranslations.en;

    expect(english.indicatorFavorable).toBe('Favorable trend');
    expect(english.indicatorMixed).toBe('First deviation or mixed');
    expect(english.indicatorUnfavorable).toBe('Unfavorable for 2+ sprints');
    expect(english.indicatorNotEnoughData).toBe('Not enough data');
  });

  it('french indicators match spec', () => {
    const french = memberHealthTrendsTranslations.fr;

    expect(french.indicatorFavorable).toBe('Tendance favorable');
    expect(french.indicatorMixed).toBe('Premiere deviation ou mixte');
    expect(french.indicatorUnfavorable).toBe('Defavorable depuis 2+ sprints');
    expect(french.indicatorNotEnoughData).toBe('Pas assez de donnees');
  });

  it('english empty and loading states match spec', () => {
    const english = memberHealthTrendsTranslations.en;

    expect(english.noDataAvailable).toBe('No data available for this member');
    expect(english.loadingHealthData).toBe('Loading health data...');
  });

  it('french empty and loading states match spec', () => {
    const french = memberHealthTrendsTranslations.fr;

    expect(french.noDataAvailable).toBe(
      'Aucune donnee disponible pour ce membre',
    );
    expect(french.loadingHealthData).toBe('Chargement des donnees de sante...');
  });
});
