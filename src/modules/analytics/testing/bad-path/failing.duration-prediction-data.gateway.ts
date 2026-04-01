import { DurationPredictionDataGateway } from '../../entities/duration-prediction/duration-prediction-data.gateway.js';

export class FailingDurationPredictionDataGateway extends DurationPredictionDataGateway {
  async getCompletedCycleCount(): Promise<number> {
    throw new Error('Gateway failure: unable to fetch completed cycle count');
  }

  async getSimilarIssuesCycleTimes(): Promise<number[]> {
    throw new Error('Gateway failure: unable to fetch similar issues cycle times');
  }
}
