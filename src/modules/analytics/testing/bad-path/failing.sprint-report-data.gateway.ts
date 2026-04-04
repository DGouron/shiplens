import { GatewayError } from '@shared/foundation/gateway-error.js';
import {
  type SprintContext,
  SprintReportDataGateway,
  type TrendContext,
} from '../../entities/sprint-report/sprint-report-data.gateway.js';

export class FailingSprintReportDataGateway extends SprintReportDataGateway {
  async isSynchronized(): Promise<boolean> {
    throw new GatewayError('Gateway error: unable to check sync status');
  }

  async getSprintContext(): Promise<SprintContext> {
    throw new GatewayError('Gateway error: unable to fetch sprint context');
  }

  async getTrendContext(): Promise<TrendContext | null> {
    throw new GatewayError('Gateway error: unable to fetch trend context');
  }
}
