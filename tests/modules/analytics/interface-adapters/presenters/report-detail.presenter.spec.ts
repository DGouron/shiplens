import { describe, it, expect } from 'vitest';
import { ReportDetailPresenter } from '@modules/analytics/interface-adapters/presenters/report-detail.presenter.js';
import { SprintReportBuilder } from '../../../../builders/sprint-report.builder.js';

describe('ReportDetailPresenter', () => {
  const presenter = new ReportDetailPresenter();

  it('presents a french report with markdown rendering', () => {
    const report = new SprintReportBuilder()
      .withCycleName('Sprint 12')
      .withLanguage('FR')
      .build();

    const result = presenter.present(report);

    expect(result.markdown).toContain('# Sprint 12');
    expect(result.markdown).toContain('## Résumé');
    expect(result.markdown).toContain('## Tendances');
    expect(result.markdown).toContain('## Points forts');
    expect(result.markdown).toContain('## Risques');
    expect(result.markdown).toContain('## Recommandations');
    expect(result.markdown).toContain(report.executiveSummary);
  });

  it('presents a french report with plain text rendering', () => {
    const report = new SprintReportBuilder()
      .withCycleName('Sprint 12')
      .withLanguage('FR')
      .build();

    const result = presenter.present(report);

    expect(result.plainText).toContain('Sprint 12');
    expect(result.plainText).toContain('Résumé:');
    expect(result.plainText).toContain('Tendances:');
    expect(result.plainText).toContain('Points forts:');
    expect(result.plainText).toContain('Risques:');
    expect(result.plainText).toContain('Recommandations:');
    expect(result.plainText).not.toContain('#');
    expect(result.plainText).toContain(report.executiveSummary);
  });

  it('presents an english report with english section labels', () => {
    const report = new SprintReportBuilder().withLanguage('EN').build();

    const result = presenter.present(report);

    expect(result.markdown).toContain('## Summary');
    expect(result.markdown).toContain('## Trends');
    expect(result.markdown).toContain('## Highlights');
    expect(result.markdown).toContain('## Risks');
    expect(result.markdown).toContain('## Recommendations');
    expect(result.plainText).toContain('Summary:');
  });

  it('uses fallback message when trends is null for french report', () => {
    const report = new SprintReportBuilder()
      .withLanguage('FR')
      .withTrends(null)
      .build();

    const result = presenter.present(report);

    expect(result.markdown).toContain(
      "Pas d'historique disponible pour comparer la vélocité",
    );
    expect(result.plainText).toContain(
      "Pas d'historique disponible pour comparer la vélocité",
    );
  });

  it('uses english fallback message when trends is null for english report', () => {
    const report = new SprintReportBuilder()
      .withLanguage('EN')
      .withTrends(null)
      .build();

    const result = presenter.present(report);

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

    const result = presenter.present(report);

    expect(result.id).toBe(report.id);
    expect(result.cycleName).toBe('Sprint 12');
    expect(result.language).toBe('FR');
    expect(result.generatedAt).toBe('2026-02-01T10:00:00.000Z');
  });

  it('renders audit section in markdown when present', () => {
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
          message: '60% → 70% → 50%',
        },
      })
      .build();

    const result = presenter.present(report);

    expect(result.markdown).toContain('## Audit des pratiques');
    expect(result.markdown).toContain('50%');
    expect(result.markdown).toContain('60% → 70% → 50%');
    expect(result.markdown).toContain('Cycle time max');
    expect(result.markdown).toContain('pass');
    expect(result.markdown).toContain('fail');
    expect(result.markdown).toContain('Augmenter le throughput.');
    expect(result.markdown).toContain('Code review');
  });

  it('renders no trend message when trend is null', () => {
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

    const result = presenter.present(report);

    expect(result.markdown).toContain("Pas assez d'historique pour afficher la tendance.");
  });

  it('does not render audit section when null', () => {
    const report = new SprintReportBuilder().build();

    const result = presenter.present(report);

    expect(result.markdown).not.toContain('Audit des pratiques');
  });
});
