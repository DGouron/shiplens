import { afterEach, describe, expect, it, vi } from 'vitest';
import { BottleneckAnalysisInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/bottleneck-analysis.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { BottleneckAnalysisResponseBuilder } from '../../../../builders/bottleneck-analysis-response.builder.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('BottleneckAnalysisInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches /analytics/cycles/:cycleId/bottlenecks with teamId and includeComparison=false and returns the parsed response', async () => {
    const payload = new BottleneckAnalysisResponseBuilder().build();
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new BottleneckAnalysisInHttpGateway();
    const result = await gateway.fetchBottleneckAnalysis({
      teamId: 'team-1',
      cycleId: 'cycle-42',
    });

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/cycles/cycle-42/bottlenecks?teamId=team-1&includeComparison=false',
    );
  });

  it('throws GatewayError on non-OK HTTP response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const gateway = new BottleneckAnalysisInHttpGateway();

    await expect(
      gateway.fetchBottleneckAnalysis({ teamId: 'team-1', cycleId: 'cycle-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({ statusDistribution: 'oops' }),
    });

    const gateway = new BottleneckAnalysisInHttpGateway();

    await expect(
      gateway.fetchBottleneckAnalysis({ teamId: 'team-1', cycleId: 'cycle-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('encodes teamId and cycleId in the URL', async () => {
    const payload = new BottleneckAnalysisResponseBuilder().build();
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new BottleneckAnalysisInHttpGateway();
    await gateway.fetchBottleneckAnalysis({
      teamId: 'team with space',
      cycleId: 'cycle/1',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/cycles/cycle%2F1/bottlenecks?teamId=team+with+space&includeComparison=false',
    );
  });
});
