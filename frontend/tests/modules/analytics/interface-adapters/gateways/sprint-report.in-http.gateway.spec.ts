import { afterEach, describe, expect, it, vi } from 'vitest';
import { SprintReportInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/sprint-report.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { SprintReportDetailBuilder } from '../../../../builders/sprint-report-detail.builder.ts';
import { SprintReportHistoryItemBuilder } from '../../../../builders/sprint-report-history-item.builder.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('SprintReportInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches /analytics/teams/:teamId/reports and returns the parsed history', async () => {
    const payload = {
      reports: [
        new SprintReportHistoryItemBuilder().withId('report-1').build(),
        new SprintReportHistoryItemBuilder().withId('report-2').build(),
      ],
    };
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new SprintReportInHttpGateway();
    const result = await gateway.listForTeam({ teamId: 'team-1' });

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith('/analytics/teams/team-1/reports');
  });

  it('throws GatewayError when the history endpoint returns a non-OK status', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const gateway = new SprintReportInHttpGateway();

    await expect(
      gateway.listForTeam({ teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('fetches /analytics/reports/:reportId and returns the parsed detail', async () => {
    const payload = new SprintReportDetailBuilder().withId('report-1').build();
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new SprintReportInHttpGateway();
    const result = await gateway.getDetail({ reportId: 'report-1' });

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith('/analytics/reports/report-1');
  });

  it('throws GatewayError when the detail endpoint returns a non-OK status', async () => {
    stubFetchOnce({ ok: false, status: 404, json: async () => ({}) });

    const gateway = new SprintReportInHttpGateway();

    await expect(
      gateway.getDetail({ reportId: 'missing' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('posts to /analytics/cycles/:cycleId/report with the hardcoded provider', async () => {
    const fetchMock = stubFetchOnce({ ok: true, json: async () => ({}) });

    const gateway = new SprintReportInHttpGateway();
    await gateway.generate({ cycleId: 'cycle-1', teamId: 'team-1' });

    expect(fetchMock).toHaveBeenCalledWith('/analytics/cycles/cycle-1/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: 'team-1', provider: 'Anthropic' }),
    });
  });

  it('throws GatewayError when the generate endpoint returns a non-OK status', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const gateway = new SprintReportInHttpGateway();

    await expect(
      gateway.generate({ cycleId: 'cycle-1', teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the history payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({ reports: [{ id: 'x', cycleName: 123 }] }),
    });

    const gateway = new SprintReportInHttpGateway();

    await expect(
      gateway.listForTeam({ teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
