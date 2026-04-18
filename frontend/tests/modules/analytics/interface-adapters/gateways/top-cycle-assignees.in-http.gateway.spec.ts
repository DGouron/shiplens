import { afterEach, describe, expect, it, vi } from 'vitest';
import { TopCycleAssigneesInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/top-cycle-assignees.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('TopCycleAssigneesInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches the ranking at /analytics/top-cycle-assignees/:teamId', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => ({ status: 'no_active_cycle' }),
    });

    const gateway = new TopCycleAssigneesInHttpGateway();
    const result = await gateway.fetchTopCycleAssignees({ teamId: 'team-42' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/top-cycle-assignees/team-42',
    );
    expect(result).toEqual({ status: 'no_active_cycle' });
  });

  it('parses a ready ranking payload with assignees', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        assignees: [
          {
            assigneeName: 'Alice',
            issueCount: 5,
            totalPoints: 15,
            totalCycleTimeInHours: 30,
          },
        ],
      }),
    });

    const gateway = new TopCycleAssigneesInHttpGateway();
    const result = await gateway.fetchTopCycleAssignees({ teamId: 'team-1' });

    expect(result.status).toBe('ready');
    if (result.status === 'ready') {
      expect(result.assignees).toHaveLength(1);
    }
  });

  it('throws GatewayError on non-OK ranking response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });
    const gateway = new TopCycleAssigneesInHttpGateway();

    await expect(
      gateway.fetchTopCycleAssignees({ teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the ranking payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({ status: 'unknown' }),
    });
    const gateway = new TopCycleAssigneesInHttpGateway();

    await expect(
      gateway.fetchTopCycleAssignees({ teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('fetches issues at /analytics/top-cycle-assignees/:teamId/assignees/:assigneeName/issues', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => ({
        status: 'ready',
        cycleId: 'cycle-1',
        assigneeName: 'Alice',
        issues: [],
      }),
    });

    const gateway = new TopCycleAssigneesInHttpGateway();
    await gateway.fetchCycleAssigneeIssues({
      teamId: 'team-1',
      assigneeName: 'Alice',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/top-cycle-assignees/team-1/assignees/Alice/issues',
    );
  });

  it('URL-encodes an assignee name that contains a space', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => ({
        status: 'ready',
        cycleId: 'cycle-1',
        assigneeName: 'Mary Jane',
        issues: [],
      }),
    });

    const gateway = new TopCycleAssigneesInHttpGateway();
    await gateway.fetchCycleAssigneeIssues({
      teamId: 'team-1',
      assigneeName: 'Mary Jane',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/top-cycle-assignees/team-1/assignees/Mary%20Jane/issues',
    );
  });

  it('throws GatewayError on non-OK issues response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });
    const gateway = new TopCycleAssigneesInHttpGateway();

    await expect(
      gateway.fetchCycleAssigneeIssues({
        teamId: 'team-1',
        assigneeName: 'Alice',
      }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the issues payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({ status: 'unknown' }),
    });
    const gateway = new TopCycleAssigneesInHttpGateway();

    await expect(
      gateway.fetchCycleAssigneeIssues({
        teamId: 'team-1',
        assigneeName: 'Alice',
      }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
