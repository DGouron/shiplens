import { DurationPredictionDataGateway } from '../../entities/duration-prediction/duration-prediction-data.gateway.js';

export class StubDurationPredictionDataGateway extends DurationPredictionDataGateway {
  completedCycleCount = 3;
  similarIssuesCycleTimes: number[] = [2, 3, 4, 5, 6];

  async getCompletedCycleCount(): Promise<number> {
    return this.completedCycleCount;
  }

  async getSimilarIssuesCycleTimes(): Promise<number[]> {
    return this.similarIssuesCycleTimes;
  }
}
