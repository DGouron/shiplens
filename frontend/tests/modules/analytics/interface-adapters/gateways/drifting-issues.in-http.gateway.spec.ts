import { afterEach, describe, expect, it, vi } from 'vitest';
import { DriftingIssuesInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/drifting-issues.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { DriftingIssueResponseBuilder } from '../../../../builders/drifting-issue-response.builder.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('DriftingIssuesInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches /analytics/drifting-issues/:teamId (no query params) and returns the parsed response array', async () => {
    const payload = [
      new DriftingIssueResponseBuilder().withIssueExternalId('LIN-1').build(),
      new DriftingIssueResponseBuilder().withIssueExternalId('LIN-2').build(),
    ];
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new DriftingIssuesInHttpGateway();
    const result = await gateway.fetchDriftingIssues({ teamId: 'team-1' });

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith('/analytics/drifting-issues/team-1');
  });

  it('returns an empty array when there are no drifting issues', async () => {
    stubFetchOnce({ ok: true, json: async () => [] });

    const gateway = new DriftingIssuesInHttpGateway();
    const result = await gateway.fetchDriftingIssues({ teamId: 'team-1' });

    expect(result).toEqual([]);
  });

  it('encodes the teamId path segment', async () => {
    stubFetchOnce({ ok: true, json: async () => [] });

    const gateway = new DriftingIssuesInHttpGateway();
    await gateway.fetchDriftingIssues({ teamId: 'team with space' });

    expect(fetch).toHaveBeenCalledWith(
      '/analytics/drifting-issues/team%20with%20space',
    );
  });

  it('throws GatewayError on non-OK HTTP response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const gateway = new DriftingIssuesInHttpGateway();

    await expect(
      gateway.fetchDriftingIssues({ teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => [
        { issueExternalId: 'LIN-1', elapsedBusinessHours: 'oops' },
      ],
    });

    const gateway = new DriftingIssuesInHttpGateway();

    await expect(
      gateway.fetchDriftingIssues({ teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
