import '@/styles/dashboard.css';
import { useLocale } from '@/locale-context.tsx';
import { useDashboard } from '../hooks/use-dashboard.ts';
import { dashboardTranslations } from '../presenters/dashboard.translations.ts';
import { DashboardEmptyStateView } from './dashboard-empty-state.view.tsx';
import { DashboardErrorStateView } from './dashboard-error-state.view.tsx';
import { DashboardLoadingStateView } from './dashboard-loading-state.view.tsx';
import { SyncStatusBarView } from './sync-status-bar.view.tsx';
import { TeamCardView } from './team-card.view.tsx';
import { TeamCardIdleView } from './team-card-idle.view.tsx';

export function DashboardView() {
  const locale = useLocale();
  const translations = dashboardTranslations[locale];
  const { state } = useDashboard();

  return (
    <main data-testid="dashboard-page" className="container">
      <h1 className="page-title">{translations.pageTitle}</h1>
      {renderBody(state, translations)}
    </main>
  );
}

function renderBody(
  state: ReturnType<typeof useDashboard>['state'],
  translations: typeof dashboardTranslations.en,
) {
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
    return (
      <DashboardEmptyStateView
        kind={state.empty.kind}
        message={state.empty.message}
        translations={translations}
      />
    );
  }
  return (
    <>
      <SyncStatusBarView
        synchronization={state.data.synchronization}
        resyncLabel={translations.resynchronize}
        onResyncClick={noop}
      />
      <div className="teams-grid">
        {state.data.teams.map((team) =>
          team.kind === 'active' ? (
            <TeamCardView
              key={team.teamId}
              team={team}
              translations={translations}
            />
          ) : (
            <TeamCardIdleView key={team.teamId} team={team} />
          ),
        )}
      </div>
    </>
  );
}

function noop() {}
