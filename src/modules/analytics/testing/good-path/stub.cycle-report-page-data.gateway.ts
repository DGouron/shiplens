import {
  type CycleIssueDetail,
  type CycleSummary,
} from '../../entities/cycle-report-page/cycle-report-page.schema.js';
import { CycleReportPageDataGateway } from '../../entities/cycle-report-page/cycle-report-page-data.gateway.js';

export class StubCycleReportPageDataGateway extends CycleReportPageDataGateway {
  cycles: CycleSummary[] = [];
  issues: CycleIssueDetail[] = [];
  synchronized = true;

  async listCycles(): Promise<CycleSummary[]> {
    return this.cycles;
  }

  async getCycleIssues(): Promise<CycleIssueDetail[]> {
    return this.issues;
  }

  async isSynchronized(): Promise<boolean> {
    return this.synchronized;
  }
}
