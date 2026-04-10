import { type SprintReport } from './sprint-report.js';

export abstract class SprintReportGateway {
  abstract save(report: SprintReport): Promise<void>;
  abstract findByTeamId(teamId: string): Promise<SprintReport[]>;
  abstract findById(reportId: string): Promise<SprintReport | null>;
}
