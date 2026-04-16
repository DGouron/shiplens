import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import {
  CycleMetricsGateway,
  type FetchCycleMetricsParams,
} from '../../entities/cycle-metrics/cycle-metrics.gateway.ts';
import { type CycleMetricsResponse } from '../../entities/cycle-metrics/cycle-metrics.response.ts';
import { cycleMetricsResponseGuard } from './cycle-metrics.response.guard.ts';

export class CycleMetricsInHttpGateway extends CycleMetricsGateway {
  async fetchCycleMetrics(
    params: FetchCycleMetricsParams,
  ): Promise<CycleMetricsResponse> {
    const query = new URLSearchParams({ teamId: params.teamId });
    const path = `/analytics/cycles/${encodeURIComponent(params.cycleId)}/metrics?${query.toString()}`;
    const response = await fetch(path);
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch cycle metrics: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = cycleMetricsResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid cycle metrics response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
