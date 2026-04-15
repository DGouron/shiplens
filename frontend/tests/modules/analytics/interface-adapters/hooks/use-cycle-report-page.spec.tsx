import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
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
});
