import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { SprintReportGateway } from '../../entities/sprint-report/sprint-report.gateway.ts';

export class FailingSprintReportGateway extends SprintReportGateway {
  async listForTeam(): Promise<never> {
    throw new GatewayError('Failed to fetch sprint reports');
  }

  async getDetail(): Promise<never> {
    throw new GatewayError('Failed to fetch sprint report detail');
  }

  async generate(): Promise<never> {
    throw new GatewayError('Failed to generate sprint report');
  }
}
