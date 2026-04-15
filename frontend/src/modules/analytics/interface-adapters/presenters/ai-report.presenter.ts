import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import { type SprintReportDetailResponse } from '../../entities/sprint-report/sprint-report.response.ts';
import { type AiReportTranslations } from './ai-report.translations.ts';
import { type AiReportViewModel } from './ai-report.view-model.schema.ts';

export interface AiReportPresenterInput {
  detail: SprintReportDetailResponse | null;
  isGenerating: boolean;
  copyConfirmation: string | null;
}

export class AiReportPresenter
  implements Presenter<AiReportPresenterInput, AiReportViewModel>
{
  constructor(private readonly translations: AiReportTranslations) {}

  present(input: AiReportPresenterInput): AiReportViewModel {
    const hasDetail = input.detail !== null;
    return {
      showReport: hasDetail,
      showEmpty: !hasDetail,
      reportMarkdown: input.detail?.markdown ?? '',
      generatedAtLabel: input.detail
        ? `${this.translations.generatedAtPrefix} ${input.detail.generatedAt}`
        : '',
      emptyMessage: this.translations.emptyMessage,
      generateLabel: this.translations.generateLabel,
      generatingLabel: this.translations.generatingLabel,
      exportLabel: this.translations.exportLabel,
      copyLabel: this.translations.copyLabel,
      exportFilename: this.buildExportFilename(input.detail?.cycleName ?? ''),
      isGenerating: input.isGenerating,
      copyConfirmation: input.copyConfirmation,
    };
  }

  private buildExportFilename(cycleName: string): string {
    const sanitized = cycleName
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    const suffix = sanitized.length > 0 ? sanitized : 'cycle';
    return `sprint-report-${suffix}.md`;
  }
}
