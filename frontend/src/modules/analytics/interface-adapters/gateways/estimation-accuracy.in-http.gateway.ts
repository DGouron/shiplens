import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import {
  EstimationAccuracyGateway,
  type FetchEstimationAccuracyParams,
} from '../../entities/estimation-accuracy/estimation-accuracy.gateway.ts';
import { type EstimationAccuracyResponse } from '../../entities/estimation-accuracy/estimation-accuracy.response.ts';
import { estimationAccuracyResponseGuard } from './estimation-accuracy.response.guard.ts';

export class EstimationAccuracyInHttpGateway extends EstimationAccuracyGateway {
  async fetchEstimationAccuracy(
    params: FetchEstimationAccuracyParams,
  ): Promise<EstimationAccuracyResponse> {
    const teamSegment = encodeURIComponent(params.teamId);
    const cycleSegment = encodeURIComponent(params.cycleId);
    const path = `/api/analytics/teams/${teamSegment}/cycles/${cycleSegment}/estimation-accuracy`;
    const response = await fetch(path);
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch estimation accuracy: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = estimationAccuracyResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid estimation accuracy response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
