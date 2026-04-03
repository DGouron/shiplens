import { SprintReportGateway } from '../../entities/sprint-report/sprint-report.gateway.js';
import { type SprintReport } from '../../entities/sprint-report/sprint-report.js';

export class StubSprintReportGateway extends SprintReportGateway {
  private reports: SprintReport[] = [];

  async save(report: SprintReport): Promise<void> {
    this.reports.push(report);
  }

  async findByTeamId(teamId: string): Promise<SprintReport[]> {
    return this.reports
      .filter((report) => report.teamId === teamId)
      .sort((first, second) =>
        second.generatedAt.localeCompare(first.generatedAt),
      );
  }

  async findById(reportId: string): Promise<SprintReport | null> {
    return this.reports.find((report) => report.id === reportId) ?? null;
  }
}
