import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useCycleReportShell } from '@/modules/analytics/interface-adapters/hooks/use-cycle-report-shell.ts';
import { FailingTeamCyclesGateway } from '@/modules/analytics/testing/bad-path/failing.team-cycles.in-memory.gateway.ts';
import { StubTeamCyclesGateway } from '@/modules/analytics/testing/good-path/stub.team-cycles.in-memory.gateway.ts';
import { ListAvailableTeamsUsecase } from '@/modules/analytics/usecases/list-available-teams.usecase.ts';
import { ListTeamCyclesUsecase } from '@/modules/analytics/usecases/list-team-cycles.usecase.ts';
import { FailingSyncGateway } from '@/modules/synchronization/testing/bad-path/failing.sync.in-memory.gateway.ts';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { CycleSummaryResponseBuilder } from '../../../../builders/cycle-summary-response.builder.ts';
import { SyncAvailableTeamResponseBuilder } from '../../../../builders/sync-available-team-response.builder.ts';
import { TeamCyclesResponseBuilder } from '../../../../builders/team-cycles-response.builder.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function wrapperFor(initialPath: string) {
  const client = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => {
    const router = createMemoryRouter(
      [{ path: '/cycle-report', element: <>{children}</> }],
      { initialEntries: [initialPath] },
    );
    return withQueryClient(<RouterProvider router={router} />, client);
  };
}

describe('useCycleReportShell', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('exposes a loading state on first render', () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(new StubSyncGateway()),
      listTeamCycles: new ListTeamCyclesUsecase(new StubTeamCyclesGateway()),
    });

    const { result } = renderHook(() => useCycleReportShell(), {
      wrapper: wrapperFor('/cycle-report'),
    });

    expect(result.current.state.status).toBe('loading');
  });

  it('transitions to ready with a view model exposing the empty prompt when no teamId is in the URL', async () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(
        new StubSyncGateway({
          availableTeams: [
            new SyncAvailableTeamResponseBuilder()
              .withTeamId('team-1')
              .withTeamName('Alpha')
              .build(),
          ],
        }),
      ),
      listTeamCycles: new ListTeamCyclesUsecase(new StubTeamCyclesGateway()),
    });

    const { result } = renderHook(() => useCycleReportShell(), {
      wrapper: wrapperFor('/cycle-report'),
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.emptyPrompt).toBe(
        'Select a team to view the cycle report',
      );
      expect(result.current.state.data.cycleSelector).toBeNull();
      expect(result.current.state.data.sectionPlaceholders).toEqual([]);
    }
  });

  it('exposes the 6 section placeholders when teamId is in the URL', async () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(
        new StubSyncGateway({
          availableTeams: [
            new SyncAvailableTeamResponseBuilder()
              .withTeamId('team-1')
              .withTeamName('Alpha')
              .build(),
          ],
        }),
      ),
      listTeamCycles: new ListTeamCyclesUsecase(
        new StubTeamCyclesGateway({
          response: new TeamCyclesResponseBuilder()
            .withCycles([
              new CycleSummaryResponseBuilder()
                .withExternalId('cycle-1')
                .withName('Cycle 12')
                .build(),
            ])
            .build(),
        }),
      ),
    });

    const { result } = renderHook(() => useCycleReportShell(), {
      wrapper: wrapperFor('/cycle-report?teamId=team-1'),
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.sectionPlaceholders).toHaveLength(6);
      expect(result.current.state.data.cycleSelector).not.toBeNull();
    }
  });

  it('transitions to error when the team listing fails', async () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(
        new FailingSyncGateway(),
      ),
      listTeamCycles: new ListTeamCyclesUsecase(new StubTeamCyclesGateway()),
    });

    const { result } = renderHook(() => useCycleReportShell(), {
      wrapper: wrapperFor('/cycle-report'),
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe('Sync failed');
    }
  });

  it('transitions to error when the cycles listing fails for the selected team', async () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(
        new StubSyncGateway({
          availableTeams: [
            new SyncAvailableTeamResponseBuilder()
              .withTeamId('team-1')
              .withTeamName('Alpha')
              .build(),
          ],
        }),
      ),
      listTeamCycles: new ListTeamCyclesUsecase(new FailingTeamCyclesGateway()),
    });

    const { result } = renderHook(() => useCycleReportShell(), {
      wrapper: wrapperFor('/cycle-report?teamId=team-1'),
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe('Failed to fetch team cycles');
    }
  });

  it('exposes selectTeam and selectCycle callbacks from the URL-state hook', async () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(new StubSyncGateway()),
      listTeamCycles: new ListTeamCyclesUsecase(new StubTeamCyclesGateway()),
    });

    const { result } = renderHook(() => useCycleReportShell(), {
      wrapper: wrapperFor('/cycle-report'),
    });

    expect(typeof result.current.selectTeam).toBe('function');
    expect(typeof result.current.selectCycle).toBe('function');
  });
});
