import { type CycleSummary, type CycleIssueDetail } from './cycle-report-page.schema.js';

export abstract class CycleReportPageDataGateway {
  abstract listCycles(teamId: string): Promise<CycleSummary[]>;
  abstract getCycleIssues(cycleId: string, teamId: string): Promise<CycleIssueDetail[]>;
  abstract isSynchronized(teamId: string): Promise<boolean>;
}
