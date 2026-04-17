import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, Navigate, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@/app.tsx';
import { LocaleProvider, useSetLocale } from '@/locale-context.tsx';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { type WorkspaceDashboardDataResponse } from '@/modules/analytics/entities/workspace-dashboard/workspace-dashboard.response.ts';
import { DashboardView } from '@/modules/analytics/interface-adapters/views/dashboard.view.tsx';
import { StubTeamSelectionStorageGateway } from '@/modules/analytics/testing/good-path/stub.team-selection-storage.in-memory.gateway.ts';
import { StubWorkspaceDashboardGateway } from '@/modules/analytics/testing/good-path/stub.workspace-dashboard.in-memory.gateway.ts';
import { GetPersistedTeamSelectionUsecase } from '@/modules/analytics/usecases/get-persisted-team-selection.usecase.ts';
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';
import { PersistTeamSelectionUsecase } from '@/modules/analytics/usecases/persist-team-selection.usecase.ts';
import { TeamDashboardResponseBuilder } from '../builders/team-dashboard-response.builder.ts';
import { WorkspaceDashboardResponseBuilder } from '../builders/workspace-dashboard-response.builder.ts';
import { withQueryClient } from '../helpers/query-client-wrapper.tsx';

function wireWorkspaceDashboard(
  dto: WorkspaceDashboardDataResponse,
  storage: StubTeamSelectionStorageGateway,
): void {
  overrideUsecases({
    getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
      new StubWorkspaceDashboardGateway({ response: dto }),
    ),
    getPersistedTeamSelection: new GetPersistedTeamSelectionUsecase(storage),
    persistTeamSelection: new PersistTeamSelectionUsecase(storage),
  });
}

function renderAtPath(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardView /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );

  return render(withQueryClient(<RouterProvider router={router} />));
}

function LocaleSwitch({ locale }: { locale: 'en' | 'fr' }) {
  const setLocale = useSetLocale();
  return (
    <button type="button" onClick={() => setLocale(locale)}>
      switch-to-{locale}
    </button>
  );
}

function renderWithLocaleProvider(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardView /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );

  return render(
    withQueryClient(
      <LocaleProvider>
        <LocaleSwitch locale="fr" />
        <RouterProvider router={router} />
      </LocaleProvider>,
    ),
  );
}

describe('Select team on dashboard (acceptance)', () => {
  let storage: StubTeamSelectionStorageGateway;

  beforeEach(() => {
    storage = new StubTeamSelectionStorageGateway();
  });

  afterEach(() => {
    resetUsecases();
    vi.restoreAllMocks();
  });

  it('first load alphabetical default: selects "Alpha" when teams are Bravo, Alpha, Charlie and no storage entry', async () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withWorkspaceId('workspace-1')
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-bravo')
          .withTeamName('Bravo')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-alpha')
          .withTeamName('Alpha')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-charlie')
          .withTeamName('Charlie')
          .build(),
      ])
      .build();
    wireWorkspaceDashboard(dto, storage);

    renderAtPath('/dashboard');

    const alphaCard = await waitFor(() =>
      screen.getByRole('button', { name: /Alpha/ }),
    );
    expect(alphaCard.getAttribute('aria-pressed')).toBe('true');
  });

  it('first load empty workspace: shows the empty-state message and no team cards', async () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withWorkspaceId('workspace-1')
      .withTeams([])
      .build();
    wireWorkspaceDashboard(dto, storage);

    renderAtPath('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByText(
          'No teams available. Connect Linear and select teams to sync first.',
        ),
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /Alpha/ })).toBeNull();
  });

  it('restore from local storage: pre-selected Bravo when storage says team-bravo', async () => {
    storage.write('workspace-1', 'team-bravo');
    const dto = new WorkspaceDashboardResponseBuilder()
      .withWorkspaceId('workspace-1')
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-alpha')
          .withTeamName('Alpha')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-bravo')
          .withTeamName('Bravo')
          .build(),
      ])
      .build();
    wireWorkspaceDashboard(dto, storage);

    renderAtPath('/dashboard');

    const bravoCard = await waitFor(() =>
      screen.getByRole('button', { name: /Bravo/ }),
    );
    expect(bravoCard.getAttribute('aria-pressed')).toBe('true');
  });

  it('stale local storage: falls back to alphabetical default when stored id no longer exists', async () => {
    storage.write('workspace-1', 'team-deleted');
    const dto = new WorkspaceDashboardResponseBuilder()
      .withWorkspaceId('workspace-1')
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-alpha')
          .withTeamName('Alpha')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-bravo')
          .withTeamName('Bravo')
          .build(),
      ])
      .build();
    wireWorkspaceDashboard(dto, storage);

    renderAtPath('/dashboard');

    const alphaCard = await waitFor(() =>
      screen.getByRole('button', { name: /Alpha/ }),
    );
    expect(alphaCard.getAttribute('aria-pressed')).toBe('true');
  });

  it('user clicks a card: clicking Charlie selects it and writes to storage', async () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withWorkspaceId('workspace-1')
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-alpha')
          .withTeamName('Alpha')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-charlie')
          .withTeamName('Charlie')
          .build(),
      ])
      .build();
    wireWorkspaceDashboard(dto, storage);

    renderAtPath('/dashboard');

    const charlieCard = await waitFor(() =>
      screen.getByRole('button', { name: /Charlie/ }),
    );
    fireEvent.click(charlieCard);

    await waitFor(() => {
      expect(charlieCard.getAttribute('aria-pressed')).toBe('true');
    });
    expect(storage.read('workspace-1')).toBe('team-charlie');
  });

  it('visual indicator active: selected card carries the team-card--selected class', async () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withWorkspaceId('workspace-1')
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-alpha')
          .withTeamName('Alpha')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-bravo')
          .withTeamName('Bravo')
          .build(),
      ])
      .build();
    wireWorkspaceDashboard(dto, storage);

    renderAtPath('/dashboard');

    const alphaCard = await waitFor(() =>
      screen.getByRole('button', { name: /Alpha/ }),
    );
    expect(alphaCard.className).toContain('team-card--selected');
    const bravoCard = screen.getByRole('button', { name: /Bravo/ });
    expect(bravoCard.className).not.toContain('team-card--selected');
  });

  it('workspace switch resets scope: each workspace keeps its own last selection independently', async () => {
    storage.write('workspace-1', 'team-alpha');
    storage.write('workspace-2', 'team-charlie');

    const dtoWorkspaceOne = new WorkspaceDashboardResponseBuilder()
      .withWorkspaceId('workspace-1')
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-alpha')
          .withTeamName('Alpha')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-bravo')
          .withTeamName('Bravo')
          .build(),
      ])
      .build();
    wireWorkspaceDashboard(dtoWorkspaceOne, storage);

    const firstRender = renderAtPath('/dashboard');

    await waitFor(() => {
      expect(
        screen
          .getByRole('button', { name: /Alpha/ })
          .getAttribute('aria-pressed'),
      ).toBe('true');
    });

    firstRender.unmount();

    const dtoWorkspaceTwo = new WorkspaceDashboardResponseBuilder()
      .withWorkspaceId('workspace-2')
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-bravo')
          .withTeamName('Bravo')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-charlie')
          .withTeamName('Charlie')
          .build(),
      ])
      .build();
    wireWorkspaceDashboard(dtoWorkspaceTwo, storage);

    renderAtPath('/dashboard');

    const charlieCard = await waitFor(() =>
      screen.getByRole('button', { name: /Charlie/ }),
    );
    expect(charlieCard.getAttribute('aria-pressed')).toBe('true');
  });

  it('language switch on empty state: French message appears after switching locale to fr', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ language: 'en' }),
      }),
    );
    const dto = new WorkspaceDashboardResponseBuilder()
      .withWorkspaceId('workspace-1')
      .withTeams([])
      .build();
    wireWorkspaceDashboard(dto, storage);

    renderWithLocaleProvider('/dashboard');

    await waitFor(() => {
      expect(
        screen.getByText(
          'No teams available. Connect Linear and select teams to sync first.',
        ),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'switch-to-fr' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Aucune équipe disponible. Connectez Linear et sélectionnez des équipes à synchroniser d'abord.",
        ),
      ).toBeInTheDocument();
    });
  });
});
