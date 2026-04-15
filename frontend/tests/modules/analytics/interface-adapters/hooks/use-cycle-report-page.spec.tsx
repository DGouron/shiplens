import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useCycleReportPage } from '@/modules/analytics/interface-adapters/hooks/use-cycle-report-page.ts';
import { StubTeamCyclesGateway } from '@/modules/analytics/testing/good-path/stub.team-cycles.in-memory.gateway.ts';
import { ListAvailableTeamsUsecase } from '@/modules/analytics/usecases/list-available-teams.usecase.ts';
import { ListTeamCyclesUsecase } from '@/modules/analytics/usecases/list-team-cycles.usecase.ts';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
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

function useCycleReportPageWithLocation() {
  const result = useCycleReportPage();
  const location = useLocation();
  return { ...result, locationSearch: location.search };
}

describe('useCycleReportPage', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('exposes the shell state and selection callbacks', async () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(new StubSyncGateway()),
      listTeamCycles: new ListTeamCyclesUsecase(new StubTeamCyclesGateway()),
    });

    const { result } = renderHook(() => useCycleReportPage(), {
      wrapper: wrapperFor('/cycle-report'),
    });

    await waitFor(() => {
      expect(result.current.shellState.status).toBe('ready');
    });
    expect(typeof result.current.selectTeam).toBe('function');
    expect(typeof result.current.selectCycle).toBe('function');
  });

  it('auto-selects the first completed cycle rather than the most recent in-progress one', async () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(new StubSyncGateway()),
      listTeamCycles: new ListTeamCyclesUsecase(
        new StubTeamCyclesGateway({
          response: {
            cycles: [
              {
                externalId: 'cycle-in-progress',
                name: 'Cycle 12',
                startsAt: '2026-07-01T00:00:00.000Z',
                endsAt: '2026-07-14T00:00:00.000Z',
                issueCount: 0,
                status: 'in_progress',
              },
              {
                externalId: 'cycle-completed',
                name: 'Cycle 5',
                startsAt: '2026-03-01T00:00:00.000Z',
                endsAt: '2026-03-14T00:00:00.000Z',
                issueCount: 50,
                status: 'completed',
              },
            ],
          },
        }),
      ),
    });

    const { result } = renderHook(() => useCycleReportPageWithLocation(), {
      wrapper: wrapperFor('/cycle-report?teamId=team-1'),
    });

    await waitFor(() => {
      expect(result.current.locationSearch).toContain(
        'cycleId=cycle-completed',
      );
    });
    expect(result.current.locationSearch).not.toContain(
      'cycleId=cycle-in-progress',
    );
  });

  it('falls back to the first cycle when no cycle is completed', async () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(new StubSyncGateway()),
      listTeamCycles: new ListTeamCyclesUsecase(
        new StubTeamCyclesGateway({
          response: {
            cycles: [
              {
                externalId: 'cycle-a',
                name: 'Cycle 12',
                startsAt: '2026-07-01T00:00:00.000Z',
                endsAt: '2026-07-14T00:00:00.000Z',
                issueCount: 0,
                status: 'in_progress',
              },
              {
                externalId: 'cycle-b',
                name: 'Cycle 11',
                startsAt: '2026-06-01T00:00:00.000Z',
                endsAt: '2026-06-14T00:00:00.000Z',
                issueCount: 0,
                status: 'in_progress',
              },
            ],
          },
        }),
      ),
    });

    const { result } = renderHook(() => useCycleReportPageWithLocation(), {
      wrapper: wrapperFor('/cycle-report?teamId=team-1'),
    });

    await waitFor(() => {
      expect(result.current.locationSearch).toContain('cycleId=cycle-a');
    });
  });
});
