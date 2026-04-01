import { describe, it, expect } from 'vitest';
import { SprintReportPresenter } from '@modules/analytics/interface-adapters/presenters/sprint-report.presenter.js';
import { SprintReportBuilder } from '../../../../builders/sprint-report.builder.js';

describe('SprintReportPresenter', () => {
  const presenter = new SprintReportPresenter();

  it('presents a full report with all sections', () => {
    const report = new SprintReportBuilder().build();

    const dto = presenter.present(report);

    expect(dto.cycleName).toBe('Sprint 10');
    expect(dto.language).toBe('FR');
    expect(dto.executiveSummary).toBeTruthy();
    expect(dto.trends).toBeTruthy();
    expect(dto.highlights).toBeTruthy();
    expect(dto.risks).toBeTruthy();
    expect(dto.recommendations).toBeTruthy();
  });

  it('presents null trends as absence message in french', () => {
    const report = new SprintReportBuilder()
      .withTrends(null)
      .build();

    const dto = presenter.present(report);

    expect(dto.trends).toBe(
      "Pas d'historique disponible pour comparer la vélocité",
    );
  });

  it('presents null trends as absence message in english', () => {
    const report = new SprintReportBuilder()
      .withLanguage('EN')
      .withTrends(null)
      .build();

    const dto = presenter.present(report);

    expect(dto.trends).toBe(
      'No historical data available to compare velocity',
    );
  });

  it('presents audit section when present', () => {
    const report = new SprintReportBuilder()
      .withAuditSection({
        evaluatedRules: [
          {
            ruleName: 'Cycle time max',
            status: 'pass',
            measuredValue: '3 jours',
            threshold: '5 jours',
            recommendation: null,
          },
        ],
        checklistItems: [{ name: 'Code review' }],
        adherenceScore: 100,
        trend: null,
      })
      .build();

    const dto = presenter.present(report);

    expect(dto.auditSection).not.toBeNull();
    expect(dto.auditSection?.adherenceScore).toBe(100);
    expect(dto.auditSection?.evaluatedRules).toHaveLength(1);
  });

  it('presents null audit section when not present', () => {
    const report = new SprintReportBuilder().build();

    const dto = presenter.present(report);

    expect(dto.auditSection).toBeNull();
  });
});
