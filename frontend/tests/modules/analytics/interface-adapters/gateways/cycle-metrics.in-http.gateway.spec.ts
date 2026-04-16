import { afterEach, describe, expect, it, vi } from 'vitest';
import { CycleMetricsInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/cycle-metrics.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { CycleMetricsResponseBuilder } from '../../../../builders/cycle-metrics-response.builder.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('CycleMetricsInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches /analytics/cycles/:cycleId/metrics with teamId query param and returns the parsed response', async () => {
    const payload = new CycleMetricsResponseBuilder().build();
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => payload,
    });

    const gateway = new CycleMetricsInHttpGateway();
    const result = await gateway.fetchCycleMetrics({
      teamId: 'team-1',
      cycleId: 'cycle-42',
    });

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/cycles/cycle-42/metrics?teamId=team-1',
    );
  });

  it('throws GatewayError on non-OK HTTP response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const gateway = new CycleMetricsInHttpGateway();

    await expect(
      gateway.fetchCycleMetrics({ teamId: 'team-1', cycleId: 'cycle-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({ velocity: { completedPoints: 'oops' } }),
    });

    const gateway = new CycleMetricsInHttpGateway();

    await expect(
      gateway.fetchCycleMetrics({ teamId: 'team-1', cycleId: 'cycle-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('encodes teamId and cycleId in the URL', async () => {
    const payload = new CycleMetricsResponseBuilder().build();
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new CycleMetricsInHttpGateway();
    await gateway.fetchCycleMetrics({
      teamId: 'team with space',
      cycleId: 'cycle/1',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/cycles/cycle%2F1/metrics?teamId=team+with+space',
    );
  });
});
