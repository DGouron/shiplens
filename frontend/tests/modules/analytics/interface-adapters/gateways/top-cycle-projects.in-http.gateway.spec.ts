import { afterEach, describe, expect, it, vi } from 'vitest';
import { TopCycleProjectsInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/top-cycle-projects.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('TopCycleProjectsInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches the ranking at /analytics/top-cycle-projects/:teamId', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => ({ status: 'no_active_cycle' }),
    });

    const gateway = new TopCycleProjectsInHttpGateway();
    const result = await gateway.fetchTopCycleProjects({ teamId: 'team-42' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/top-cycle-projects/team-42',
    );
    expect(result).toEqual({ status: 'no_active_cycle' });
  });

  it('parses a ready ranking payload with projects', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        projects: [
          {
            projectId: 'proj-a',
            projectName: 'Alpha',
            isNoProjectBucket: false,
            issueCount: 3,
            totalPoints: 5,
            totalCycleTimeInHours: 10,
          },
        ],
      }),
    });

    const gateway = new TopCycleProjectsInHttpGateway();
    const result = await gateway.fetchTopCycleProjects({ teamId: 'team-1' });

    expect(result.status).toBe('ready');
    if (result.status === 'ready') {
      expect(result.projects).toHaveLength(1);
    }
  });

  it('throws GatewayError on non-OK ranking response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });
    const gateway = new TopCycleProjectsInHttpGateway();

    await expect(
      gateway.fetchTopCycleProjects({ teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the ranking payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({ status: 'unknown' }),
    });
    const gateway = new TopCycleProjectsInHttpGateway();

    await expect(
      gateway.fetchTopCycleProjects({ teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('fetches issues at /analytics/top-cycle-projects/:teamId/projects/:projectId/issues', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => ({
        status: 'ready',
        cycleId: 'cycle-1',
        projectId: 'proj-a',
        projectName: 'Alpha',
        isNoProjectBucket: false,
        issues: [],
      }),
    });

    const gateway = new TopCycleProjectsInHttpGateway();
    await gateway.fetchCycleProjectIssues({
      teamId: 'team-1',
      projectId: 'proj-a',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/top-cycle-projects/team-1/projects/proj-a/issues',
    );
  });

  it('encodes the no-project bucket id in the issues URL', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      json: async () => ({
        status: 'ready',
        cycleId: 'cycle-1',
        projectId: '__no_project__',
        projectName: 'No project',
        isNoProjectBucket: true,
        issues: [],
      }),
    });

    const gateway = new TopCycleProjectsInHttpGateway();
    await gateway.fetchCycleProjectIssues({
      teamId: 'team-1',
      projectId: '__no_project__',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/top-cycle-projects/team-1/projects/__no_project__/issues',
    );
  });

  it('throws GatewayError on non-OK issues response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });
    const gateway = new TopCycleProjectsInHttpGateway();

    await expect(
      gateway.fetchCycleProjectIssues({
        teamId: 'team-1',
        projectId: 'proj-a',
      }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
