import { SlackReportDataGateway, type SlackReportSummary } from '../../entities/slack-notification-config/slack-report-data.gateway.js';
import { GatewayError } from '@shared/foundation/gateway-error.js';

export class FailingSlackReportDataGateway extends SlackReportDataGateway {
  async findLatestByCycleAndTeam(
    _cycleId: string,
    _teamId: string,
  ): Promise<SlackReportSummary | null> {
    throw new GatewayError('Failed to find report data');
  }
}
