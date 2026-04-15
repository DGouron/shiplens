import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '@/app.tsx';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { CycleReportView } from '@/modules/analytics/interface-adapters/views/cycle-report.view.tsx';
import { FailingTeamCyclesGateway } from '@/modules/analytics/testing/bad-path/failing.team-cycles.in-memory.gateway.ts';
import { StubEmptyTeamCyclesGateway } from '@/modules/analytics/testing/good-path/stub.empty-team-cycles.in-memory.gateway.ts';
import { StubTeamCyclesGateway } from '@/modules/analytics/testing/good-path/stub.team-cycles.in-memory.gateway.ts';
import { ListAvailableTeamsUsecase } from '@/modules/analytics/usecases/list-available-teams.usecase.ts';
import { ListTeamCyclesUsecase } from '@/modules/analytics/usecases/list-team-cycles.usecase.ts';
import { FailingSyncGateway } from '@/modules/synchronization/testing/bad-path/failing.sync.in-memory.gateway.ts';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { CycleSummaryResponseBuilder } from '../builders/cycle-summary-response.builder.ts';
import { SyncAvailableTeamResponseBuilder } from '../builders/sync-available-team-response.builder.ts';
import { TeamCyclesResponseBuilder } from '../builders/team-cycles-response.builder.ts';
import { withQueryClient } from '../helpers/query-client-wrapper.tsx';

function renderAtPath(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
        children: [{ path: 'cycle-report', element: <CycleReportView /> }],
      },
    ],
    { initialEntries: [initialPath] },
  );

  return render(withQueryClient(<RouterProvider router={router} />));
}

describe('Migrate cycle report page shell (acceptance)', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('route renders: navigating to /cycle-report shows the Cycle report heading', async () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(new StubSyncGateway()),
      listTeamCycles: new ListTeamCyclesUsecase(new StubTeamCyclesGateway()),
    });

    renderAtPath('/cycle-report');

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Cycle report' }),
      ).toBeInTheDocument();
    });
  });

  it('no teamId in URL: shows the empty prompt to select a team', async () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(new StubSyncGateway()),
      listTeamCycles: new ListTeamCyclesUsecase(new StubTeamCyclesGateway()),
    });

    renderAtPath('/cycle-report');

    await waitFor(() => {
      expect(
        screen.getByText('Select a team to view the cycle report'),
      ).toBeInTheDocument();
    });
  });

  it('team selector lists all workspace teams fetched via sync gateway', async () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(
        new StubSyncGateway({
          availableTeams: [
            new SyncAvailableTeamResponseBuilder()
              .withTeamId('team-1')
              .withTeamName('Alpha')
              .build(),
            new SyncAvailableTeamResponseBuilder()
              .withTeamId('team-2')
              .withTeamName('Bravo')
              .build(),
          ],
        }),
      ),
      listTeamCycles: new ListTeamCyclesUsecase(new StubTeamCyclesGateway()),
    });

    renderAtPath('/cycle-report');

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });
    expect(screen.getByText('Bravo')).toBeInTheDocument();
  });

  it('teamId in URL: renders the 6 section placeholders with skeleton loading', async () => {
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

    renderAtPath('/cycle-report?teamId=team-1');

    await waitFor(() => {
      expect(screen.getByText('Metrics')).toBeInTheDocument();
    });
    expect(screen.getByText('Bottlenecks')).toBeInTheDocument();
    expect(screen.getByText('Blocked issues')).toBeInTheDocument();
    expect(screen.getByText('Estimation accuracy')).toBeInTheDocument();
    expect(screen.getByText('Drifting issues')).toBeInTheDocument();
    expect(screen.getByText('AI report')).toBeInTheDocument();
  });

  it('teamId in URL: cycle selector lists the cycles returned by the team cycles gateway', async () => {
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
              new CycleSummaryResponseBuilder()
                .withExternalId('cycle-2')
                .withName('Cycle 11')
                .build(),
            ])
            .build(),
        }),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1');

    await waitFor(() => {
      expect(screen.getByText('Cycle 12')).toBeInTheDocument();
    });
    expect(screen.getByText('Cycle 11')).toBeInTheDocument();
  });

  it('selecting a team from the team selector writes teamId to the URL', async () => {
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

    renderAtPath('/cycle-report');

    const teamSelect = await screen.findByLabelText('Team');
    fireEvent.change(teamSelect, { target: { value: 'team-1' } });

    await waitFor(() => {
      expect(screen.getByText('Metrics')).toBeInTheDocument();
    });
  });

  it('team gateway failure: shows an error message', async () => {
    overrideUsecases({
      listAvailableTeams: new ListAvailableTeamsUsecase(
        new FailingSyncGateway(),
      ),
      listTeamCycles: new ListTeamCyclesUsecase(new StubTeamCyclesGateway()),
    });

    renderAtPath('/cycle-report');

    await waitFor(() => {
      expect(screen.getByText('Sync failed')).toBeInTheDocument();
    });
  });

  it('cycle gateway failure: shows an error message for the cycle selector', async () => {
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

    renderAtPath('/cycle-report?teamId=team-1');

    await waitFor(() => {
      expect(
        screen.getByText('Failed to fetch team cycles'),
      ).toBeInTheDocument();
    });
  });

  it('no cycles for selected team: renders the 6 section placeholders anyway', async () => {
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
        new StubEmptyTeamCyclesGateway(),
      ),
    });

    renderAtPath('/cycle-report?teamId=team-1');

    await waitFor(() => {
      expect(screen.getByText('Metrics')).toBeInTheDocument();
    });
  });
});
