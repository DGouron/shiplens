import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceDashboardInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/workspace-dashboard.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { WorkspaceDashboardResponseBuilder } from '../../../../builders/workspace-dashboard-response.builder.ts';

function stubFetchOnce(response: Partial<Response>): void {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
}

describe('WorkspaceDashboardInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches /dashboard/data and returns the parsed data DTO', async () => {
    const payload = new WorkspaceDashboardResponseBuilder().build();
    stubFetchOnce({
      ok: true,
      json: async () => payload,
    });

    const gateway = new WorkspaceDashboardInHttpGateway();
    const result = await gateway.fetchDashboard();

    expect(result).toEqual(payload);
  });

  it('returns the empty variant when the API returns a not_connected status', async () => {
    const emptyPayload = {
      status: 'not_connected' as const,
      message: 'Connect your workspace to start',
    };
    stubFetchOnce({
      ok: true,
      json: async () => emptyPayload,
    });

    const gateway = new WorkspaceDashboardInHttpGateway();
    const result = await gateway.fetchDashboard();

    expect(result).toEqual(emptyPayload);
  });

  it('returns the empty variant when the API returns a no_teams status', async () => {
    const emptyPayload = {
      status: 'no_teams' as const,
      message: 'No teams synced yet',
    };
    stubFetchOnce({
      ok: true,
      json: async () => emptyPayload,
    });

    const gateway = new WorkspaceDashboardInHttpGateway();
    const result = await gateway.fetchDashboard();

    expect(result).toEqual(emptyPayload);
  });

  it('throws GatewayError on a non-OK HTTP response', async () => {
    stubFetchOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const gateway = new WorkspaceDashboardInHttpGateway();

    await expect(gateway.fetchDashboard()).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the response payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({ unexpected: 'shape' }),
    });

    const gateway = new WorkspaceDashboardInHttpGateway();

    await expect(gateway.fetchDashboard()).rejects.toBeInstanceOf(GatewayError);
  });
});
