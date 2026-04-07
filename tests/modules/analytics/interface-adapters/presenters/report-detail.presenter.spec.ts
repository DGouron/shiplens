import { ReportDetailPresenter } from '@modules/analytics/interface-adapters/presenters/report-detail.presenter.js';
import { describe, expect, it } from 'vitest';
import { SprintReportBuilder } from '../../../../builders/sprint-report.builder.js';

describe('ReportDetailPresenter', () => {
  const presenter = new ReportDetailPresenter();

  it('presents a french report with french labels in french workspace', () => {
    const report = new SprintReportBuilder()
      .withCycleName('Sprint 12')
      .withLanguage('FR')
      .build();

    const result = presenter.present(report, 'fr');

    expect(result.markdown).toContain('# Sprint 12');
    expect(result.markdown).toContain('## Résumé');
    expect(result.markdown).toContain('## Tendances');
    expect(result.markdown).toContain('## Points forts');
    expect(result.markdown).toContain('## Risques');
    expect(result.markdown).toContain('## Recommandations');
    expect(result.markdown).toContain(report.executiveSummary);
  });

  it('presents a french report with plain text rendering in french workspace', () => {
    const report = new SprintReportBuilder()
      .withCycleName('Sprint 12')
      .withLanguage('FR')
      .build();

    const result = presenter.present(report, 'fr');

    expect(result.plainText).toContain('Sprint 12');
    expect(result.plainText).toContain('Résumé:');
    expect(result.plainText).toContain('Tendances:');
    expect(result.plainText).toContain('Points forts:');
    expect(result.plainText).toContain('Risques:');
    expect(result.plainText).toContain('Recommandations:');
    expect(result.plainText).not.toContain('#');
    expect(result.plainText).toContain(report.executiveSummary);
  });

  it('presents a report with english labels in english workspace', () => {
    const report = new SprintReportBuilder().withLanguage('EN').build();

    const result = presenter.present(report, 'en');

    expect(result.markdown).toContain('## Summary');
    expect(result.markdown).toContain('## Trends');
    expect(result.markdown).toContain('## Highlights');
    expect(result.markdown).toContain('## Risks');
    expect(result.markdown).toContain('## Recommendations');
    expect(result.plainText).toContain('Summary:');
  });

  it('uses workspace locale for labels regardless of report stored language', () => {
    const frenchReport = new SprintReportBuilder().withLanguage('FR').build();

    const result = presenter.present(frenchReport, 'en');

    expect(result.markdown).toContain('## Summary');
    expect(result.markdown).toContain('## Trends');
    expect(result.markdown).toContain('## Highlights');
    expect(result.markdown).toContain('## Risks');
    expect(result.markdown).toContain('## Recommendations');
  });

  it('uses fallback message when trends is null in french workspace', () => {
    const report = new SprintReportBuilder()
      .withLanguage('FR')
      .withTrends(null)
      .build();

    const result = presenter.present(report, 'fr');

    expect(result.markdown).toContain(
      "Pas d'historique disponible pour comparer la vélocité",
    );
    expect(result.plainText).toContain(
      "Pas d'historique disponible pour comparer la vélocité",
    );
  });

  it('uses english fallback message when trends is null in english workspace', () => {
    const report = new SprintReportBuilder()
      .withLanguage('EN')
      .withTrends(null)
      .build();

    const result = presenter.present(report, 'en');

    expect(result.markdown).toContain(
      'No historical data available to compare velocity',
    );
  });

  it('uses workspace locale for no trend message regardless of report language', () => {
    const frenchReport = new SprintReportBuilder()
      .withLanguage('FR')
      .withTrends(null)
      .build();

    const result = presenter.present(frenchReport, 'en');

    expect(result.markdown).toContain(
      'No historical data available to compare velocity',
    );
  });

  it('includes metadata in the dto', () => {
    const report = new SprintReportBuilder()
      .withCycleName('Sprint 12')
      .withLanguage('FR')
      .withGeneratedAt('2026-02-01T10:00:00.000Z')
      .build();

    const result = presenter.present(report, 'fr');

    expect(result.id).toBe(report.id);
    expect(result.cycleName).toBe('Sprint 12');
    expect(result.language).toBe('FR');
    expect(result.generatedAt).toBe('2026-02-01T10:00:00.000Z');
  });

  it('renders audit section in markdown with french labels in french workspace', () => {
    const report = new SprintReportBuilder()
      .withLanguage('FR')
      .withAuditSection({
        evaluatedRules: [
          {
            ruleName: 'Cycle time max',
            status: 'pass',
            measuredValue: 'Cycle time moyen : 3 jours',
            threshold: 'Cycle time moyen : 3 jours',
            recommendation: null,
          },
          {
            ruleName: 'Throughput min',
            status: 'fail',
            measuredValue: 'Throughput : 2',
            threshold: 'Throughput : 2',
            recommendation: 'Augmenter le throughput.',
          },
        ],
        checklistItems: [{ name: 'Code review' }],
        adherenceScore: 50,
        trend: {
          scores: [60, 70],
          message: '60% -> 70% -> 50%',
        },
      })
      .build();

    const result = presenter.present(report, 'fr');

    expect(result.markdown).toContain('## Audit des pratiques');
    expect(result.markdown).toContain("Score d'adhérence : 50%");
    expect(result.markdown).toContain('Tendance : 60% -> 70% -> 50%');
    expect(result.markdown).toContain('Cycle time max');
    expect(result.markdown).toContain('pass');
    expect(result.markdown).toContain('fail');
    expect(result.markdown).toContain('Augmenter le throughput.');
    expect(result.markdown).toContain('Code review');
    expect(result.markdown).toContain('| Règle | Statut | Valeur mesurée |');
  });

  it('renders audit section in markdown with english labels in english workspace', () => {
    const report = new SprintReportBuilder()
      .withLanguage('EN')
      .withAuditSection({
        evaluatedRules: [
          {
            ruleName: 'Cycle time max',
            status: 'pass',
            measuredValue: 'Average cycle time: 3 days',
            threshold: 'Average cycle time: 3 days',
            recommendation: null,
          },
        ],
        checklistItems: [],
        adherenceScore: 100,
        trend: {
          scores: [60, 70, 80],
          message: '60% -> 70% -> 80% -> 100%',
        },
      })
      .build();

    const result = presenter.present(report, 'en');

    expect(result.markdown).toContain('## Practice audit');
    expect(result.markdown).toContain('Adherence score: 100%');
    expect(result.markdown).toContain('Trend: 60% -> 70% -> 80% -> 100%');
    expect(result.markdown).toContain('| Rule | Status | Measured value |');
  });

  it('renders audit no trend message in english workspace', () => {
    const report = new SprintReportBuilder()
      .withAuditSection({
        evaluatedRules: [
          {
            ruleName: 'Rule 1',
            status: 'pass',
            measuredValue: 'Val',
            threshold: 'Threshold',
            recommendation: null,
          },
        ],
        checklistItems: [],
        adherenceScore: 100,
        trend: null,
      })
      .build();

    const result = presenter.present(report, 'en');

    expect(result.markdown).toContain('Not enough history to display trend.');
  });

  it('renders audit no trend message in french workspace', () => {
    const report = new SprintReportBuilder()
      .withLanguage('FR')
      .withAuditSection({
        evaluatedRules: [
          {
            ruleName: 'Rule 1',
            status: 'pass',
            measuredValue: 'Val',
            threshold: 'Seuil',
            recommendation: null,
          },
        ],
        checklistItems: [],
        adherenceScore: 100,
        trend: null,
      })
      .build();

    const result = presenter.present(report, 'fr');

    expect(result.markdown).toContain(
      "Pas assez d'historique pour afficher la tendance.",
    );
  });

  it('renders audit recommendations label in english workspace', () => {
    const report = new SprintReportBuilder()
      .withAuditSection({
        evaluatedRules: [
          {
            ruleName: 'Throughput min',
            status: 'fail',
            measuredValue: 'Throughput: 2',
            threshold: 'Throughput: 2',
            recommendation: 'Increase throughput.',
          },
        ],
        checklistItems: [],
        adherenceScore: 0,
        trend: null,
      })
      .build();

    const result = presenter.present(report, 'en');

    expect(result.markdown).toContain('### Recommendations');
    expect(result.markdown).toContain('Increase throughput.');
  });

  it('renders audit recommendations label in french workspace', () => {
    const report = new SprintReportBuilder()
      .withLanguage('FR')
      .withAuditSection({
        evaluatedRules: [
          {
            ruleName: 'Throughput min',
            status: 'fail',
            measuredValue: 'Throughput : 2',
            threshold: 'Throughput : 2',
            recommendation: 'Augmenter le throughput.',
          },
        ],
        checklistItems: [],
        adherenceScore: 0,
        trend: null,
      })
      .build();

    const result = presenter.present(report, 'fr');

    expect(result.markdown).toContain('### Recommandations');
    expect(result.markdown).toContain('Augmenter le throughput.');
  });

  it('does not render audit section when null', () => {
    const report = new SprintReportBuilder().build();

    const result = presenter.present(report, 'fr');

    expect(result.markdown).not.toContain('Audit des pratiques');
  });

  it('renders plain text audit section with english labels in english workspace', () => {
    const report = new SprintReportBuilder()
      .withAuditSection({
        evaluatedRules: [
          {
            ruleName: 'Cycle time max',
            status: 'pass',
            measuredValue: 'Average cycle time: 3 days',
            threshold: 'Average cycle time: 3 days',
            recommendation: null,
          },
        ],
        checklistItems: [],
        adherenceScore: 100,
        trend: null,
      })
      .build();

    const result = presenter.present(report, 'en');

    expect(result.plainText).toContain('Practice audit:');
    expect(result.plainText).toContain('Adherence score: 100%');
    expect(result.plainText).toContain('Not enough history to display trend.');
  });

  it('renders plain text audit section with french labels in french workspace', () => {
    const report = new SprintReportBuilder()
      .withLanguage('FR')
      .withAuditSection({
        evaluatedRules: [
          {
            ruleName: 'Cycle time max',
            status: 'pass',
            measuredValue: 'Cycle time moyen : 3 jours',
            threshold: 'Cycle time moyen : 3 jours',
            recommendation: null,
          },
        ],
        checklistItems: [],
        adherenceScore: 100,
        trend: null,
      })
      .build();

    const result = presenter.present(report, 'fr');

    expect(result.plainText).toContain('Audit des pratiques:');
    expect(result.plainText).toContain("Score d'adhérence : 100%");
    expect(result.plainText).toContain(
      "Pas assez d'historique pour afficher la tendance.",
    );
  });
});
