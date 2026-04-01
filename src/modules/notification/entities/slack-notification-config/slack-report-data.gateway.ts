export interface SlackReportSummary {
  reportId: string;
  cycleName: string;
  teamId: string;
  executiveSummary: string;
  highlights: string;
  risks: string;
  generatedAt: string;
}

export abstract class SlackReportDataGateway {
  abstract findLatestByCycleAndTeam(
    cycleId: string,
    teamId: string,
  ): Promise<SlackReportSummary | null>;
}
