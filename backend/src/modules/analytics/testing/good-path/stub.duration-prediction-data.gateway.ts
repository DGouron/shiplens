import { DurationPredictionDataGateway } from '../../entities/duration-prediction/duration-prediction-data.gateway.js';

export class StubDurationPredictionDataGateway extends DurationPredictionDataGateway {
  completedCycleCount = 3;
  similarIssuesCycleTimes: number[] = [2, 3, 4, 5, 6];

  async getCompletedCycleCount(): Promise<number> {
    return this.completedCycleCount;
  }

  async getSimilarIssuesCycleTimes(
    _teamId?: string,
    _issueExternalId?: string,
    _startedStatuses?: readonly string[],
    _completedStatuses?: readonly string[],
  ): Promise<number[]> {
    return this.similarIssuesCycleTimes;
  }
}
