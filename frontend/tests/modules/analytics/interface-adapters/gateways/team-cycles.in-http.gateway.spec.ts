import { afterEach, describe, expect, it, vi } from 'vitest';
import { TeamCyclesInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/team-cycles.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TeamCyclesResponseBuilder } from '../../../../builders/team-cycles-response.builder.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('TeamCyclesInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches /analytics/teams/:teamId/cycles and returns the parsed response', async () => {
    const payload = new TeamCyclesResponseBuilder().build();
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => payload,
    });

    const gateway = new TeamCyclesInHttpGateway();
    const result = await gateway.fetchCyclesForTeam('team-1');

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith('/analytics/teams/team-1/cycles');
  });

  it('throws GatewayError on non-OK HTTP response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const gateway = new TeamCyclesInHttpGateway();

    await expect(gateway.fetchCyclesForTeam('team-1')).rejects.toBeInstanceOf(
      GatewayError,
    );
  });

  it('throws GatewayError when the payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({ cycles: [{ unexpected: 'shape' }] }),
    });

    const gateway = new TeamCyclesInHttpGateway();

    await expect(gateway.fetchCyclesForTeam('team-1')).rejects.toBeInstanceOf(
      GatewayError,
    );
  });

  it('throws GatewayError when the cycle status is unknown', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({
        cycles: [
          {
            externalId: 'c',
            name: 'N',
            startsAt: 's',
            endsAt: 'e',
            issueCount: 1,
            status: 'archived',
          },
        ],
      }),
    });

    const gateway = new TeamCyclesInHttpGateway();

    await expect(gateway.fetchCyclesForTeam('team-1')).rejects.toBeInstanceOf(
      GatewayError,
    );
  });
});
