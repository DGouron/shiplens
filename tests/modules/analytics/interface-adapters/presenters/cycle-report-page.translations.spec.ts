import { cycleReportPageTranslations } from '@modules/analytics/interface-adapters/presenters/cycle-report-page.translations.js';
import { describe, expect, it } from 'vitest';

describe('cycleReportPageTranslations', () => {
  it('has translations for both en and fr locales', () => {
    expect(cycleReportPageTranslations).toHaveProperty('en');
    expect(cycleReportPageTranslations).toHaveProperty('fr');
  });

  it('en and fr have the same keys', () => {
    const englishKeys = Object.keys(cycleReportPageTranslations.en).sort();
    const frenchKeys = Object.keys(cycleReportPageTranslations.fr).sort();

    expect(englishKeys).toEqual(frenchKeys);
  });

  it('no translation value is empty string', () => {
    for (const [key, value] of Object.entries(cycleReportPageTranslations.en)) {
      expect(value, `en.${key} should not be empty`).not.toBe('');
    }
    for (const [key, value] of Object.entries(cycleReportPageTranslations.fr)) {
      expect(value, `fr.${key} should not be empty`).not.toBe('');
    }
  });

  it('english page title and nav match spec', () => {
    const english = cycleReportPageTranslations.en;

    expect(english.pageTitle).toBe('Cycle Report');
    expect(english.breadcrumbDashboard).toBe('Dashboard');
    expect(english.navSettings).toBe('Settings');
    expect(english.themeToggleTitle).toBe('Toggle theme');
  });

  it('french page title and nav match spec', () => {
    const french = cycleReportPageTranslations.fr;

    expect(french.pageTitle).toBe('Rapport de cycle');
    expect(french.breadcrumbDashboard).toBe('Dashboard');
    expect(french.navSettings).toBe('Settings');
    expect(french.themeToggleTitle).toBe('Changer de theme');
  });

  it('english selector texts match spec', () => {
    const english = cycleReportPageTranslations.en;

    expect(english.loadingCycles).toBe('Loading cycles...');
    expect(english.wholeTeam).toBe('Whole team');
    expect(english.selectCycle).toBe('Select a cycle...');
  });

  it('french selector texts match spec', () => {
    const french = cycleReportPageTranslations.fr;

    expect(french.loadingCycles).toBe('Chargement des cycles...');
    expect(french.wholeTeam).toBe("Toute l'equipe");
    expect(french.selectCycle).toBe('Selectionnez un cycle...');
  });

  it('english section titles match spec', () => {
    const english = cycleReportPageTranslations.en;

    expect(english.sectionMetrics).toBe('Metrics');
    expect(english.sectionMemberMetrics).toBe('Member metrics');
    expect(english.sectionBottlenecks).toBe('Bottlenecks');
    expect(english.sectionBlockedIssues).toBe('Blocked issues');
    expect(english.sectionEstimation).toBe('Estimation accuracy');
    expect(english.sectionDigest).toBe('AI member digest');
    expect(english.sectionReport).toBe('AI Report');
  });

  it('french section titles match spec', () => {
    const french = cycleReportPageTranslations.fr;

    expect(french.sectionMetrics).toBe('Metriques');
    expect(french.sectionMemberMetrics).toBe('Metriques membre');
    expect(french.sectionBottlenecks).toBe("Goulots d'etranglement");
    expect(french.sectionBlockedIssues).toBe('Issues bloquees');
    expect(french.sectionEstimation).toBe("Precision d'estimation");
    expect(french.sectionDigest).toBe('Digest IA membre');
    expect(french.sectionReport).toBe('Rapport IA');
  });

  it('english metric labels match spec', () => {
    const english = cycleReportPageTranslations.en;

    expect(english.metricVelocity).toBe('Velocity');
    expect(english.metricThroughput).toBe('Throughput');
    expect(english.metricCompletionRate).toBe('Completion rate');
    expect(english.metricScopeCreep).toBe('Scope creep');
    expect(english.metricCycleTime).toBe('Average cycle time');
    expect(english.metricLeadTime).toBe('Average lead time');
  });

  it('french metric labels match spec', () => {
    const french = cycleReportPageTranslations.fr;

    expect(french.metricVelocity).toBe('Velocite');
    expect(french.metricThroughput).toBe('Throughput');
    expect(french.metricCompletionRate).toBe('Taux de completion');
    expect(french.metricScopeCreep).toBe('Scope creep');
    expect(french.metricCycleTime).toBe('Cycle time moyen');
    expect(french.metricLeadTime).toBe('Lead time moyen');
  });

  it('english bottleneck headers match spec', () => {
    const english = cycleReportPageTranslations.en;

    expect(english.headerStatus).toBe('Status');
    expect(english.headerMedianTime).toBe('Median time');
  });

  it('french bottleneck headers match spec', () => {
    const french = cycleReportPageTranslations.fr;

    expect(french.headerStatus).toBe('Statut');
    expect(french.headerMedianTime).toBe('Temps median');
  });

  it('english estimation labels match spec', () => {
    const english = cycleReportPageTranslations.en;

    expect(english.classificationWellEstimated).toBe('Well estimated');
    expect(english.classificationOverEstimated).toBe('Over-estimated');
    expect(english.classificationUnderEstimated).toBe('Under-estimated');
  });

  it('french estimation labels match spec', () => {
    const french = cycleReportPageTranslations.fr;

    expect(french.classificationWellEstimated).toBe('Bien estimee');
    expect(french.classificationOverEstimated).toBe('Sur-estimee');
    expect(french.classificationUnderEstimated).toBe('Sous-estimee');
  });

  it('english buttons match spec', () => {
    const english = cycleReportPageTranslations.en;

    expect(english.buttonGenerateReport).toBe('Generate report');
    expect(english.buttonExport).toBe('Export');
    expect(english.buttonCopy).toBe('Copy');
    expect(english.buttonRegenerate).toBe('Regenerate');
    expect(english.buttonRetry).toBe('Retry');
    expect(english.buttonDetect).toBe('Detect');
    expect(english.buttonGenerateDigest).toBe('Generate digest');
  });

  it('french buttons match spec', () => {
    const french = cycleReportPageTranslations.fr;

    expect(french.buttonGenerateReport).toBe('Generer le rapport');
    expect(french.buttonExport).toBe('Export');
    expect(french.buttonCopy).toBe('Copier');
    expect(french.buttonRegenerate).toBe('Regenerer');
    expect(french.buttonRetry).toBe('Reessayer');
    expect(french.buttonDetect).toBe('Relancer la detection');
    expect(french.buttonGenerateDigest).toBe('Generer le digest');
  });

  it('english report sections match spec', () => {
    const english = cycleReportPageTranslations.en;

    expect(english.reportSummary).toBe('Summary');
    expect(english.reportTrends).toBe('Trends');
    expect(english.reportHighlights).toBe('Highlights');
    expect(english.reportRisks).toBe('Risks');
    expect(english.reportRecommendations).toBe('Recommendations');
  });

  it('french report sections match spec', () => {
    const french = cycleReportPageTranslations.fr;

    expect(french.reportSummary).toBe('Resume');
    expect(french.reportTrends).toBe('Tendances');
    expect(french.reportHighlights).toBe('Points forts');
    expect(french.reportRisks).toBe('Risques');
    expect(french.reportRecommendations).toBe('Recommandations');
  });

  it('english toast match spec', () => {
    expect(cycleReportPageTranslations.en.toastReportCopied).toBe(
      'Report copied!',
    );
  });

  it('french toast match spec', () => {
    expect(cycleReportPageTranslations.fr.toastReportCopied).toBe(
      'Rapport copie !',
    );
  });
});
