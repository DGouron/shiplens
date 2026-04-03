import { GatewayError } from '@shared/foundation/gateway-error.js';
import { SprintReportGateway } from '../../entities/sprint-report/sprint-report.gateway.js';
import { type SprintReport } from '../../entities/sprint-report/sprint-report.js';

export class FailingSprintReportGateway extends SprintReportGateway {
  async save(_report: SprintReport): Promise<void> {
    throw new GatewayError('Failed to save sprint report');
  }

  async findByTeamId(_teamId: string): Promise<SprintReport[]> {
    throw new GatewayError('Failed to find sprint reports');
  }

  async findById(_reportId: string): Promise<SprintReport | null> {
    throw new GatewayError('Failed to find sprint report');
  }
}
