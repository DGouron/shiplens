export abstract class DurationPredictionDataGateway {
  abstract getCompletedCycleCount(teamId: string): Promise<number>;
  abstract getSimilarIssuesCycleTimes(
    teamId: string,
    issueExternalId: string,
  ): Promise<number[]>;
}
