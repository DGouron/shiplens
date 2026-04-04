import { GatewayError } from '@shared/foundation/gateway-error.js';
import { type BottleneckAnalysisProps } from '../../entities/bottleneck-analysis/bottleneck-analysis.schema.js';
import { BottleneckAnalysisDataGateway } from '../../entities/bottleneck-analysis/bottleneck-analysis-data.gateway.js';

export class FailingBottleneckAnalysisDataGateway extends BottleneckAnalysisDataGateway {
  async getBottleneckData(): Promise<BottleneckAnalysisProps> {
    throw new GatewayError('Gateway error: unable to fetch bottleneck data');
  }

  async getPreviousCycleId(): Promise<string | null> {
    throw new GatewayError('Gateway error: unable to fetch previous cycle');
  }

  async hasSynchronizedData(): Promise<boolean> {
    throw new GatewayError('Gateway error: unable to check synchronized data');
  }
}
