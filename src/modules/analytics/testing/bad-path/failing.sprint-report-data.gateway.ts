import { SprintReportDataGateway, type SprintContext, type TrendContext } from '../../entities/sprint-report/sprint-report-data.gateway.js';

export class FailingSprintReportDataGateway extends SprintReportDataGateway {
  async isSynchronized(): Promise<boolean> {
    throw new Error('Gateway error: unable to check sync status');
  }

  async getSprintContext(): Promise<SprintContext> {
    throw new Error('Gateway error: unable to fetch sprint context');
  }

  async getTrendContext(): Promise<TrendContext | null> {
    throw new Error('Gateway error: unable to fetch trend context');
  }
}
