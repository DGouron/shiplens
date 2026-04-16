import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import {
  BottleneckAnalysisGateway,
  type FetchBottleneckAnalysisParams,
} from '../../entities/bottleneck-analysis/bottleneck-analysis.gateway.ts';
import { type BottleneckAnalysisResponse } from '../../entities/bottleneck-analysis/bottleneck-analysis.response.ts';
import { bottleneckAnalysisResponseGuard } from './bottleneck-analysis.response.guard.ts';

export class BottleneckAnalysisInHttpGateway extends BottleneckAnalysisGateway {
  async fetchBottleneckAnalysis(
    params: FetchBottleneckAnalysisParams,
  ): Promise<BottleneckAnalysisResponse> {
    const query = new URLSearchParams({
      teamId: params.teamId,
      includeComparison: 'false',
    });
    const path = `/analytics/cycles/${encodeURIComponent(params.cycleId)}/bottlenecks?${query.toString()}`;
    const response = await fetch(path);
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch bottleneck analysis: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = bottleneckAnalysisResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid bottleneck analysis response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
