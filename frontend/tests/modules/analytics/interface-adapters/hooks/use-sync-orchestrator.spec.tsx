import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useSyncOrchestrator } from '@/modules/analytics/interface-adapters/hooks/use-sync-orchestrator.ts';
import { type SyncGateway } from '@/modules/synchronization/entities/sync/sync.gateway.ts';
import { FailingSyncGateway } from '@/modules/synchronization/testing/bad-path/failing.sync.in-memory.gateway.ts';
import { FailingOnceSyncGateway } from '@/modules/synchronization/testing/bad-path/failing-once.sync.in-memory.gateway.ts';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { DiscoverSyncTeamsUsecase } from '@/modules/synchronization/usecases/discover-sync-teams.usecase.ts';
import { GetSyncSelectionUsecase } from '@/modules/synchronization/usecases/get-sync-selection.usecase.ts';
import { SelectAllSyncTargetsUsecase } from '@/modules/synchronization/usecases/select-all-sync-targets.usecase.ts';
import { SyncReferenceDataUsecase } from '@/modules/synchronization/usecases/sync-reference-data.usecase.ts';
import { SyncTeamIssuesUsecase } from '@/modules/synchronization/usecases/sync-team-issues.usecase.ts';
import { SyncAvailableTeamResponseBuilder } from '../../../../builders/sync-available-team-response.builder.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

interface OverrideOptions {
  onSuccess?: () => void | Promise<void>;
}

function overrideWith(gateway: SyncGateway): void {
  overrideUsecases({
    discoverSyncTeams: new DiscoverSyncTeamsUsecase(gateway),
    selectAllSyncTargets: new SelectAllSyncTargetsUsecase(gateway),
    getSyncSelection: new GetSyncSelectionUsecase(gateway),
    syncReferenceData: new SyncReferenceDataUsecase(gateway),
    syncTeamIssues: new SyncTeamIssuesUsecase(gateway),
  });
}

function renderOrchestrator(options: OverrideOptions = {}) {
  const client = createTestQueryClient();
  return renderHook(() => useSyncOrchestrator(options), {
    wrapper: ({ children }) => withQueryClient(children, client),
  });
}

describe('useSyncOrchestrator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetUsecases();
  });

  it('starts in idle state', () => {
    overrideWith(new StubSyncGateway());

    const { result } = renderOrchestrator();

    expect(result.current.state).toEqual({ status: 'idle' });
  });

  it('startAutoSync walks through all steps and succeeds', async () => {
    const availableTeams = [
      new SyncAvailableTeamResponseBuilder().withTeamId('team-1').build(),
      new SyncAvailableTeamResponseBuilder().withTeamId('team-2').build(),
    ];
    const gateway = new StubSyncGateway({ availableTeams });
    overrideWith(gateway);

    const { result } = renderOrchestrator();

    await act(async () => {
      const promise = result.current.startAutoSync();
      await vi.runAllTimersAsync();
      await promise;
    });

    expect(result.current.state).toEqual({ status: 'succeeded' });
    expect(gateway.referenceDataSyncCount).toBe(1);
    expect(gateway.teamIssuesSyncedFor).toEqual(['team-1', 'team-2']);
  });

  it('startAutoSync fails with NoTeamsAvailableInWorkspace when no teams are returned', async () => {
    overrideWith(new StubSyncGateway({ availableTeams: [] }));

    const { result } = renderOrchestrator();

    await act(async () => {
      const promise = result.current.startAutoSync();
      await vi.runAllTimersAsync();
      await promise;
    });

    expect(result.current.state).toEqual({
      status: 'failed',
      error: 'No teams available in workspace',
    });
  });

  it('startAutoSync retries after a backoff when the first attempt fails and succeeds on the second', async () => {
    const gateway = new FailingOnceSyncGateway({
      failingMethod: 'fetchAvailableTeams',
      failureCount: 1,
    });
    overrideWith(gateway);

    const { result } = renderOrchestrator();

    await act(async () => {
      const promise = result.current.startAutoSync();
      await vi.runAllTimersAsync();
      await promise;
    });

    expect(result.current.state).toEqual({ status: 'succeeded' });
    expect(gateway.referenceDataSyncCount).toBe(1);
    expect(gateway.teamIssuesSyncedFor).toEqual(['team-1']);
  });

  it('startAutoSync fails after exhausting the 3 retry attempts', async () => {
    overrideWith(new FailingSyncGateway());

    const { result } = renderOrchestrator();

    await act(async () => {
      const promise = result.current.startAutoSync();
      await vi.runAllTimersAsync();
      await promise;
    });

    expect(result.current.state.status).toBe('failed');
  });

  it('startResync walks through selection, reference data and team issues', async () => {
    const gateway = new StubSyncGateway({
      selection: {
        selectedTeams: [
          { teamId: 'team-1', teamName: 'Team One' },
          { teamId: 'team-2', teamName: 'Team Two' },
        ],
        selectedProjects: [],
      },
    });
    overrideWith(gateway);

    const { result } = renderOrchestrator();

    await act(async () => {
      const promise = result.current.startResync();
      await vi.runAllTimersAsync();
      await promise;
    });

    expect(result.current.state).toEqual({ status: 'succeeded' });
    expect(gateway.referenceDataSyncCount).toBe(1);
    expect(gateway.teamIssuesSyncedFor).toEqual(['team-1', 'team-2']);
  });

  it('startResync fails without retry when the selection is null', async () => {
    overrideWith(new StubSyncGateway({ selection: null }));

    const { result } = renderOrchestrator();

    await act(async () => {
      const promise = result.current.startResync();
      await vi.runAllTimersAsync();
      await promise;
    });

    expect(result.current.state).toEqual({
      status: 'failed',
      error: 'No sync selection found',
    });
  });

  it('calls onSuccess after a successful auto sync', async () => {
    overrideWith(new StubSyncGateway());
    const onSuccess = vi.fn();

    const { result } = renderOrchestrator({ onSuccess });

    await act(async () => {
      const promise = result.current.startAutoSync();
      await vi.runAllTimersAsync();
      await promise;
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('retry re-runs the last attempted flow from scratch', async () => {
    const gateway = new FailingOnceSyncGateway({
      failingMethod: 'fetchAvailableTeams',
      failureCount: 4,
    });
    overrideWith(gateway);

    const { result } = renderOrchestrator();

    await act(async () => {
      const promise = result.current.startAutoSync();
      await vi.runAllTimersAsync();
      await promise;
    });

    expect(result.current.state.status).toBe('failed');

    await act(async () => {
      const promise = result.current.retry();
      await vi.runAllTimersAsync();
      await promise;
    });

    expect(result.current.state).toEqual({ status: 'succeeded' });
  });
});
