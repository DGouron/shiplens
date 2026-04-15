import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { EstimationAccuracyGateway } from '../../entities/estimation-accuracy/estimation-accuracy.gateway.ts';

export class FailingEstimationAccuracyGateway extends EstimationAccuracyGateway {
  async fetchEstimationAccuracy(): Promise<never> {
    throw new GatewayError('Failed to fetch estimation accuracy');
  }
}
