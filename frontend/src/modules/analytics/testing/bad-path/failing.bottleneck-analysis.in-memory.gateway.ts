import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { BottleneckAnalysisGateway } from '../../entities/bottleneck-analysis/bottleneck-analysis.gateway.ts';

export class FailingBottleneckAnalysisGateway extends BottleneckAnalysisGateway {
  async fetchBottleneckAnalysis(): Promise<never> {
    throw new GatewayError('Failed to fetch bottleneck analysis');
  }
}
