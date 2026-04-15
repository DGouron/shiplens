import { describe, expect, it } from 'vitest';
import { AiReportPresenter } from '@/modules/analytics/interface-adapters/presenters/ai-report.presenter.ts';
import { aiReportTranslations } from '@/modules/analytics/interface-adapters/presenters/ai-report.translations.ts';
import { type Locale } from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.translations.ts';
import { SprintReportDetailBuilder } from '../../../../builders/sprint-report-detail.builder.ts';

function makePresenter(locale: Locale = 'en') {
  return new AiReportPresenter(aiReportTranslations[locale]);
}

describe('AiReportPresenter', () => {
  it('exposes showReport true and the raw markdown when a detail is provided', () => {
    const detail = new SprintReportDetailBuilder()
      .withCycleName('Cycle 12')
      .withMarkdown('# Cycle 12\n\nContent.')
      .withGeneratedAt('2026-04-10T08:30:00.000Z')
      .build();

    const viewModel = makePresenter().present({
      detail,
      isGenerating: false,
      copyConfirmation: null,
    });

    expect(viewModel.showReport).toBe(true);
    expect(viewModel.showEmpty).toBe(false);
    expect(viewModel.reportMarkdown).toBe('# Cycle 12\n\nContent.');
    expect(viewModel.generatedAtLabel).toBe(
      'Generated at 2026-04-10T08:30:00.000Z',
    );
  });

  it('exposes showEmpty true and an empty markdown when no detail is provided', () => {
    const viewModel = makePresenter().present({
      detail: null,
      isGenerating: false,
      copyConfirmation: null,
    });

    expect(viewModel.showReport).toBe(false);
    expect(viewModel.showEmpty).toBe(true);
    expect(viewModel.reportMarkdown).toBe('');
    expect(viewModel.emptyMessage).toBe('No report generated for this cycle');
  });

  it('sanitizes the cycle name when building the export filename', () => {
    const detail = new SprintReportDetailBuilder()
      .withCycleName('Cycle 12 - Quarter One')
      .build();

    const viewModel = makePresenter().present({
      detail,
      isGenerating: false,
      copyConfirmation: null,
    });

    expect(viewModel.exportFilename).toBe(
      'sprint-report-cycle-12-quarter-one.md',
    );
  });

  it('falls back to a generic filename when no detail is available', () => {
    const viewModel = makePresenter().present({
      detail: null,
      isGenerating: false,
      copyConfirmation: null,
    });

    expect(viewModel.exportFilename).toBe('sprint-report-cycle.md');
  });

  it('propagates the generating flag to the view model', () => {
    const viewModel = makePresenter().present({
      detail: null,
      isGenerating: true,
      copyConfirmation: null,
    });

    expect(viewModel.isGenerating).toBe(true);
  });

  it('propagates the copy confirmation string to the view model', () => {
    const viewModel = makePresenter().present({
      detail: new SprintReportDetailBuilder().build(),
      isGenerating: false,
      copyConfirmation: 'Report copied!',
    });

    expect(viewModel.copyConfirmation).toBe('Report copied!');
  });

  it('exposes French translations under the fr locale', () => {
    const viewModel = makePresenter('fr').present({
      detail: null,
      isGenerating: false,
      copyConfirmation: null,
    });

    expect(viewModel.emptyMessage).toBe('Aucun rapport genere pour ce cycle');
    expect(viewModel.generateLabel).toBe('Generer le rapport');
  });
});
