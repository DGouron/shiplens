import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { CycleMetricsGateway } from '../../entities/cycle-metrics/cycle-metrics.gateway.ts';

export class FailingCycleMetricsGateway extends CycleMetricsGateway {
  async fetchCycleMetrics(): Promise<never> {
    throw new GatewayError('Failed to fetch cycle metrics');
  }
}
