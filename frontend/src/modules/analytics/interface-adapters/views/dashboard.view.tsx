import '@/styles/dashboard.css';
import { useLocale } from '@/locale-context.tsx';
import { useDashboardPage } from '../hooks/use-dashboard-page.ts';
import { type SyncState } from '../hooks/use-sync-orchestrator.ts';
import {
  type DashboardTranslations,
  dashboardTranslations,
} from '../presenters/dashboard.translations.ts';
import { DashboardEmptyStateView } from './dashboard-empty-state.view.tsx';
import { DashboardEmptyTeamsView } from './dashboard-empty-teams.view.tsx';
import { DashboardErrorStateView } from './dashboard-error-state.view.tsx';
import { DashboardLoadingStateView } from './dashboard-loading-state.view.tsx';
import {
  type SyncProgressIndicator,
  SyncStatusBarView,
} from './sync-status-bar.view.tsx';
import { TeamCardView } from './team-card/team-card.view.tsx';
import { TeamCardIdleView } from './team-card/team-card-idle.view.tsx';
import { TopCycleAssigneesSectionView } from './top-cycle-assignees/top-cycle-assignees-section.view.tsx';
import { TopCycleProjectsSectionView } from './top-cycle-projects/top-cycle-projects-section.view.tsx';

export function DashboardView() {
  const locale = useLocale();
  const translations = dashboardTranslations[locale];
  const { dashboardState, syncState, startResync, retrySync, onSelectTeam } =
    useDashboardPage();
  const syncProgress = syncProgressFor(syncState, translations);

  return (
    <main data-testid="dashboard-page" className="container">
      <h1 className="page-title">{translations.pageTitle}</h1>
      {renderBody({
        state: dashboardState,
        translations,
        syncState,
        syncProgress,
        startResync,
        retrySync,
        onSelectTeam,
      })}
    </main>
  );
}

interface RenderBodyParams {
  state: ReturnType<typeof useDashboardPage>['dashboardState'];
  translations: DashboardTranslations;
  syncState: SyncState;
  syncProgress: SyncProgressIndicator | null;
  startResync: () => Promise<void>;
  retrySync: () => Promise<void>;
  onSelectTeam: (teamId: string) => void;
}

function renderBody({
  state,
  translations,
  syncState,
  syncProgress,
  startResync,
  retrySync,
  onSelectTeam,
}: RenderBodyParams) {
  if (state.status === 'loading') {
    return <DashboardLoadingStateView translations={translations} />;
  }
  if (state.status === 'error') {
    return (
      <DashboardErrorStateView
        message={state.message}
        translations={translations}
      />
    );
  }
  if (state.status === 'empty') {
    const onRetryClick =
      state.empty.kind === 'no_teams' && syncState.status === 'failed'
        ? retrySync
        : undefined;
    return (
      <DashboardEmptyStateView
        kind={state.empty.kind}
        message={state.empty.message}
        translations={translations}
        syncProgress={syncProgress}
        onRetryClick={onRetryClick}
      />
    );
  }
  return (
    <>
      <SyncStatusBarView
        synchronization={state.data.synchronization}
        resyncLabel={translations.resynchronize}
        onResyncClick={startResync}
        syncProgress={syncProgress}
      />
      {state.data.showEmptyTeamsMessage && state.data.emptyTeamsMessage ? (
        <DashboardEmptyTeamsView message={state.data.emptyTeamsMessage} />
      ) : (
        <div className="dashboard-layout">
          <div className="teams-grid">
            {state.data.teams.map((team) =>
              team.kind === 'active' ? (
                <TeamCardView
                  key={team.teamId}
                  team={team}
                  translations={translations}
                  onSelect={() => onSelectTeam(team.teamId)}
                />
              ) : (
                <TeamCardIdleView
                  key={team.teamId}
                  team={team}
                  onSelect={() => onSelectTeam(team.teamId)}
                />
              ),
            )}
          </div>
          <aside className="dashboard-right-column">
            <TopCycleProjectsSectionView teamId={state.data.selectedTeamId} />
            <TopCycleAssigneesSectionView teamId={state.data.selectedTeamId} />
          </aside>
        </div>
      )}
    </>
  );
}

function syncProgressFor(
  syncState: SyncState,
  translations: DashboardTranslations,
): SyncProgressIndicator | null {
  if (syncState.status !== 'running') return null;
  const stepLabel = stepLabelFor(syncState.step, translations);
  const attemptLabel =
    syncState.attempt > 1
      ? `${translations.syncRetryLabel} ${syncState.attempt}/3`
      : undefined;
  return { stepLabel, attemptLabel };
}

function stepLabelFor(
  step: 'teams' | 'selection' | 'reference' | 'issues',
  translations: DashboardTranslations,
): string {
  if (step === 'teams') return translations.syncStepTeams;
  if (step === 'selection') return translations.syncStepTeams;
  if (step === 'reference') return translations.syncStepReference;
  return translations.syncStepIssues;
}
