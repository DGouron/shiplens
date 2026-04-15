import { type SprintReportHistoryItem } from '@/modules/analytics/entities/sprint-report/sprint-report.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class SprintReportHistoryItemBuilder extends EntityBuilder<
  SprintReportHistoryItem,
  SprintReportHistoryItem
> {
  constructor() {
    super({
      id: 'report-1',
      cycleName: 'Cycle 1',
      language: 'EN',
      generatedAt: '2026-04-01T10:00:00.000Z',
    });
  }

  withId(id: string): this {
    this.props.id = id;
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

  build(): SprintReportHistoryItem {
    return { ...this.props };
  }
}
