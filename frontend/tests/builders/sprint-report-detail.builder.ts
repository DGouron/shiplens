import { type SprintReportDetailResponse } from '@/modules/analytics/entities/sprint-report/sprint-report.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class SprintReportDetailBuilder extends EntityBuilder<
  SprintReportDetailResponse,
  SprintReportDetailResponse
> {
  constructor() {
    super({
      id: 'report-1',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      language: 'EN',
      generatedAt: '2026-04-01T10:00:00.000Z',
      markdown: '# Cycle 1\n\nSummary content.',
      plainText: 'Cycle 1\nSummary content.',
    });
  }

  withId(id: string): this {
    this.props.id = id;
    return this;
  }

  withCycleId(cycleId: string): this {
    this.props.cycleId = cycleId;
    return this;
  }

  withCycleName(cycleName: string): this {
    this.props.cycleName = cycleName;
    return this;
  }

  withLanguage(language: string): this {
    this.props.language = language;
    return this;
  }

  withGeneratedAt(generatedAt: string): this {
    this.props.generatedAt = generatedAt;
    return this;
  }

  withMarkdown(markdown: string): this {
    this.props.markdown = markdown;
    return this;
  }

  withPlainText(plainText: string): this {
    this.props.plainText = plainText;
    return this;
  }

  build(): SprintReportDetailResponse {
    return { ...this.props };
  }
}
