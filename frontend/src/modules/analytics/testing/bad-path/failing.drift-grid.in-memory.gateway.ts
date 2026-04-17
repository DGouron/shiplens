import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { DriftGridGateway } from '../../entities/drift-grid/drift-grid.gateway.ts';

export class FailingDriftGridGateway extends DriftGridGateway {
  async getEntries(): Promise<never> {
    throw new GatewayError('Failed to fetch drift grid entries');
  }
}
