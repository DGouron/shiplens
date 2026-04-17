import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorkflowConfigInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/workflow-config.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('WorkflowConfigInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('GET fetches /analytics/teams/:teamId/workflow-config and returns parsed response', async () => {
    const payload = {
      startedStatuses: ['In Progress'],
      completedStatuses: ['Done'],
      source: 'auto-detected',
      knownStatuses: ['Backlog', 'In Progress', 'Done'],
    };
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new WorkflowConfigInHttpGateway();
    const result = await gateway.getWorkflowConfig('team-1');

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/teams/team-1/workflow-config',
    );
  });

  it('GET encodes team id safely', async () => {
    const payload = {
      startedStatuses: [],
      completedStatuses: [],
      source: 'auto-detected',
      knownStatuses: [],
    };
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new WorkflowConfigInHttpGateway();
    await gateway.getWorkflowConfig('team with spaces');

    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/teams/team%20with%20spaces/workflow-config',
    );
  });

  it('GET throws GatewayError on non-OK HTTP response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const gateway = new WorkflowConfigInHttpGateway();

    await expect(gateway.getWorkflowConfig('team-1')).rejects.toBeInstanceOf(
      GatewayError,
    );
  });

  it('GET throws GatewayError when payload fails schema validation', async () => {
    stubFetchOnce({ ok: true, json: async () => ({ broken: true }) });

    const gateway = new WorkflowConfigInHttpGateway();

    await expect(gateway.getWorkflowConfig('team-1')).rejects.toBeInstanceOf(
      GatewayError,
    );
  });

  it('PUT sends the config body and returns the parsed response', async () => {
    const payload = {
      startedStatuses: ['In Dev'],
      completedStatuses: ['Done'],
      source: 'manual',
      knownStatuses: ['In Dev', 'Done'],
    };
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new WorkflowConfigInHttpGateway();
    const result = await gateway.setWorkflowConfig('team-1', {
      startedStatuses: ['In Dev'],
      completedStatuses: ['Done'],
    });

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/teams/team-1/workflow-config',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startedStatuses: ['In Dev'],
          completedStatuses: ['Done'],
        }),
      },
    );
  });

  it('PUT throws GatewayError on non-OK HTTP response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const gateway = new WorkflowConfigInHttpGateway();

    await expect(
      gateway.setWorkflowConfig('team-1', {
        startedStatuses: [],
        completedStatuses: [],
      }),
    ).rejects.toBeInstanceOf(GatewayError);
  });
});
