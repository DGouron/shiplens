import { afterEach, describe, expect, it, vi } from 'vitest';
import { EstimationAccuracyInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/estimation-accuracy.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { EstimationAccuracyResponseBuilder } from '../../../../builders/estimation-accuracy-response.builder.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('EstimationAccuracyInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches the /api/analytics/teams/:teamId/cycles/:cycleId/estimation-accuracy endpoint and returns the parsed response', async () => {
    const payload = new EstimationAccuracyResponseBuilder().build();
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new EstimationAccuracyInHttpGateway();
    const result = await gateway.fetchEstimationAccuracy({
      teamId: 'team-1',
      cycleId: 'cycle-42',
    });

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/analytics/teams/team-1/cycles/cycle-42/estimation-accuracy',
    );
  });

  it('encodes path parameters safely', async () => {
    const payload = new EstimationAccuracyResponseBuilder().build();
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new EstimationAccuracyInHttpGateway();
    await gateway.fetchEstimationAccuracy({
      teamId: 'team with spaces',
      cycleId: 'cycle/1',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/analytics/teams/team%20with%20spaces/cycles/cycle%2F1/estimation-accuracy',
    );
  });

  it('throws GatewayError on non-OK HTTP response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const gateway = new EstimationAccuracyInHttpGateway();

    await expect(
      gateway.fetchEstimationAccuracy({ teamId: 'team-1', cycleId: 'cycle-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({ issues: 'oops' }),
    });

    const gateway = new EstimationAccuracyInHttpGateway();

    await expect(
      gateway.fetchEstimationAccuracy({ teamId: 'team-1', cycleId: 'cycle-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
