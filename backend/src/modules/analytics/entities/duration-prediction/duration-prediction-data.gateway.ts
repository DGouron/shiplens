export abstract class DurationPredictionDataGateway {
  abstract getCompletedCycleCount(teamId: string): Promise<number>;
  abstract getSimilarIssuesCycleTimes(
    teamId: string,
    issueExternalId: string,
    startedStatuses: readonly string[],
    completedStatuses: readonly string[],
  ): Promise<number[]>;
}
