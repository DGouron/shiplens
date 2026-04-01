import {
  SlackReportDataGateway,
  type SlackReportSummary,
} from '../../entities/slack-notification-config/slack-report-data.gateway.js';

export class StubSlackReportDataGateway extends SlackReportDataGateway {
  reportSummary: SlackReportSummary | null = null;

  async findLatestByCycleAndTeam(
    _cycleId: string,
    _teamId: string,
  ): Promise<SlackReportSummary | null> {
    return this.reportSummary;
  }
}
