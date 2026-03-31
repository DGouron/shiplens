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
});
