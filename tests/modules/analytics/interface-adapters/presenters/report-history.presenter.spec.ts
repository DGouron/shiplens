import { ReportHistoryPresenter } from '@modules/analytics/interface-adapters/presenters/report-history.presenter.js';
import { describe, expect, it } from 'vitest';
import { SprintReportBuilder } from '../../../../builders/sprint-report.builder.js';

describe('ReportHistoryPresenter', () => {
  const presenter = new ReportHistoryPresenter();

  it('presents reports as history items', () => {
    const reports = [
      new SprintReportBuilder()
        .withCycleName('Sprint 12')
        .withGeneratedAt('2026-02-01T10:00:00.000Z')
        .build(),
      new SprintReportBuilder()
        .withCycleName('Sprint 11')
        .withGeneratedAt('2026-01-15T10:00:00.000Z')
        .build(),
    ];

    const result = presenter.present(reports);

    expect(result.reports).toHaveLength(2);
    expect(result.reports[0].cycleName).toBe('Sprint 12');
    expect(result.reports[0].generatedAt).toBe('2026-02-01T10:00:00.000Z');
    expect(result.reports[1].cycleName).toBe('Sprint 11');
    expect(result.emptyMessage).toBeNull();
  });

  it('includes id, cycleName, language and generatedAt for each item', () => {
    const report = new SprintReportBuilder()
      .withCycleName('Sprint 10')
      .withLanguage('EN')
      .withGeneratedAt('2026-01-01T10:00:00.000Z')
      .build();

    const result = presenter.present([report]);

    expect(result.reports[0]).toEqual({
      id: report.id,
      cycleName: 'Sprint 10',
      language: 'EN',
      generatedAt: '2026-01-01T10:00:00.000Z',
    });
  });

  it('returns empty message when no reports', () => {
    const result = presenter.present([]);

    expect(result.reports).toHaveLength(0);
    expect(result.emptyMessage).toBe(
      "Aucun rapport n'a encore été généré pour cette équipe.",
    );
  });
});
