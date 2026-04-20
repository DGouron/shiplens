import { afterEach, describe, expect, it, vi } from 'vitest';
import { TopCycleThemesInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/top-cycle-themes.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('TopCycleThemesInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches themes at /analytics/cycle-themes/:teamId without query when no refresh and no provider', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => ({ status: 'no_active_cycle' }),
    });

    const gateway = new TopCycleThemesInHttpGateway();
    await gateway.fetchTopCycleThemes({
      teamId: 'team-42',
      forceRefresh: false,
    });

    expect(fetchMock).toHaveBeenCalledWith('/analytics/cycle-themes/team-42');
  });

  it('appends refresh=true when forceRefresh is true', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => ({ status: 'no_active_cycle' }),
    });

    const gateway = new TopCycleThemesInHttpGateway();
    await gateway.fetchTopCycleThemes({
      teamId: 'team-1',
      forceRefresh: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/cycle-themes/team-1?refresh=true',
    );
  });

  it('appends provider when provided', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => ({ status: 'no_active_cycle' }),
    });

    const gateway = new TopCycleThemesInHttpGateway();
    await gateway.fetchTopCycleThemes({
      teamId: 'team-1',
      forceRefresh: false,
      provider: 'OpenAI',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/cycle-themes/team-1?provider=OpenAI',
    );
  });

  it('appends both refresh and provider when both are present', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => ({ status: 'no_active_cycle' }),
    });

    const gateway = new TopCycleThemesInHttpGateway();
    await gateway.fetchTopCycleThemes({
      teamId: 'team-1',
      forceRefresh: true,
      provider: 'Anthropic',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/cycle-themes/team-1?refresh=true&provider=Anthropic',
    );
  });

  it('parses a ready themes payload', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        language: 'EN',
        fromCache: false,
        themes: [
          {
            name: 'Auth',
            issueCount: 3,
            totalPoints: 6,
            totalCycleTimeInHours: 9,
          },
        ],
      }),
    });

    const gateway = new TopCycleThemesInHttpGateway();
    const result = await gateway.fetchTopCycleThemes({
      teamId: 'team-1',
      forceRefresh: false,
    });

    expect(result.status).toBe('ready');
    if (result.status === 'ready') {
      expect(result.themes).toHaveLength(1);
    }
  });

  it('throws GatewayError on non-OK themes response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });
    const gateway = new TopCycleThemesInHttpGateway();

    await expect(
      gateway.fetchTopCycleThemes({ teamId: 'team-1', forceRefresh: false }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the themes payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({ status: 'unknown' }),
    });
    const gateway = new TopCycleThemesInHttpGateway();

    await expect(
      gateway.fetchTopCycleThemes({ teamId: 'team-1', forceRefresh: false }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('fetches theme issues at /analytics/cycle-themes/:teamId/themes/:themeName/issues', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => ({
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        themeName: 'Auth refactor',
        issues: [],
      }),
    });

    const gateway = new TopCycleThemesInHttpGateway();
    await gateway.fetchCycleThemeIssues({
      teamId: 'team-1',
      themeName: 'Auth refactor',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/cycle-themes/team-1/themes/Auth%20refactor/issues',
    );
  });

  it('throws GatewayError on non-OK issues response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });
    const gateway = new TopCycleThemesInHttpGateway();

    await expect(
      gateway.fetchCycleThemeIssues({
        teamId: 'team-1',
        themeName: 'Auth',
      }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the issues payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({ status: 'unknown' }),
    });
    const gateway = new TopCycleThemesInHttpGateway();

    await expect(
      gateway.fetchCycleThemeIssues({
        teamId: 'team-1',
        themeName: 'Auth',
      }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
