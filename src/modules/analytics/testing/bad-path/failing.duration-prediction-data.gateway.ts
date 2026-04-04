import { GatewayError } from '@shared/foundation/gateway-error.js';
import { DurationPredictionDataGateway } from '../../entities/duration-prediction/duration-prediction-data.gateway.js';

export class FailingDurationPredictionDataGateway extends DurationPredictionDataGateway {
  async getCompletedCycleCount(): Promise<number> {
    throw new GatewayError(
      'Gateway failure: unable to fetch completed cycle count',
    );
  }

  async getSimilarIssuesCycleTimes(): Promise<number[]> {
    throw new GatewayError(
      'Gateway failure: unable to fetch similar issues cycle times',
    );
  }
}
