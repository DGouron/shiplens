import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlockedIssuesInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/blocked-issues.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { BlockedIssueAlertResponseBuilder } from '../../../../builders/blocked-issue-alert-response.builder.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('BlockedIssuesInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches /analytics/blocked-issues (no query params) and returns the parsed response array', async () => {
    const payload = [
      new BlockedIssueAlertResponseBuilder().withId('alert-1').build(),
      new BlockedIssueAlertResponseBuilder().withId('alert-2').build(),
    ];
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new BlockedIssuesInHttpGateway();
    const result = await gateway.fetchBlockedIssues();

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith('/analytics/blocked-issues');
  });

  it('returns an empty array when there are no blocked issues', async () => {
    stubFetchOnce({ ok: true, json: async () => [] });

    const gateway = new BlockedIssuesInHttpGateway();
    const result = await gateway.fetchBlockedIssues();

    expect(result).toEqual([]);
  });

  it('throws GatewayError on non-OK HTTP response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const gateway = new BlockedIssuesInHttpGateway();

    await expect(gateway.fetchBlockedIssues()).rejects.toBeInstanceOf(
      GatewayError,
    );
  });

  it('throws GatewayError when the payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => [{ id: 'alert-1', durationHours: 'oops' }],
    });

    const gateway = new BlockedIssuesInHttpGateway();

    await expect(gateway.fetchBlockedIssues()).rejects.toBeInstanceOf(
      GatewayError,
    );
  });
});
