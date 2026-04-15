import { afterEach, describe, expect, it, vi } from 'vitest';
import { SyncInHttpGateway } from '@/modules/synchronization/interface-adapters/gateways/sync.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { SyncAvailableTeamResponseBuilder } from '../../../../builders/sync-available-team-response.builder.ts';
import { SyncSelectionResponseBuilder } from '../../../../builders/sync-selection-response.builder.ts';

function createFetchMock(
  responses: Partial<Response>[],
): ReturnType<typeof vi.fn> {
  const mock = vi.fn();
  for (const response of responses) {
    mock.mockResolvedValueOnce(response);
  }
  vi.stubGlobal('fetch', mock);
  return mock;
}

describe('SyncInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('fetchAvailableTeams', () => {
    it('calls GET /sync/teams and returns the parsed array', async () => {
      const payload = [new SyncAvailableTeamResponseBuilder().build()];
      const fetchMock = createFetchMock([
        { ok: true, json: async () => payload },
      ]);

      const gateway = new SyncInHttpGateway();
      const result = await gateway.fetchAvailableTeams();

      expect(result).toEqual(payload);
      expect(fetchMock).toHaveBeenCalledWith('/sync/teams');
    });

    it('throws GatewayError on a non-OK response', async () => {
      createFetchMock([{ ok: false, status: 500, json: async () => ({}) }]);
      const gateway = new SyncInHttpGateway();

      await expect(gateway.fetchAvailableTeams()).rejects.toBeInstanceOf(
        GatewayError,
      );
    });

    it('throws GatewayError when the payload fails schema validation', async () => {
      createFetchMock([{ ok: true, json: async () => ({ unexpected: true }) }]);
      const gateway = new SyncInHttpGateway();

      await expect(gateway.fetchAvailableTeams()).rejects.toBeInstanceOf(
        GatewayError,
      );
    });
  });

  describe('saveSelection', () => {
    it('calls POST /sync/selection with the JSON body and returns void', async () => {
      const fetchMock = createFetchMock([{ ok: true, json: async () => ({}) }]);
      const gateway = new SyncInHttpGateway();
      const input = {
        selectedTeams: [{ teamId: 'team-1', teamName: 'Team One' }],
        selectedProjects: [
          {
            projectId: 'project-1',
            projectName: 'Project One',
            teamId: 'team-1',
          },
        ],
      };

      const result = await gateway.saveSelection(input);

      expect(result).toBeUndefined();
      expect(fetchMock).toHaveBeenCalledWith('/sync/selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
    });

    it('throws GatewayError on a non-OK response', async () => {
      createFetchMock([{ ok: false, status: 500, json: async () => ({}) }]);
      const gateway = new SyncInHttpGateway();

      await expect(
        gateway.saveSelection({ selectedTeams: [], selectedProjects: [] }),
      ).rejects.toBeInstanceOf(GatewayError);
    });
  });

  describe('fetchSelection', () => {
    it('calls GET /sync/selection and returns the parsed selection', async () => {
      const payload = new SyncSelectionResponseBuilder().build();
      const fetchMock = createFetchMock([
        { ok: true, json: async () => payload },
      ]);
      const gateway = new SyncInHttpGateway();

      const result = await gateway.fetchSelection();

      expect(result).toEqual(payload);
      expect(fetchMock).toHaveBeenCalledWith('/sync/selection');
    });

    it('returns null when the API returns null', async () => {
      createFetchMock([{ ok: true, json: async () => null }]);
      const gateway = new SyncInHttpGateway();

      const result = await gateway.fetchSelection();

      expect(result).toBeNull();
    });

    it('throws GatewayError on a non-OK response', async () => {
      createFetchMock([{ ok: false, status: 500, json: async () => ({}) }]);
      const gateway = new SyncInHttpGateway();

      await expect(gateway.fetchSelection()).rejects.toBeInstanceOf(
        GatewayError,
      );
    });
  });

  describe('syncReferenceData', () => {
    it('calls POST /sync/reference-data with no body and returns void', async () => {
      const fetchMock = createFetchMock([{ ok: true, json: async () => ({}) }]);
      const gateway = new SyncInHttpGateway();

      const result = await gateway.syncReferenceData();

      expect(result).toBeUndefined();
      expect(fetchMock).toHaveBeenCalledWith('/sync/reference-data', {
        method: 'POST',
      });
    });

    it('throws GatewayError on a non-OK response', async () => {
      createFetchMock([{ ok: false, status: 500, json: async () => ({}) }]);
      const gateway = new SyncInHttpGateway();

      await expect(gateway.syncReferenceData()).rejects.toBeInstanceOf(
        GatewayError,
      );
    });
  });

  describe('syncTeamIssues', () => {
    it('calls POST /sync/issue-data with the teamId body and returns void', async () => {
      const fetchMock = createFetchMock([{ ok: true, json: async () => ({}) }]);
      const gateway = new SyncInHttpGateway();

      const result = await gateway.syncTeamIssues({ teamId: 'team-42' });

      expect(result).toBeUndefined();
      expect(fetchMock).toHaveBeenCalledWith('/sync/issue-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: 'team-42' }),
      });
    });

    it('throws GatewayError on a non-OK response', async () => {
      createFetchMock([{ ok: false, status: 500, json: async () => ({}) }]);
      const gateway = new SyncInHttpGateway();

      await expect(
        gateway.syncTeamIssues({ teamId: 'team-42' }),
      ).rejects.toBeInstanceOf(GatewayError);
    });
  });
});
