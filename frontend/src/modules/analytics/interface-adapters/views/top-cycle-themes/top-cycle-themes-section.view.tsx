import { useTopCycleThemes } from '../../hooks/use-top-cycle-themes.ts';
import { CycleInsightCardView } from '../cycle-insight-shell/cycle-insight-card.view.tsx';
import { CycleInsightMetricToggleView } from '../cycle-insight-shell/cycle-insight-metric-toggle.view.tsx';
import { TopCycleThemesDrawerView } from './top-cycle-themes-drawer.view.tsx';
import { TopCycleThemesErrorView } from './top-cycle-themes-error.view.tsx';
import { TopCycleThemesLoadingView } from './top-cycle-themes-loading.view.tsx';
import { TopCycleThemesReadyView } from './top-cycle-themes-ready.view.tsx';
import { TopCycleThemesRefreshButtonView } from './top-cycle-themes-refresh-button.view.tsx';

interface TopCycleThemesSectionViewProps {
  teamId: string | null;
}

export function TopCycleThemesSectionView({
  teamId,
}: TopCycleThemesSectionViewProps) {
  const {
    state,
    cardTitle,
    loadingMessage,
    loadingHint,
    drawerState,
    onMetricChange,
    onRowClick,
    onDrawerClose,
    onRefreshClick,
  } = useTopCycleThemes({ teamId });

  if (teamId === null) {
    return null;
  }

  const showMetricToggle =
    state.status === 'ready' && state.data.showMetricToggle;
  const metricToggle = showMetricToggle ? (
    <CycleInsightMetricToggleView
      activeMetric={state.data.metricToggle.activeMetric}
      countLabel={state.data.metricToggle.countLabel}
      pointsLabel={state.data.metricToggle.pointsLabel}
      timeLabel={state.data.metricToggle.timeLabel}
      onChange={onMetricChange}
    />
  ) : null;
  const showRefreshButton =
    state.status === 'ready' && state.data.showRefreshButton;
  const headerAction = showRefreshButton ? (
    <TopCycleThemesRefreshButtonView
      label={state.data.refreshLabel}
      onClick={onRefreshClick}
    />
  ) : null;

  return (
    <>
      <CycleInsightCardView
        title={cardTitle}
        headerAction={headerAction}
        metricToggle={metricToggle}
      >
        {state.status === 'loading' && (
          <TopCycleThemesLoadingView
            message={loadingMessage}
            hint={loadingHint}
          />
        )}
        {state.status === 'error' && (
          <TopCycleThemesErrorView message={state.message} />
        )}
        {state.status === 'ready' && (
          <TopCycleThemesReadyView
            viewModel={state.data}
            onRowClick={onRowClick}
          />
        )}
      </CycleInsightCardView>
      <TopCycleThemesDrawerView
        viewModel={drawerState}
        onClose={onDrawerClose}
      />
    </>
  );
}
