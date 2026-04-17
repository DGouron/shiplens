import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { DriftGridGateway } from '../../entities/drift-grid/drift-grid.gateway.ts';
import { type DriftGridResponse } from '../../entities/drift-grid/drift-grid.response.ts';
import { driftGridResponseGuard } from './drift-grid.response.guard.ts';

export class DriftGridInHttpGateway extends DriftGridGateway {
  async getEntries(): Promise<DriftGridResponse> {
    const response = await fetch(
      '/analytics/drifting-issues/drift-grid/entries',
    );
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch drift grid entries: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = driftGridResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid drift grid response: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
