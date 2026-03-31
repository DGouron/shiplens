import { type SprintReportProps } from './sprint-report.schema.js';
import { sprintReportGuard } from './sprint-report.guard.js';

export class SprintReport {
  private constructor(private readonly props: SprintReportProps) {}

  static create(props: unknown): SprintReport {
    const validatedProps = sprintReportGuard.parse(props);
    return new SprintReport(validatedProps);
  }

  get cycleId(): string {
    return this.props.cycleId;
  }

  get teamId(): string {
    return this.props.teamId;
  }

  get cycleName(): string {
    return this.props.cycleName;
  }

  get language(): string {
    return this.props.language;
  }

  get executiveSummary(): string {
    return this.props.sections.executiveSummary;
  }

  get trends(): string | null {
    return this.props.sections.trends;
  }

  get highlights(): string {
    return this.props.sections.highlights;
  }

  get risks(): string {
    return this.props.sections.risks;
  }

  get recommendations(): string {
    return this.props.sections.recommendations;
  }
}
