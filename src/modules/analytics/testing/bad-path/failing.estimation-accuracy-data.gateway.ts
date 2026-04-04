import { GatewayError } from '@shared/foundation/gateway-error.js';
import { type EstimationAccuracyProps } from '../../entities/estimation-accuracy/estimation-accuracy.schema.js';
import { EstimationAccuracyDataGateway } from '../../entities/estimation-accuracy/estimation-accuracy-data.gateway.js';

export class FailingEstimationAccuracyDataGateway extends EstimationAccuracyDataGateway {
  async getEstimationData(): Promise<EstimationAccuracyProps> {
    throw new GatewayError('Gateway error: unable to fetch estimation data');
  }

  async getCompletedCycleIds(): Promise<string[]> {
    throw new GatewayError(
      'Gateway error: unable to fetch completed cycle ids',
    );
  }
}
