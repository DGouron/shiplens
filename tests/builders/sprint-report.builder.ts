import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';
import { SprintReport } from '@modules/analytics/entities/sprint-report/sprint-report.js';
import { type SprintReportProps } from '@modules/analytics/entities/sprint-report/sprint-report.schema.js';

const defaultProps: SprintReportProps = {
  cycleId: 'cycle-1',
  teamId: 'team-1',
  cycleName: 'Sprint 10',
  language: 'FR',
  sections: {
    executiveSummary: 'Le sprint s\'est bien déroulé avec une vélocité stable.',
    trends: 'La vélocité est en hausse de 10% par rapport aux 3 derniers sprints.',
    highlights: 'Migration de la base de données terminée en avance.',
    risks: 'Deux issues critiques restent ouvertes.',
    recommendations: 'Prioriser la résolution des issues critiques au prochain sprint.',
  },
};

export class SprintReportBuilder extends EntityBuilder<
  SprintReportProps,
  SprintReport
> {
  constructor() {
    super(defaultProps);
  }

  withCycleId(cycleId: string): this {
    this.props.cycleId = cycleId;
    return this;
  }

  withTeamId(teamId: string): this {
    this.props.teamId = teamId;
    return this;
  }

  withCycleName(cycleName: string): this {
    this.props.cycleName = cycleName;
    return this;
  }

  withLanguage(language: 'FR' | 'EN'): this {
    this.props.language = language;
    return this;
  }

  withTrends(trends: string | null): this {
    this.props.sections = { ...this.props.sections, trends };
    return this;
  }

  build(): SprintReport {
    return SprintReport.create({ ...this.props });
  }
}
